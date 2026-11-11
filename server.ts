import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import { db } from './server/db';
import { runReconciliationBatch } from './server/reconciliationEngine';
import { runAnomalyDetection } from './server/anomalyEngine';
import { investigateTransactionWithGemini, askAIFinanceAssistant } from './server/geminiService';
import {
  checkPayPalConnectionStatus,
  createPayPalOrder,
  capturePayPalPayment,
  processWebhookEvent
} from './server/paypalService';
import { executeSettlementApproval } from './server/settlementEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, paypal-auth-algo, paypal-cert-url, paypal-transmission-id, paypal-transmission-sig, paypal-transmission-time');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// ==========================================
// API ROUTES
// ==========================================

// 1. Overview Dashboard Stats (Calculated from DB, never hardcoded)
app.get('/api/overview/stats', (req: Request, res: Response) => {
  const transactions = db.getTransactions();
  const invoices = db.getInvoices();
  const anomalies = db.getAnomalies();
  const settlements = db.getSettlements();

  const completedTxns = transactions.filter(t => t.paymentStatus === 'COMPLETED');
  const totalPaymentVolume = completedTxns.reduce((sum, t) => sum + t.amount, 0);

  const reconciledTxns = transactions.filter(t => t.reconciliationStatus === 'RECONCILED');
  const reconciledAmount = reconciledTxns.reduce((sum, t) => sum + t.amount, 0);

  const unmatchedTxns = transactions.filter(t => t.reconciliationStatus === 'UNMATCHED');
  const unmatchedTransactionsCount = unmatchedTxns.length;
  const unmatchedAmount = unmatchedTxns.reduce((sum, t) => sum + t.amount, 0);

  const openInvoices = invoices.filter(i => i.status === 'UNPAID' || i.status === 'PARTIALLY_PAID' || i.status === 'OVERDUE');
  const outstandingInvoicesAmount = openInvoices.reduce((sum, i) => sum + i.remainingAmount, 0);

  const totalEligibleCount = completedTxns.length || 1;
  const reconciliationRate = parseFloat(((reconciledTxns.length / totalEligibleCount) * 100).toFixed(1));

  const openAnomalies = anomalies.filter(a => a.status === 'OPEN');
  const potentialAnomaliesCount = openAnomalies.length;

  // Chart data: Payment Volume over time (last 14 days)
  const volumeByDateMap = new Map<string, { date: string; volume: number; reconciledVolume: number; count: number }>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    volumeByDateMap.set(d, { date: d.slice(5), volume: 0, reconciledVolume: 0, count: 0 });
  }

  for (const t of transactions) {
    if (t.paymentStatus === 'COMPLETED') {
      const dateKey = t.paymentDate.split('T')[0];
      if (volumeByDateMap.has(dateKey)) {
        const item = volumeByDateMap.get(dateKey)!;
        item.volume += t.amount;
        item.count += 1;
        if (t.reconciliationStatus === 'RECONCILED') {
          item.reconciledVolume += t.amount;
        }
      }
    }
  }

  const volumeOverTime = Array.from(volumeByDateMap.values());

  // Invoice Status Distribution
  const invoiceStatusDistribution = [
    { name: 'Paid', value: invoices.filter(i => i.status === 'PAID').length, amount: invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0) },
    { name: 'Partially Paid', value: invoices.filter(i => i.status === 'PARTIALLY_PAID').length, amount: invoices.filter(i => i.status === 'PARTIALLY_PAID').reduce((s, i) => s + i.remainingAmount, 0) },
    { name: 'Unpaid', value: invoices.filter(i => i.status === 'UNPAID').length, amount: invoices.filter(i => i.status === 'UNPAID').reduce((s, i) => s + i.remainingAmount, 0) },
    { name: 'Overdue', value: invoices.filter(i => i.status === 'OVERDUE').length, amount: invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.remainingAmount, 0) }
  ];

  res.json({
    kpis: {
      totalPaymentVolume,
      reconciledAmount,
      unmatchedTransactionsCount,
      unmatchedAmount,
      outstandingInvoicesAmount,
      outstandingInvoicesCount: openInvoices.length,
      reconciliationRate,
      potentialAnomaliesCount,
      pendingSettlementsCount: settlements.filter(s => s.approvalStatus === 'PENDING_APPROVAL').length
    },
    charts: {
      volumeOverTime,
      invoiceStatusDistribution
    },
    recentTransactions: transactions.slice(0, 7),
    pendingReconciliationQueue: transactions.filter(t => t.reconciliationStatus === 'MANUAL_REVIEW' || t.reconciliationStatus === 'UNMATCHED').slice(0, 6),
    criticalAlerts: openAnomalies.slice(0, 4)
  });
});

