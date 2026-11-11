export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'HELD';
export type ReconciliationStatus = 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'UNMATCHED' | 'MANUAL_REVIEW' | 'RECONCILED' | 'REJECTED';
export type InvoiceStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SettlementActionType = 'CAPTURE_FUNDS' | 'ISSUE_REFUND' | 'ALLOCATE_PARTIAL' | 'RESOLVE_DISCREPANCY' | 'VOID_DUPLICATE';
export type SettlementApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  paypalPayerId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  description: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paypalReferenceId?: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  invoiceReference?: string;
  reconciliationStatus: ReconciliationStatus;
  reconciliationScore?: number;
  matchedInvoiceId?: string;
  riskIndicator: RiskLevel;
  source: 'SANDBOX' | 'DEMO';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationScoreBreakdown {
  invoiceRefScore: number;    // Max 35
  amountScore: number;        // Max 30
  customerScore: number;      // Max 15
  dateProximityScore: number; // Max 10
  descSimilarityScore: number;// Max 10
  totalScore: number;         // Max 100
  confidenceTier: 'HIGH' | 'REVIEW_RECOMMENDED' | 'MANUAL_INVESTIGATION';
}

export interface ReconciliationMatch {
  id: string;
  runId: string;
  transactionId: string;
  invoiceId: string;
  score: number;
  confidenceTier: 'HIGH' | 'REVIEW_RECOMMENDED' | 'MANUAL_INVESTIGATION';
  breakdown: ReconciliationScoreBreakdown;
  matchType: 'EXACT' | 'PARTIAL' | 'AMOUNT_MISMATCH' | 'MULTIPLE_CANDIDATES';
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED';
  userNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ReconciliationRun {
  id: string;
  runTimestamp: string;
  totalTransactionsProcessed: number;
  exactMatchesCount: number;
  reviewRecommendedCount: number;
  unmatchedCount: number;
  totalReconciledAmount: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
}

export interface AnomalyAlert {
  id: string;
  type: 'DUPLICATE_PAYMENT' | 'UNUSUAL_AMOUNT' | 'CURRENCY_MISMATCH' | 'REPEATED_FAILED_ATTEMPTS' | 'INVOICE_DISCREPANCY' | 'ORPHAN_UNMATCHED';
  severity: AnomalySeverity;
  transactionId: string;
  invoiceId?: string;
  title: string;
  description: string;
  evidence: string[];
  aiExplanation?: string;
  suggestedResolution?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  detectedAt: string;
  resolvedAt?: string;
}

export interface AIInvestigation {
  id: string;
  transactionId: string;
  invoiceId?: string;
  summary: string;
  issue_type: string;
  risk_level: RiskLevel;
  confidence: number;
  evidence: string[];
  recommended_actions: string[];
  requires_human_review: boolean;
  rawAnalysis?: string;
  createdAt: string;
}

export interface SettlementRecommendation {
  id: string;
  actionType: SettlementActionType;
  title: string;
  description: string;
  transactionId?: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  aiRationale: string;
  riskAssessment: string;
  approvalStatus: SettlementApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  executionResult?: {
    paypalResponseId?: string;
    status: string;
    executedAt: string;
    details?: string;
  };
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  category: 'RECONCILIATION' | 'SETTLEMENT' | 'PAYPAL' | 'AI_INVESTIGATION' | 'INVOICE' | 'SYSTEM';
  details: string;
  actor: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface WebhookEventRecord {
  id: string;
  eventId: string;
  eventType: string;
  summary: string;
  resourceId?: string;
  status: 'PROCESSED' | 'VERIFIED' | 'FAILED' | 'DUPLICATE';
  rawPayload: Record<string, unknown>;
  receivedAt: string;
}
