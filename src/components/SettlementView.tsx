import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Clock,
  Lock,
  ExternalLink,
  CreditCard,
  Check
} from 'lucide-react';
import { SettlementRecommendation } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface SettlementViewProps {
  settlements: SettlementRecommendation[];
  onRefreshData: () => void;
  onSelectTransaction: (txnId: string) => void;
}

export const SettlementView: React.FC<SettlementViewProps> = ({
  settlements,
  onRefreshData,
  onSelectTransaction
}) => {
  const { showToast } = useToast();
  const [selectedSettlementForModal, setSelectedSettlementForModal] = useState<SettlementRecommendation | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [cfoNote, setCfoNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (settlement: SettlementRecommendation, decision: 'APPROVE' | 'REJECT') => {
    setSelectedSettlementForModal(settlement);
    setApprovalDecision(decision);
    setCfoNote('');
  };

  const handleExecuteApproval = async () => {
    if (!selectedSettlementForModal) return;

    setIsSubmitting(true);
    try {
      const res = await api.approveSettlement(
        selectedSettlementForModal.id,
        approvalDecision,
        'Tanya Garg (CFO)',
        cfoNote || undefined
      );

      setSelectedSettlementForModal(null);
      showToast(
        approvalDecision === 'APPROVE' ? 'Settlement Executed on PayPal' : 'Settlement Rejected',
        approvalDecision === 'APPROVE'
          ? `Authorization confirmed. Ref: ${res.executionResult?.paypalResponseId || 'PP-EXEC'}`
          : `Settlement proposal ${res.id} marked as rejected in compliance log.`,
        approvalDecision === 'APPROVE' ? 'success' : 'info'
      );
      onRefreshData();
    } catch (err) {
      console.error('Failed to execute settlement approval:', err);
      showToast('Settlement Error', 'Could not execute settlement action', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingSettlements = settlements.filter(s => s.approvalStatus === 'PENDING_APPROVAL');
  const historySettlements = settlements.filter(s => s.approvalStatus !== 'PENDING_APPROVAL');
  const totalPendingAmount = pendingSettlements.reduce((s, item) => s + item.amount, 0);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title & Governance Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#5B55E7] bg-[#EFEDFF] px-2 py-0.5 rounded font-mono uppercase">
              Financial Governance Console
            </span>
            <span className="text-xs text-[#748097]">·</span>
            <span className="text-xs text-[#748097]">Human-In-The-Loop PayPal Settlement</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#18243A] mt-1">
            Smart Settlement Center
          </h1>
        </div>

        {/* Overview Stats Pill */}
        <div className="flex items-center gap-4 px-4 py-2 bg-white border border-[#E8EAF2] rounded-2xl shadow-xs text-xs">
          <div>
            <div className="text-[10px] text-[#748097] uppercase font-bold">Pending Approval</div>
            <div className="text-sm font-extrabold text-[#18243A] font-mono tabular-nums">
              ${totalPendingAmount.toFixed(2)} USD
            </div>
          </div>
          <div className="w-px h-7 bg-[#E8EAF2]" />
          <div>
            <div className="text-[10px] text-[#748097] uppercase font-bold">Active Orders</div>
            <div className="text-sm font-extrabold text-[#5B55E7] font-mono">
              {pendingSettlements.length} actions
            </div>
          </div>
        </div>
      </div>

      {/* 6-Stage Human-in-the-Loop Protocol Visualizer */}
      <div className="card-elevated rounded-2xl p-5 space-y-3">
        <div className="text-xs font-bold text-[#18243A] uppercase tracking-wider flex items-center justify-between">
          <span>Enforced Payment Execution Protocol</span>
          <span className="text-[10px] text-[#159B72] font-mono font-bold">Zero Unauthorized Movement</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-3 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl space-y-0.5">
            <div className="text-[#5B55E7] font-bold text-[11px]">1. AI Analysis</div>
            <div className="text-[10px] text-[#748097]">Gemini Forensics</div>
          </div>
          <div className="p-3 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl space-y-0.5">
            <div className="text-[#18243A] font-bold text-[11px]">2. Financial Verify</div>
            <div className="text-[10px] text-[#748097]">Ledger Validation</div>
          </div>
          <div className="p-3 bg-[#FFF9ED] border border-[#FDE8BA] rounded-xl space-y-0.5">
            <div className="text-[#E5A33B] font-bold text-[11px]">3. Human Review</div>
            <div className="text-[10px] text-[#E5A33B]">CFO Inspection</div>
          </div>
          <div className="p-3 bg-[#EFEDFF] border border-[#DCD9FF] rounded-xl space-y-0.5">
            <div className="text-[#5B55E7] font-bold text-[11px]">4. Explicit Sign-Off</div>
            <div className="text-[10px] text-[#5B55E7]">Dual Authorization</div>
          </div>
          <div className="p-3 bg-[#EAF1FF] border border-[#D5E3FF] rounded-xl space-y-0.5">
            <div className="text-[#0070BA] font-bold text-[11px]">5. PayPal Sandbox</div>
            <div className="text-[10px] text-[#003087]">Capture / Reversal</div>
          </div>
          <div className="p-3 bg-[#EDF9F5] border border-[#C6EFE2] rounded-xl space-y-0.5">
            <div className="text-[#159B72] font-bold text-[11px]">6. Audit Trail</div>
            <div className="text-[10px] text-[#159B72]">Immutable Ledger</div>
          </div>
        </div>
      </div>

      {/* Pending Settlement Actions Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#18243A]">
            Pending Settlement Recommendations ({pendingSettlements.length})
          </h2>
          <span className="text-xs text-[#748097]">
            Requires explicit user approval before triggering Sandbox API
          </span>
        </div>

        {pendingSettlements.length === 0 ? (
          <div className="card-elevated rounded-2xl p-12 text-center text-xs text-[#748097]">
            All settlement proposals have been cleared. No actions awaiting human review.
          </div>
        ) : (
          pendingSettlements.map((item) => (
            <div
              key={item.id}
              className="card-elevated rounded-2xl p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8EAF2]">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-[#EFEDFF] text-[#5B55E7]">
                    {item.actionType}
                  </span>
                  <h3 className="text-sm font-bold text-[#18243A]">
                    {item.title}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="font-mono font-extrabold text-base text-[#18243A] tabular-nums">
                    ${item.amount.toFixed(2)} {item.currency}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#748097] leading-relaxed">
                {item.description}
              </p>

              {/* AI Rationale & Risk Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-[#EFEDFF]/60 border border-[#DCD9FF] rounded-xl space-y-1">
                  <div className="font-bold text-[#5B55E7] flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Rationale</span>
                  </div>
                  <div className="text-[#18243A] leading-relaxed text-[11.5px]">
                    {item.aiRationale}
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAFBFD] border border-[#E8EAF2] rounded-xl space-y-1">
                  <div className="font-bold text-[#18243A] flex items-center gap-1.5 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#159B72]" />
                    <span>Financial Risk Assessment</span>
                  </div>
                  <div className="text-[#748097] leading-relaxed text-[11.5px]">
                    {item.riskAssessment}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E8EAF2]">
                <div className="text-xs text-[#748097] font-mono">
                  Target Record: {item.transactionId || item.invoiceId || 'N/A'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(item, 'REJECT')}
                    className="px-3.5 py-1.5 text-xs font-bold text-[#DC5B67] bg-[#FFF0F2] hover:bg-[#FED7DC] rounded-xl transition-colors"
                  >
                    Reject Action
                  </button>
                  <button
                    onClick={() => handleOpenModal(item, 'APPROVE')}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#5B55E7] hover:bg-[#4740D4] rounded-xl shadow-xs transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#EFEDFF]" />
                    <span>Authorize & Execute Sandbox Settlement</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Historical Settled Log */}
      {historySettlements.length > 0 && (
        <div className="card-elevated rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#18243A]">
            Settlement Audit & Completed Order History
          </h3>
          <div className="divide-y divide-[#E8EAF2]">
            {historySettlements.map((h) => (
              <div key={h.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#18243A] flex items-center gap-2">
                    <span>{h.title}</span>
                    <span className="font-mono text-[#748097]">({h.actionType})</span>
                  </div>
                  <div className="text-[#748097] text-[11px] mt-0.5">
                    Authorized by: <strong className="text-[#18243A]">{h.approvedBy}</strong> · PayPal Ref: {h.executionResult?.paypalResponseId || 'PP-EXEC'}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    h.approvalStatus === 'EXECUTED' ? 'bg-[#EDF9F5] text-[#159B72]' : 'bg-[#F6F7FB] text-[#748097]'
                  }`}>
                    {h.approvalStatus}
                  </span>
                  <div className="text-[10px] text-[#748097] font-mono mt-0.5">
                    {h.approvedAt ? new Date(h.approvedAt).toLocaleDateString() : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-Step Confirmation Modal */}
      {selectedSettlementForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18243A]/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(24,36,58,0.2)] max-w-lg w-full p-6 space-y-4 border border-[#E8EAF2]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF2]">
              <h3 className="text-base font-extrabold text-[#18243A] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#5B55E7]" />
                <span>Executive Sign-Off Confirmation</span>
              </h3>
              <button
                onClick={() => setSelectedSettlementForModal(null)}
                className="text-[#748097] hover:text-[#18243A] font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#748097]">
                You are about to <strong className={approvalDecision === 'APPROVE' ? 'text-[#5B55E7] uppercase' : 'text-[#DC5B67] uppercase'}>{approvalDecision}</strong> the following action:
              </p>

              <div className="p-4 bg-[#F6F7FB] rounded-xl border border-[#E8EAF2] space-y-1">
                <div className="font-bold text-[#18243A]">{selectedSettlementForModal.title}</div>
                <div className="text-[#748097] text-[11px]">{selectedSettlementForModal.description}</div>
                <div className="font-mono font-extrabold text-[#18243A] pt-1">
                  Volume: ${selectedSettlementForModal.amount.toFixed(2)} {selectedSettlementForModal.currency}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#18243A]">Approval Justification Memo:</label>
                <input
                  type="text"
                  placeholder="e.g. Authorized duplicate payment reversal per BioGenix customer ticket"
                  value={cfoNote}
                  onChange={(e) => setCfoNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs text-[#18243A] focus:bg-white focus:outline-none focus:border-[#5B55E7]"
                />
              </div>

              <div className="p-3 bg-[#FFF9ED] text-[#E5A33B] rounded-xl text-[11px] leading-relaxed">
                Executing this approval triggers the official PayPal Sandbox REST API endpoint and posts an immutable compliance event to the audit trail.
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8EAF2] flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedSettlementForModal(null)}
                className="px-4 py-2 text-[#748097] hover:text-[#18243A] font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteApproval}
                disabled={isSubmitting}
                className={`px-4 py-2 font-bold text-white rounded-xl shadow-xs disabled:opacity-60 ${
                  approvalDecision === 'APPROVE' ? 'bg-[#5B55E7] hover:bg-[#4740D4]' : 'bg-[#DC5B67] hover:bg-[#B3454F]'
                }`}
              >
                {isSubmitting ? 'Executing Sandbox Action...' : `Confirm & Execute`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
