import axios from 'axios';
import {
  OverviewStatsResponse,
  Transaction,
  Invoice,
  ReconciliationRun,
  ReconciliationMatch,
  AnomalyAlert,
  AIInvestigation,
  SettlementRecommendation,
  AuditLog
} from './types';

const client = axios.create({
  baseURL: '',
  timeout: 30000,
});

export const api = {
  // Stats & Dashboard
  getOverviewStats: async (): Promise<OverviewStatsResponse> => {
    const res = await client.get<OverviewStatsResponse>('/api/overview/stats');
    return res.data;
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    const res = await client.get<Transaction[]>('/api/transactions');
    return res.data;
  },

  getTransactionDetail: async (id: string): Promise<{
    transaction: Transaction;
    linkedInvoice?: Invoice;
    auditLogs: AuditLog[];
    latestInvestigation?: AIInvestigation;
  }> => {
    const res = await client.get(`/api/transactions/${id}`);
    return res.data;
  },

  createTransaction: async (data: Partial<Transaction>): Promise<Transaction> => {
    const res = await client.post<Transaction>('/api/transactions', data);
    return res.data;
  },

  // Invoices
  getInvoices: async (): Promise<Invoice[]> => {
    const res = await client.get<Invoice[]>('/api/invoices');
    return res.data;
  },

  getInvoiceDetail: async (id: string): Promise<{
    invoice: Invoice;
    associatedTransactions: Transaction[];
  }> => {
    const res = await client.get(`/api/invoices/${id}`);
    return res.data;
  },

  createInvoice: async (data: Partial<Invoice>): Promise<Invoice> => {
    const res = await client.post<Invoice>('/api/invoices', data);
    return res.data;
  },

  // Reconciliation
  runReconciliation: async (): Promise<{
    run: ReconciliationRun;
    matches: ReconciliationMatch[];
  }> => {
    const res = await client.post('/api/reconciliation/run');
    return res.data;
  },

  getReconciliationRuns: async (): Promise<ReconciliationRun[]> => {
    const res = await client.get<ReconciliationRun[]>('/api/reconciliation/runs');
    return res.data;
  },

  getReconciliationMatches: async (): Promise<ReconciliationMatch[]> => {
    const res = await client.get<ReconciliationMatch[]>('/api/reconciliation/matches');
    return res.data;
  },

  reviewMatch: async (matchId: string, status: 'APPROVED' | 'REJECTED', reviewedBy: string, notes?: string): Promise<ReconciliationMatch> => {
    const res = await client.post<ReconciliationMatch>(`/api/reconciliation/matches/${matchId}/review`, {
      status,
      reviewedBy,
      notes
    });
    return res.data;
  },

  // Anomalies
  getAnomalies: async (): Promise<AnomalyAlert[]> => {
    const res = await client.get<AnomalyAlert[]>('/api/anomalies');
    return res.data;
  },

  detectAnomalies: async (): Promise<AnomalyAlert[]> => {
    const res = await client.post<AnomalyAlert[]>('/api/anomalies/detect');
    return res.data;
  },

  // Settlements
  getSettlements: async (): Promise<SettlementRecommendation[]> => {
    const res = await client.get<SettlementRecommendation[]>('/api/settlements');
    return res.data;
  },

  approveSettlement: async (id: string, decision: 'APPROVE' | 'REJECT', approvedBy: string, note?: string): Promise<SettlementRecommendation> => {
    const res = await client.post<SettlementRecommendation>(`/api/settlements/${id}/approve`, {
      decision,
      approvedBy,
      note
    });
    return res.data;
  },

  // AI
  investigateTransaction: async (transactionId: string): Promise<AIInvestigation> => {
    const res = await client.post<AIInvestigation>('/api/ai/investigate-transaction', { transactionId });
    return res.data;
  },

  sendAIChat: async (message: string): Promise<{
    reply: string;
    suggestedQuestions?: string[];
    referencedTransactions?: string[];
    referencedInvoices?: string[];
  }> => {
    const res = await client.post('/api/ai/chat', { message });
    return res.data;
  },

  // PayPal
  getPayPalStatus: async (): Promise<{
    status: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
    message: string;
    baseUrl: string;
    hasCredentials: boolean;
    webhookIdConfigured: boolean;
  }> => {
    const res = await client.get('/api/paypal/status');
    return res.data;
  },

  createPayPalOrder: async (params: {
    amount: number;
    currency?: string;
    invoiceId?: string;
    description?: string;
  }): Promise<{
    orderId: string;
    status: string;
    approveUrl?: string;
    source: 'SANDBOX' | 'DEMO';
  }> => {
    const res = await client.post('/api/paypal/create-order', params);
    return res.data;
  },

  capturePayPalPayment: async (orderId: string): Promise<{
    captureId: string;
    orderId: string;
    status: string;
    amount: number;
    currency: string;
    transaction: Transaction;
    source: 'SANDBOX' | 'DEMO';
  }> => {
    const res = await client.post('/api/paypal/capture-order', { orderId });
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await client.get<AuditLog[]>('/api/audit-logs');
    return res.data;
  },

  // Demo & Reset
  resetDemoData: async (): Promise<void> => {
    await client.post('/api/demo/seed');
  }
};