// 2. Transactions API
app.get('/api/transactions', (req: Request, res: Response) => {
  const transactions = db.getTransactions();
  res.json(transactions);
});

app.get('/api/transactions/:id', (req: Request, res: Response) => {
  const txn = db.getTransactionById(req.params.id);
  if (!txn) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }
  const linkedInvoice = txn.matchedInvoiceId ? db.getInvoiceById(txn.matchedInvoiceId) : undefined;
  const auditLogs = db.getAuditLogs().filter(a => a.targetId === txn.id || a.targetId === txn.transactionId);
  const investigations = db.getAIInvestigations().filter(i => i.transactionId === txn.id);

  res.json({
    transaction: txn,
    linkedInvoice,
    auditLogs,
    latestInvestigation: investigations[0]
  });
});

app.post('/api/transactions', (req: Request, res: Response) => {
  const body = req.body;
  const newTxn = {
    id: `TXN-${Date.now()}`,
    transactionId: body.transactionId || `PAYPAL-TXN-${Date.now().toString().slice(-6)}`,
    paypalOrderId: body.paypalOrderId,
    paypalCaptureId: body.paypalCaptureId,
    customerName: body.customerName || 'Anonymous Payer',
    customerEmail: body.customerEmail || 'payer@example.com',
    amount: parseFloat(body.amount) || 0,
    currency: body.currency || 'USD',
    paymentDate: body.paymentDate || new Date().toISOString(),
    paymentStatus: body.paymentStatus || 'COMPLETED',
    paymentMethod: body.paymentMethod || 'PayPal Express',
    invoiceReference: body.invoiceReference,
    reconciliationStatus: 'UNMATCHED' as const,
    riskIndicator: 'LOW' as const,
    source: (body.source === 'SANDBOX' ? 'SANDBOX' : 'DEMO') as 'SANDBOX' | 'DEMO',
    notes: body.notes || 'Imported manual transaction',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.saveTransaction(newTxn);
  db.addAuditLog({
    action: 'TRANSACTION_CREATED',
    category: 'SYSTEM',
    details: `Manual transaction ${newTxn.transactionId} created for $${newTxn.amount.toFixed(2)} ${newTxn.currency}.`,
    actor: 'user',
    targetId: newTxn.id,
    targetType: 'Transaction'
  });

  res.status(201).json(newTxn);
});

// 3. Invoices API
app.get('/api/invoices', (req: Request, res: Response) => {
  const invoices = db.getInvoices();
  res.json(invoices);
});

app.get('/api/invoices/:id', (req: Request, res: Response) => {
  const inv = db.getInvoiceById(req.params.id);
  if (!inv) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }
  const associatedTransactions = db.getTransactions().filter(t => t.matchedInvoiceId === inv.id || t.invoiceReference === inv.invoiceNumber);
  res.json({ invoice: inv, associatedTransactions });
});

