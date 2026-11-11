import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Sparkles,
  CreditCard,
  FileText,
  Clock,
  ArrowLeftRight,
  Sliders,
  Check
} from 'lucide-react';
import {
  Transaction,
  Invoice,
  ReconciliationMatch,
  ReconciliationRun
} from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface ReconciliationViewProps {
  transactions: Transaction[];
  invoices: Invoice[];
  onRefreshData: () => void;
  onSelectTransaction: (txnId: string) => void;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  transactions,
  invoices,
  onRefreshData,
  onSelectTransaction
}) => {
  const { showToast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [queueFilter, setQueueFilter] = useState<'REVIEW' | 'UNMATCHED' | 'PARTIAL' | 'EXACT' | 'ALL'>('REVIEW');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  const [matches, setMatches] = useState<ReconciliationMatch[]>([]);
  const [runs, setRuns] = useState<ReconciliationRun[]>([]);
  const [reviewNote, setReviewNote] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    loadReconciliationData();
  }, []);

  const loadReconciliationData = async () => {
    try {
      const [matchesRes, runsRes] = await Promise.all([
        api.getReconciliationMatches(),
        api.getReconciliationRuns()
      ]);
      setMatches(matchesRes);
      setRuns(runsRes);

      // Auto select first transaction needing review if none selected
      if (!selectedTxnId) {
        const firstReview = transactions.find(t => t.reconciliationStatus === 'MANUAL_REVIEW');
        if (firstReview) {
          setSelectedTxnId(firstReview.id);
        } else if (transactions.length > 0) {
          setSelectedTxnId(transactions[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load reconciliation records:', err);
    }
  };

  const handleRunBatch = async () => {
    setIsRunning(true);
    try {
      const res = await api.runReconciliation();
      showToast(
        `Batch ${res.run.id} Completed`,
        `Matched ${res.run.exactMatchesCount} exact, proposed ${res.run.reviewRecommendedCount} for human review. Total: $${res.run.totalReconciledAmount.toFixed(2)} USD`,
        'success'
      );
      await loadReconciliationData();
      onRefreshData();
    } catch (err) {
      console.error('Run reconciliation failed:', err);
      showToast('Reconciliation Execution Failed', 'Error running deterministic matching engine', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleReviewDecision = async (matchId: string, decision: 'APPROVED' | 'REJECTED') => {
    setIsProcessingAction(true);
    try {
      await api.reviewMatch(matchId, decision, 'Tanya Garg (CFO)', reviewNote || undefined);
      showToast(
        decision === 'APPROVED' ? 'Match Approved & Settled' : 'Match Rejected',
        `Reconciliation status updated in ledger and audit trail logged.`,
        decision === 'APPROVED' ? 'success' : 'info'
      );
      setReviewNote('');
      await loadReconciliationData();
      onRefreshData();
    } catch (err) {
      console.error('Review match failed:', err);
      showToast('Error Recording Decision', 'Could not update match status', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Filter queue items
  const queueItems = transactions.filter((t) => {
    if (queueFilter === 'REVIEW' && t.reconciliationStatus !== 'MANUAL_REVIEW') return false;
    if (queueFilter === 'UNMATCHED' && t.reconciliationStatus !== 'UNMATCHED') return false;
    if (queueFilter === 'PARTIAL' && t.reconciliationStatus !== 'PARTIAL_MATCH') return false;
    if (queueFilter === 'EXACT' && t.reconciliationStatus !== 'RECONCILED' && t.reconciliationStatus !== 'EXACT_MATCH') return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return t.transactionId.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        (t.invoiceReference && t.invoiceReference.toLowerCase().includes(q));
    }
    return true;
  });

  const selectedTransaction = transactions.find(t => t.id === selectedTxnId) || queueItems[0] || transactions[0];
  const matchedInvoice = selectedTransaction?.matchedInvoiceId
    ? invoices.find(i => i.id === selectedTransaction.matchedInvoiceId)
    : undefined;
  const currentMatch = selectedTransaction
    ? matches.find(m => m.transactionId === selectedTransaction.id)
    : undefined;

  const score = currentMatch?.score ?? (selectedTransaction?.reconciliationScore || 0);
  const variance = matchedInvoice && selectedTransaction
    ? (selectedTransaction.amount - matchedInvoice.remainingAmount)
    : 0;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Studio Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#5B55E7] bg-[#EFEDFF] px-2 py-0.5 rounded uppercase font-mono">
              Deterministic Invariant Engine
            </span>
            <span className="text-xs text-[#748097]">·</span>
            <span className="text-xs text-[#748097]">3-Way Match & Risk Classification</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#18243A] mt-1">
            Reconciliation Studio
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8EAF2] rounded-xl text-xs font-mono text-[#748097]">
            <span>Active Batch: <strong className="text-[#18243A]">{runs[0]?.id || 'RUN-DEFAULT'}</strong></span>
          </div>

          <button
            onClick={handleRunBatch}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-[#18243A] hover:bg-[#233350] active:scale-[0.98] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Zap className={`w-3.5 h-3.5 text-[#5B55E7] ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Calculating Weighted Scores...' : 'Execute Reconciliation Run'}</span>
          </button>
        </div>
      </div>

      {/* THREE-PANEL RECONCILIATION WORKSTATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* ======================================================== */}
        {/* PANEL 1: LEFT PANEL — Queue & Filter Selector (3.5 cols) */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 card-elevated rounded-2xl flex flex-col overflow-hidden max-h-[750px]">
          {/* Panel Header & Filter Tabs */}
          <div className="p-4 border-b border-[#E8EAF2] space-y-3 bg-[#FBFBFE]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#18243A] uppercase tracking-wider">
                Reconciliation Queue
              </span>
              <span className="text-[11px] font-mono text-[#748097]">
                {queueItems.length} items
              </span>
            </div>

            {/* Quick Search in Queue */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#748097]" />
              <input
                type="text"
                placeholder="Filter by customer, ID or invoice..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8EAF2] rounded-lg text-xs text-[#18243A] placeholder-[#748097] focus:outline-none focus:border-[#5B55E7]"
              />
            </div>

            {/* Segmented Queue Filter Buttons */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-[11px]">
              {[
                { id: 'REVIEW', label: 'Review', count: transactions.filter(t => t.reconciliationStatus === 'MANUAL_REVIEW').length },
                { id: 'UNMATCHED', label: 'Unmatched', count: transactions.filter(t => t.reconciliationStatus === 'UNMATCHED').length },
                { id: 'PARTIAL', label: 'Partial', count: transactions.filter(t => t.reconciliationStatus === 'PARTIAL_MATCH').length },
                { id: 'EXACT', label: 'Settled', count: transactions.filter(t => t.reconciliationStatus === 'RECONCILED' || t.reconciliationStatus === 'EXACT_MATCH').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setQueueFilter(tab.id as any)}
                  className={`py-1 rounded-lg font-bold transition-colors text-center ${
                    queueFilter === tab.id
                      ? 'bg-white text-[#18243A] shadow-xs'
                      : 'text-[#748097] hover:text-[#18243A]'
                  }`}
                >
                  <div>{tab.label}</div>
                  <div className="text-[9.5px] font-mono opacity-80">{tab.count}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Queue Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E8EAF2] p-2 space-y-1">
            {queueItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#748097]">
                No transactions in this filter queue.
              </div>
            ) : (
              queueItems.map((txn) => {
                const isSelected = txn.id === selectedTransaction?.id;
                return (
                  <button
                    key={txn.id}
                    onClick={() => setSelectedTxnId(txn.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#EFEDFF] border border-[#5B55E7] shadow-xs'
                        : 'hover:bg-[#F6F7FB] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#18243A] truncate">
                        {txn.customerName}
                      </span>
                      <span className="font-mono font-extrabold text-xs text-[#18243A] tabular-nums">
                        ${txn.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#748097] mt-1">
                      <span className="font-mono text-[10px]">{txn.transactionId}</span>
                      <div className="flex items-center gap-1.5">
                        {txn.reconciliationScore ? (
                          <span className={`font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                            txn.reconciliationScore >= 90 ? 'bg-[#EDF9F5] text-[#159B72]' : 'bg-[#FFF9ED] text-[#E5A33B]'
                          }`}>
                            {txn.reconciliationScore}% Match
                          </span>
                        ) : (
                          <span className="text-[9.5px] text-[#748097] font-mono">Unscored</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* PANEL 2: CENTER PANEL — Comparison & Confidence Gauge (5 cols) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 card-elevated rounded-2xl flex flex-col p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF2]">
            <div>
              <span className="text-[11px] font-bold text-[#748097] uppercase tracking-wider">
                Side-by-Side Invariant Comparison
              </span>
              <h2 className="text-base font-extrabold text-[#18243A] font-mono">
                {selectedTransaction ? selectedTransaction.transactionId : 'Select a Transaction'}
              </h2>
            </div>

            {selectedTransaction && (
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                selectedTransaction.reconciliationStatus === 'RECONCILED'
                  ? 'bg-[#EDF9F5] text-[#159B72]'
                  : selectedTransaction.reconciliationStatus === 'MANUAL_REVIEW'
                  ? 'bg-[#FFF9ED] text-[#E5A33B]'
                  : 'bg-[#F6F7FB] text-[#748097]'
              }`}>
                {selectedTransaction.reconciliationStatus}
              </span>
            )}
          </div>

          {selectedTransaction ? (
            <>
              {/* Animated Circular Matching Confidence Gauge */}
              <div className="p-5 bg-gradient-to-br from-[#FBFBFE] to-[#F6F7FB] border border-[#E8EAF2] rounded-2xl flex items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-bold text-[#18243A]">
                    Reconciliation Confidence Score
                  </div>
                  <div className="text-[11px] text-[#748097] mt-0.5">
                    Evaluated against 5 deterministic financial rules
                  </div>
                  <div className="mt-2 text-xs font-semibold text-[#5B55E7] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#159B72]" />
                    <span>{score >= 90 ? 'High Confidence (Auto Settleable)' : score >= 70 ? 'Review Recommended (Variance Detected)' : 'Manual Investigation Required'}</span>
                  </div>
                </div>

                {/* Circular Gauge */}
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-20 h-20 -rotate-90 transform">
                    <circle cx="40" cy="40" r="32" stroke="#E8EAF2" strokeWidth="6" fill="transparent" />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke={score >= 90 ? '#159B72' : score >= 70 ? '#5B55E7' : '#E5A33B'}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 * (1 - score / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-extrabold font-mono text-[#18243A]">
                      {score}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Comparison Columns: Payment vs Invoice */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Column 1: Payment Record */}
                <div className="p-4 bg-white border border-[#E8EAF2] rounded-xl space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#E8EAF2] text-[#18243A] font-bold">
                    <CreditCard className="w-4 h-4 text-[#0070BA]" />
                    <span>Captured Payment</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-[10px] text-[#748097] uppercase">Amount</div>
                      <div className="text-base font-extrabold text-[#18243A] font-mono tabular-nums">
                        ${selectedTransaction.amount.toFixed(2)} {selectedTransaction.currency}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-[#748097] uppercase">Payer Customer</div>
                      <div className="font-semibold text-[#18243A] truncate">{selectedTransaction.customerName}</div>
                      <div className="text-[10px] text-[#748097] truncate">{selectedTransaction.customerEmail}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-[#748097] uppercase">Payment Reference</div>
                      <div className="font-mono text-[#18243A] text-[11px] truncate">
                        {selectedTransaction.invoiceReference || 'None supplied'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-[#748097] uppercase">Captured Date</div>
                      <div className="font-mono text-[#18243A] text-[11px]">
                        {new Date(selectedTransaction.paymentDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Invoice Record */}
                <div className="p-4 bg-white border border-[#E8EAF2] rounded-xl space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#E8EAF2] text-[#18243A] font-bold">
                    <FileText className="w-4 h-4 text-[#5B55E7]" />
                    <span>Matching Invoice</span>
                  </div>

                  {matchedInvoice ? (
                    <div className="space-y-2">
                      <div>
                        <div className="text-[10px] text-[#748097] uppercase">Invoice Total / Due</div>
                        <div className="text-base font-extrabold text-[#18243A] font-mono tabular-nums">
                          ${matchedInvoice.remainingAmount.toFixed(2)} {matchedInvoice.currency}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-[#748097] uppercase">Billed Customer</div>
                        <div className="font-semibold text-[#18243A] truncate">{matchedInvoice.customerName}</div>
                        <div className="text-[10px] text-[#748097] truncate">{matchedInvoice.customerEmail}</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-[#748097] uppercase">Invoice Number</div>
                        <div className="font-mono text-[#5B55E7] font-bold text-[11px]">
                          {matchedInvoice.invoiceNumber}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-[#748097] uppercase">Due Date</div>
                        <div className="font-mono text-[#18243A] text-[11px]">
                          {matchedInvoice.dueDate}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-[#748097] text-xs space-y-1">
                      <p>No candidate invoice matched.</p>
                      <p className="text-[11px] italic">Payment is completely orphan.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Variance Indicator */}
              <div className="p-3 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl flex items-center justify-between text-xs font-mono">
                <span className="text-[#748097]">Calculated Variance (Delta):</span>
                <span className={`font-bold tabular-nums ${Math.abs(variance) < 0.01 ? 'text-[#159B72]' : 'text-[#E5A33B]'}`}>
                  {variance > 0 ? `+$${variance.toFixed(2)} (Overpayment)` : variance < 0 ? `-$${Math.abs(variance).toFixed(2)} (Underpayment)` : '$0.00 Exact Match'}
                </span>
              </div>

              {/* Review Note & Primary Settlement Actions */}
              <div className="space-y-3 pt-2 border-t border-[#E8EAF2]">
                <input
                  type="text"
                  placeholder="Enter CFO review notes or approval memo..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs text-[#18243A] focus:outline-none focus:bg-white"
                />

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectTransaction(selectedTransaction.id)}
                    className="text-xs font-bold text-[#5B55E7] hover:text-[#3730A3]"
                  >
                    Open Deep Forensic Drawer →
                  </button>

                  <div className="flex items-center gap-2">
                    {currentMatch ? (
                      <>
                        <button
                          onClick={() => handleReviewDecision(currentMatch.id, 'REJECTED')}
                          disabled={isProcessingAction}
                          className="px-3.5 py-1.5 text-xs font-bold text-[#DC5B67] bg-[#FFF0F2] hover:bg-[#FED7DC] rounded-xl transition-colors"
                        >
                          Reject Match
                        </button>
                        <button
                          onClick={() => handleReviewDecision(currentMatch.id, 'APPROVED')}
                          disabled={isProcessingAction}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-[#159B72] hover:bg-[#12815F] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Reconcile</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-[#748097] italic">Run batch to score proposal</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-[#748097] text-xs">
              Select a transaction on the left to begin comparison.
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* PANEL 3: RIGHT PANEL — AI Reconciliation Intelligence (3 cols) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 card-elevated rounded-2xl p-6 flex flex-col space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8EAF2]">
            <div className="w-7 h-7 rounded-lg bg-[#EFEDFF] text-[#5B55E7] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#18243A]">
                AI Reconciliation Intelligence
              </h2>
              <div className="text-[10px] text-[#748097]">
                Deterministic Signal Breakdown
              </div>
            </div>
          </div>

          {/* Detailed Score Weights Bars */}
          <div className="space-y-2.5 text-xs">
            <div className="text-[11px] font-bold text-[#748097] uppercase tracking-wider">
              Scoring Signal Breakdown
            </div>

            {currentMatch?.breakdown ? (
              <div className="space-y-2">
                {[
                  { label: 'Invoice Ref Match', score: currentMatch.breakdown.invoiceRefScore, max: 35 },
                  { label: 'Amount Match', score: currentMatch.breakdown.amountScore, max: 30 },
                  { label: 'Customer Identity', score: currentMatch.breakdown.customerScore, max: 15 },
                  { label: 'Date Proximity', score: currentMatch.breakdown.dateProximityScore, max: 10 },
                  { label: 'Description Overlap', score: currentMatch.breakdown.descSimilarityScore, max: 10 },
                ].map((sig) => (
                  <div key={sig.label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#748097]">{sig.label}</span>
                      <span className="font-mono font-bold text-[#18243A]">{sig.score}/{sig.max} pts</span>
                    </div>
                    <div className="w-full bg-[#E8EAF2] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#5B55E7] h-full rounded-full transition-all duration-500"
                        style={{ width: `${(sig.score / sig.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-[#F6F7FB] rounded-xl text-[11px] text-[#748097] leading-relaxed">
                Click <strong>Execute Reconciliation Run</strong> to calculate multi-signal point breakdown across invoice numbers, decimal balances, and payer identity tokens.
              </div>
            )}
          </div>

          {/* AI Reasoning Summary */}
          <div className="p-3.5 bg-[#EFEDFF]/60 border border-[#DCD9FF] rounded-xl space-y-1.5 text-xs flex-1">
            <div className="text-[11px] font-bold text-[#5B55E7] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Action:</span>
            </div>
            <p className="text-[#18243A] leading-relaxed text-[11.5px]">
              {selectedTransaction?.notes?.includes('Duplicate')
                ? 'Flagged as duplicate submission within minutes of previous capture. Reject match and initiate PayPal Sandbox refund in Settlement Center.'
                : selectedTransaction?.reconciliationStatus === 'PARTIAL_MATCH'
                ? 'Installment matches open receivable balance. Approve match to credit $4,200 towards invoice total.'
                : currentMatch && currentMatch.score >= 90
                ? 'Exact amount and customer verified with zero variance. Safe for automated ledger settlement.'
                : 'Payer and invoice lack exact reference. Perform manual investigation or contact client accounts receivable.'}
            </p>
          </div>

          {/* Historical Runs Drawer Trigger */}
          <div className="pt-2 border-t border-[#E8EAF2] text-[11px] text-[#748097] flex items-center justify-between">
            <span>Runs Logged: <strong className="font-mono text-[#18243A]">{runs.length}</strong></span>
            <span className="font-mono text-[#159B72]">Audit Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
