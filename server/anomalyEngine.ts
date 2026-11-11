import { db } from './db';
import { AnomalyAlert, Transaction, Invoice } from './types';

export function runAnomalyDetection(): AnomalyAlert[] {
  const transactions = db.getTransactions();
  const invoices = db.getInvoices();
  const existingAnomalies = db.getAnomalies();
  const newAnomalies: AnomalyAlert[] = [];

  // Helper to check if anomaly already exists for this txn & type
  const hasAnomaly = (txnId: string, type: AnomalyAlert['type']) => {
    return existingAnomalies.some(a => a.transactionId === txnId && a.type === type);
  };

  // 1. Detect Duplicate Payments (same amount, same customer or payer, within 48h)
  const sortedTxns = [...transactions].sort(
    (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
  );

  for (let i = 0; i < sortedTxns.length; i++) {
    for (let j = i + 1; j < sortedTxns.length; j++) {
      const t1 = sortedTxns[i];
      const t2 = sortedTxns[j];

      if (t1.amount === t2.amount && t1.amount > 0) {
        const timeDiffHours = Math.abs(
          new Date(t2.paymentDate).getTime() - new Date(t1.paymentDate).getTime()
        ) / (1000 * 60 * 60);

        const sameCustomer = (t1.customerId && t2.customerId && t1.customerId === t2.customerId) ||
          (t1.customerEmail && t2.customerEmail && t1.customerEmail.toLowerCase() === t2.customerEmail.toLowerCase()) ||
          (t1.customerName && t2.customerName && t1.customerName.toLowerCase() === t2.customerName.toLowerCase());

        if (timeDiffHours <= 48 && sameCustomer && !hasAnomaly(t2.id, 'DUPLICATE_PAYMENT')) {
          const alert: AnomalyAlert = {
            id: `ANOM-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 100)}`,
            type: 'DUPLICATE_PAYMENT',
            severity: 'CRITICAL',
            transactionId: t2.id,
            invoiceId: t2.matchedInvoiceId || t1.matchedInvoiceId,
            title: `Potential Duplicate Payment: $${t2.amount.toFixed(2)} from ${t2.customerName}`,
            description: `Transaction ${t2.transactionId} has the identical amount and payer identity as transaction ${t1.transactionId} captured within ${(timeDiffHours * 60).toFixed(0)} minutes.`,
            evidence: [
              `Identical amount: $${t2.amount.toFixed(2)} USD`,
              `Prior Transaction ID: ${t1.transactionId} at ${t1.paymentDate}`,
              `Duplicate Candidate ID: ${t2.transactionId} at ${t2.paymentDate}`,
              `Payer: ${t2.customerName} (${t2.customerEmail})`
            ],
            aiExplanation: 'Automated heuristics detect high probability of browser double-submission or automated retry race condition.',
            suggestedResolution: 'Hold settlement funds and initiate duplicate void or refund through PayPal Sandbox.',
            status: 'OPEN',
            detectedAt: new Date().toISOString()
          };
          db.saveAnomaly(alert);
          newAnomalies.push(alert);
        }
      }
    }
  }

  // 2. Unusual Amount Spikes (e.g. > 3x average)
  const amounts = transactions.map(t => t.amount).filter(a => a > 0);
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / (amounts.length || 1);
  const spikeThreshold = Math.max(20000, avgAmount * 3.5);

  for (const t of transactions) {
    if (t.amount > spikeThreshold && !hasAnomaly(t.id, 'UNUSUAL_AMOUNT')) {
      const alert: AnomalyAlert = {
        id: `ANOM-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 100)}`,
        type: 'UNUSUAL_AMOUNT',
        severity: 'HIGH',
        transactionId: t.id,
        title: `Outlier High-Volume Transaction: $${t.amount.toFixed(2)} from ${t.customerName}`,
        description: `Transaction amount exceeds typical volume threshold of $${spikeThreshold.toFixed(2)} (mean: $${avgAmount.toFixed(2)}).`,
        evidence: [
          `Volume: $${t.amount.toFixed(2)} ${t.currency}`,
          `Mean transaction volume: $${avgAmount.toFixed(2)} USD`,
          `Deviation: ${(t.amount / avgAmount).toFixed(1)}x typical transaction size`
        ],
        aiExplanation: 'Large payment volume outlier detected. Heuristic flag to verify contract terms before automated settlement.',
        suggestedResolution: 'Perform compliance audit and verify associated master services agreement.',
        status: 'OPEN',
        detectedAt: new Date().toISOString()
      };
      db.saveAnomaly(alert);
      newAnomalies.push(alert);
    }
  }

  // 3. Currency Mismatches
  for (const t of transactions) {
    if (t.matchedInvoiceId) {
      const inv = invoices.find(i => i.id === t.matchedInvoiceId);
      if (inv && inv.currency !== t.currency && !hasAnomaly(t.id, 'CURRENCY_MISMATCH')) {
        const alert: AnomalyAlert = {
          id: `ANOM-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 100)}`,
          type: 'CURRENCY_MISMATCH',
          severity: 'HIGH',
          transactionId: t.id,
          invoiceId: inv.id,
          title: `Currency Discrepancy: ${t.currency} paid for ${inv.currency} Invoice`,
          description: `Transaction was processed in ${t.currency} while invoice ${inv.invoiceNumber} is denominated in ${inv.currency}.`,
          evidence: [
            `Payment Currency: ${t.currency}`,
            `Invoice Currency: ${inv.currency}`,
            `Payment Amount: ${t.amount} ${t.currency}`,
            `Invoice Amount: ${inv.amount} ${inv.currency}`
          ],
          aiExplanation: 'Cross-currency remittance requires FX adjustment to prevent unallocated ledger variance.',
          suggestedResolution: 'Apply real-time FX spot conversion and record FX gain/loss adjustment.',
          status: 'OPEN',
          detectedAt: new Date().toISOString()
        };
        db.saveAnomaly(alert);
        newAnomalies.push(alert);
      }
    }
  }

  return db.getAnomalies();
}