app.post('/api/invoices', (req: Request, res: Response) => {
  const b = req.body;
  const amount = parseFloat(b.amount) || 0;
  const count = db.getInvoices().length + 1;
  const newInv = {
    id: `INV-${Date.now().toString().slice(-4)}`,
    invoiceNumber: b.invoiceNumber || `INV-2026-${count.toString().padStart(3, '0')}`,
    customerId: b.customerId || 'CUST-001',
    customerName: b.customerName || 'Customer Client',
    customerEmail: b.customerEmail || 'client@example.com',
    amount,
    paidAmount: 0.00,
    remainingAmount: amount,
    currency: b.currency || 'USD',
    issueDate: b.issueDate || new Date().toISOString().split('T')[0],
    dueDate: b.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'UNPAID' as const,
    description: b.description || 'Professional Services',
    lineItems: b.lineItems || [{ description: b.description || 'Professional Services', quantity: 1, unitPrice: amount, total: amount }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.saveInvoice(newInv);
  db.addAuditLog({
    action: 'INVOICE_CREATED',
    category: 'INVOICE',
    details: `Invoice ${newInv.invoiceNumber} created for $${newInv.amount.toFixed(2)} ${newInv.currency} (Customer: ${newInv.customerName}).`,
    actor: 'user',
    targetId: newInv.id,
    targetType: 'Invoice'
  });

  res.status(201).json(newInv);
});

// 4. Reconciliation Engine API
app.post('/api/reconciliation/run', (req: Request, res: Response) => {
  const result = runReconciliationBatch();
  res.json(result);
});

app.get('/api/reconciliation/runs', (req: Request, res: Response) => {
  res.json(db.getReconciliationRuns());
});

app.get('/api/reconciliation/matches', (req: Request, res: Response) => {
  const matches = db.getReconciliationMatches();
  res.json(matches);
});

app.post('/api/reconciliation/matches/:id/review', (req: Request, res: Response) => {
  const { status, reviewedBy, notes } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
    return;
  }
  const updated = db.updateMatchStatus(req.params.id, status, reviewedBy || 'Current User', notes);
  if (!updated) {
    res.status(404).json({ error: 'Match record not found' });
    return;
  }
  res.json(updated);
});

// 5. Anomaly Detection API
app.get('/api/anomalies', (req: Request, res: Response) => {
  res.json(db.getAnomalies());
});

app.post('/api/anomalies/detect', (req: Request, res: Response) => {
  const anomalies = runAnomalyDetection();
  res.json(anomalies);
});

// 6. Settlement Center API (Human Approval Workflow)
app.get('/api/settlements', (req: Request, res: Response) => {
  res.json(db.getSettlements());
});

app.post('/api/settlements/:id/approve', (req: Request, res: Response) => {
  const { decision, approvedBy, note } = req.body;
  if (!['APPROVE', 'REJECT'].includes(decision)) {
    res.status(400).json({ error: 'Decision must be APPROVE or REJECT' });
    return;
  }
  try {
    const updated = executeSettlementApproval(req.params.id, decision, approvedBy || 'Authorized CFO', note);
    res.json(updated);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// 7. Gemini AI Intelligence API
app.post('/api/ai/investigate-transaction', async (req: Request, res: Response) => {
  const { transactionId } = req.body;
  if (!transactionId) {
    res.status(400).json({ error: 'transactionId is required' });
    return;
  }
  try {
    const result = await investigateTransactionWithGemini(transactionId);
    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }
  try {
    const response = await askAIFinanceAssistant(message);
    res.json(response);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// 8. PayPal Sandbox Integration API
app.get('/api/paypal/status', async (req: Request, res: Response) => {
  const status = await checkPayPalConnectionStatus();
  res.json(status);
});

app.post('/api/paypal/create-order', async (req: Request, res: Response) => {
  try {
    const order = await createPayPalOrder(req.body);
    res.json(order);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.post('/api/paypal/capture-order', async (req: Request, res: Response) => {
  const { orderId } = req.body;
  if (!orderId) {
    res.status(400).json({ error: 'orderId is required' });
    return;
  }
  try {
    const result = await capturePayPalPayment(orderId);
    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.post('/api/paypal/webhook', async (req: Request, res: Response) => {
  try {
    const headers = req.headers as Record<string, string>;
    const result = await processWebhookEvent(headers, req.body);
    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// 9. Audit Logs API
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

// 10. Demo Re-seed & CSV Export
app.post('/api/demo/seed', (req: Request, res: Response) => {
  const resetData = db.resetToSeed();
  res.json({ message: 'Database reset to initial demo workspace with 25 invoices and 35 transactions.', snapshot: resetData });
});

app.get('/api/export/csv', (req: Request, res: Response) => {
  const type = req.query.type as string;
  let csv = '';

  if (type === 'invoices') {
    const invoices = db.getInvoices();
    csv = 'Invoice Number,Customer,Amount,Paid Amount,Remaining Amount,Currency,Issue Date,Due Date,Status\n';
    for (const i of invoices) {
      csv += `"${i.invoiceNumber}","${i.customerName}",${i.amount},${i.paidAmount},${i.remainingAmount},"${i.currency}","${i.issueDate}","${i.dueDate}","${i.status}"\n`;
    }
  } else {
    const txns = db.getTransactions();
    csv = 'Transaction ID,PayPal Order,Customer,Amount,Currency,Date,Status,Invoice Ref,Reconciliation Status,Risk,Source\n';
    for (const t of txns) {
      csv += `"${t.transactionId}","${t.paypalOrderId || ''}","${t.customerName}",${t.amount},"${t.currency}","${t.paymentDate}","${t.paymentStatus}","${t.invoiceReference || ''}","${t.reconciliationStatus}","${t.riskIndicator}","${t.source}"\n`;
    }
  }

  res.header('Content-Type', 'text/csv');
  res.attachment(`settlewise-${type || 'transactions'}-${Date.now()}.csv`);
  res.send(csv);
});

// ==========================================
// VITE INTEGRATION
// ==========================================
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SettleWise AI Server running at http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer();
