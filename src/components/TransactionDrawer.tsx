import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  CreditCard,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { Transaction, Invoice, AuditLog, AIInvestigation } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface TransactionDrawerProps {
  transactionId: string | null;
  onClose: () => void;
  onTransactionUpdated: () => void;
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  transactionId,
  onClose,
  onTransactionUpdated,
}) => {
  const { showToast } = useToast();
  const [data, setData] = useState<{
    transaction: Transaction;
    linkedInvoice?: Invoice;
    auditLogs: AuditLog[];
    latestInvestigation?: AIInvestigation;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationResult, setInvestigationResult] = useState<AIInvestigation | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!transactionId) {
      setData(null);
      setInvestigationResult(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    api.getTransactionDetail(transactionId)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setInvestigationResult(res.latestInvestigation || null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load transaction detail:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [transactionId]);

  const handleRunInvestigation = async () => {
    if (!transactionId) return;
    setIsInvestigating(true);
    try {
      const inv = await api.investigateTransaction(transactionId);
      setInvestigationResult(inv);
      showToast('Forensic Analysis Generated', `Gemini identified ${inv.issue_type} with ${(inv.confidence * 100).toFixed(0)}% confidence`, 'success');
      onTransactionUpdated();
    } catch (err) {
      console.error('AI investigation failed:', err);
      showToast('Forensic Agent Error', 'Could not complete AI investigation', 'error');
    } finally {
      setIsInvestigating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    showToast('Copied to Clipboard', text, 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (!transactionId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#18243A]/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-white h-full shadow-[0_20px_60px_rgba(24,36,58,0.25)] flex flex-col border-l border-[#E8EAF2] animate-slideInRight">
        {/* Header */}
        <div className="p-6 border-b border-[#E8EAF2] flex items-center justify-between bg-[#FBFBFE]">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#5B55E7] bg-[#EFEDFF] px-2 py-0.5 rounded font-mono uppercase">
                AI Investigation Center
              </span>
              <span className="text-xs text-[#748097]">·</span>
              <span className="text-[11px] font-mono text-[#748097]">
                Source: {data?.transaction.source || 'DEMO'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-lg font-extrabold text-[#18243A] font-mono truncate">
                {data?.transaction.transactionId || transactionId}
              </h2>
              <button
                onClick={() => copyToClipboard(data?.transaction.transactionId || transactionId)}
                className="text-[#748097] hover:text-[#18243A] p-1 rounded transition-colors"
                title="Copy Transaction ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-[#159B72]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#748097] hover:text-[#18243A] hover:bg-[#F6F7FB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading || !data ? (
            <div className="py-20 text-center space-y-3 text-xs text-[#748097]">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto text-[#5B55E7]" />
              <p>Assembling ledger records, PayPal capture signatures & forensic logs...</p>
            </div>
          ) : (
            <>
              {/* Highlight Card: Amount & Status */}
              <div className="p-6 bg-gradient-to-br from-[#18243A] to-[#253755] text-white rounded-2xl shadow-md space-y-3">
                <div className="flex items-center justify-between text-xs text-[#B4B9CE]">
                  <span>Captured Settlement Volume</span>
                  <span className="font-mono text-[#159B72] font-bold uppercase tracking-wider">
                    {data.transaction.paymentStatus}
                  </span>
                </div>

                <div className="text-3xl font-extrabold font-mono tracking-tight tabular-nums">
                  ${data.transaction.amount.toFixed(2)} <span className="text-lg font-normal text-[#B4B9CE]">{data.transaction.currency}</span>
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-[#B4B9CE] gap-2">
                  <div>Customer: <strong className="text-white">{data.transaction.customerName}</strong></div>
                  <div>PayPal Order: <strong className="text-white font-mono">{data.transaction.paypalOrderId || 'ORD-SANDBOX'}</strong></div>
                </div>
              </div>

              {/* 5-Stage AI Investigation Timeline */}
              <div className="card-elevated rounded-2xl p-5 space-y-3">
                <div className="text-xs font-bold text-[#18243A] uppercase tracking-wider flex items-center justify-between">
                  <span>Forensic Audit Stages</span>
                  <span className="text-[10px] text-[#159B72] font-mono">100% Deterministic</span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] pt-1">
                  {[
                    { label: 'Capture Detected', status: 'done' },
                    { label: 'Evidence Scanned', status: 'done' },
                    { label: 'Rules Evaluated', status: 'done' },
                    { label: 'Anomalies Filtered', status: data.transaction.riskIndicator === 'HIGH' ? 'alert' : 'done' },
                    { label: 'Recommendation', status: 'active' },
                  ].map((st, i) => (
                    <div
                      key={st.label}
                      className={`p-2 rounded-xl border space-y-1 ${
                        st.status === 'alert'
                          ? 'bg-[#FFF0F2] border-[#FED7DC] text-[#DC5B67] font-bold'
                          : st.status === 'active'
                          ? 'bg-[#EFEDFF] border-[#5B55E7] text-[#5B55E7] font-bold'
                          : 'bg-[#F6F7FB] border-[#E8EAF2] text-[#748097]'
                      }`}
                    >
                      <div className="font-mono text-[9px] uppercase">Stage 0{i + 1}</div>
                      <div className="leading-tight truncate">{st.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trigger AI Forensic Agent */}
              <div className="bg-[#EFEDFF]/70 border border-[#DCD9FF] rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#5B55E7] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#18243A]">
                      Google Gemini 3.8 Flash Financial Forensics
                    </div>
                    <div className="text-[11px] text-[#748097]">
                      Contextual root-cause investigation & structured JSON evidence
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRunInvestigation}
                  disabled={isInvestigating}
                  className="px-4 py-2 bg-[#5B55E7] hover:bg-[#4740D4] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isInvestigating ? 'animate-spin' : ''}`} />
                  <span>{isInvestigating ? 'Investigating...' : 'Investigate'}</span>
                </button>
              </div>

              {/* AI Structured Findings Card */}
              {investigationResult && (
                <div className="card-elevated rounded-2xl p-5 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF2]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#5B55E7]" />
                      <span className="text-xs font-bold text-[#18243A]">
                        AI Forensic Investigation Summary
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EDF9F5] text-[#159B72]">
                      Confidence: {(investigationResult.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-xs text-[#18243A] leading-relaxed bg-[#F6F7FB] p-3.5 rounded-xl border border-[#E8EAF2]">
                    {investigationResult.summary}
                  </p>

                  {/* Documented Evidence Items */}
                  {investigationResult.evidence && investigationResult.evidence.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <div className="text-[11px] font-bold text-[#748097] uppercase tracking-wider">
                        Documented Evidence Tokens:
                      </div>
                      <div className="space-y-1">
                        {investigationResult.evidence.map((ev, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-[#FAFBFD] border border-[#E8EAF2]">
                            <span className="text-[#5B55E7] font-bold">·</span>
                            <span className="text-[#18243A]">{ev}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended CFO Actions */}
                  {investigationResult.recommended_actions && (
                    <div className="space-y-1.5 text-xs pt-2 border-t border-[#E8EAF2]">
                      <div className="text-[11px] font-bold text-[#748097] uppercase tracking-wider">
                        Recommended Next Steps:
                      </div>
                      <div className="space-y-1">
                        {investigationResult.recommended_actions.map((act, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[#18243A] font-medium">
                            <CheckCircle2 className="w-4 h-4 text-[#159B72] shrink-0" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Associated Invoice */}
              <div className="card-elevated rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8EAF2]">
                  <span className="text-xs font-bold text-[#18243A] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#748097]" />
                    Associated Invoice
                  </span>
                  {data.linkedInvoice ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EDF9F5] text-[#159B72]">
                      {data.linkedInvoice.status}
                    </span>
                  ) : (
                    <span className="text-xs text-[#E5A33B] font-bold">Orphan Payment</span>
                  )}
                </div>

                {data.linkedInvoice ? (
                  <div className="p-3.5 bg-[#F6F7FB] rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center font-bold">
                      <span className="font-mono text-[#5B55E7]">{data.linkedInvoice.invoiceNumber}</span>
                      <span className="font-mono">${data.linkedInvoice.amount.toFixed(2)} USD</span>
                    </div>
                    <div className="text-[#748097] text-[11px]">{data.linkedInvoice.description}</div>
                    <div className="flex justify-between pt-1 border-t border-[#E8EAF2] text-[11px] font-mono">
                      <span>Paid: ${data.linkedInvoice.paidAmount.toFixed(2)}</span>
                      <span>Remaining: ${data.linkedInvoice.remainingAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#748097] italic">
                    No matching invoice identified. Use Reconciliation Studio to link an open account.
                  </p>
                )}
              </div>

              {/* Lifecycle Audit Log */}
              <div className="card-elevated rounded-2xl p-5 space-y-3">
                <div className="text-xs font-bold text-[#18243A] flex items-center gap-2 pb-2 border-b border-[#E8EAF2]">
                  <Clock className="w-4 h-4 text-[#748097]" />
                  <span>Immutable Audit Log</span>
                </div>

                <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8EAF2]">
                  <div className="relative text-xs">
                    <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-[#5B55E7] ring-4 ring-white" />
                    <div className="font-bold text-[#18243A]">Captured on PayPal REST API</div>
                    <div className="text-[11px] text-[#748097] font-mono">{new Date(data.transaction.paymentDate).toUTCString()}</div>
                  </div>

                  {data.auditLogs.map((log) => (
                    <div key={log.id} className="relative text-xs">
                      <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-[#159B72] ring-4 ring-white" />
                      <div className="font-bold text-[#18243A]">{log.action}</div>
                      <div className="text-[11px] text-[#748097] font-mono">{new Date(log.timestamp).toLocaleString()}</div>
                      <div className="text-[11px] text-[#748097] mt-0.5">{log.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8EAF2] bg-[#FBFBFE] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#748097]">
            SettleWise Invariant v2.4
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#18243A] hover:bg-[#253755] text-white text-xs font-bold rounded-xl transition-colors"
          >
            Close Investigation
          </button>
        </div>
      </div>
    </div>
  );
};
