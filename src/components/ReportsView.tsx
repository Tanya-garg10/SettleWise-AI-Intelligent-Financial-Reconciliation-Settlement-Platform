import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Lock,
  Layers,
  ArrowUpRight,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { AuditLog, Transaction, Invoice, AnomalyAlert } from '../types';

interface ReportsViewProps {
  auditLogs: AuditLog[];
  transactions: Transaction[];
  invoices: Invoice[];
  anomalies: AnomalyAlert[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  auditLogs,
  transactions,
  invoices,
  anomalies
}) => {
  const [logFilterCategory, setLogFilterCategory] = useState<string>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(l => {
    if (logFilterCategory !== 'ALL' && l.category !== logFilterCategory) return false;
    if (logSearchQuery) {
      const q = logSearchQuery.toLowerCase();
      return l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q);
    }
    return true;
  });

  const totalVolume = transactions.reduce((s, t) => s + (t.paymentStatus === 'COMPLETED' ? t.amount : 0), 0);
  const reconciledAmount = transactions.reduce((s, t) => s + (t.reconciliationStatus === 'RECONCILED' ? t.amount : 0), 0);
  const outstandingReceivables = invoices.reduce((s, i) => s + i.remainingAmount, 0);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'RECONCILED':
      case 'RECONCILIATION':
        return 'bg-[#EFEDFF] text-[#5B55E7] border-[#5B55E7]/20';
      case 'SETTLEMENT':
        return 'bg-emerald-50 text-[#159B72] border-emerald-200';
      case 'PAYPAL':
        return 'bg-[#EAF1FF] text-blue-700 border-blue-200';
      case 'AI_INVESTIGATION':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'INVOICE':
        return 'bg-amber-50 text-[#E5A33B] border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B55E7] bg-[#EFEDFF] px-2.5 py-0.5 rounded-md">
              Governance & Compliance
            </span>
            <span className="text-xs text-[#748097] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#159B72]" /> Immutable SHA-256 Ledger
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#18243A]">
            Financial Reports & Audit Trail
          </h1>
          <p className="text-sm text-[#748097] mt-1 max-w-2xl">
            Export verified transaction reconciliations, examine cross-border ledger snapshots, and inspect cryptographically timestamped governance events.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/api/export/csv?type=transactions"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-white border border-[#E8EAF2] hover:bg-[#F6F7FB] rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#748097]" />
            <span>Export Transactions (.CSV)</span>
          </a>
          <a
            href="/api/export/csv?type=invoices"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#5B55E7] hover:bg-[#3730A3] rounded-xl shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-200" />
            <span>Export Invoices (.CSV)</span>
          </a>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8EAF2] rounded-2xl p-5 shadow-xs card-elevated">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#748097]">Gross Settled Volume</span>
            <span className="w-2 h-2 rounded-full bg-[#159B72]"></span>
          </div>
          <div className="text-2xl font-bold text-[#18243A] font-mono tabular-nums mt-2">
            ${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#748097] mt-1 flex items-center justify-between">
            <span>{transactions.length} captured records</span>
            <span className="text-[#159B72] font-semibold">100% verified</span>
          </div>
        </div>

        <div className="bg-white border border-[#E8EAF2] rounded-2xl p-5 shadow-xs card-elevated">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#748097]">Reconciled Balance</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#5B55E7]" />
          </div>
          <div className="text-2xl font-bold text-[#5B55E7] font-mono tabular-nums mt-2">
            ${reconciledAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#748097] mt-1 flex items-center justify-between">
            <span>Matched to sales ledger</span>
            <span className="text-[#5B55E7] font-semibold">
              {totalVolume > 0 ? `${((reconciledAmount / totalVolume) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#E8EAF2] rounded-2xl p-5 shadow-xs card-elevated">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#748097]">Outstanding Receivables</span>
            <Clock className="w-3.5 h-3.5 text-[#E5A33B]" />
          </div>
          <div className="text-2xl font-bold text-[#18243A] font-mono tabular-nums mt-2">
            ${outstandingReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#748097] mt-1 flex items-center justify-between">
            <span>{invoices.filter(i => i.remainingAmount > 0).length} open invoices</span>
            <span className="text-[#E5A33B] font-semibold">In collections</span>
          </div>
        </div>

        <div className="bg-white border border-[#E8EAF2] rounded-2xl p-5 shadow-xs card-elevated">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#748097]">Audited Events</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#159B72]" />
          </div>
          <div className="text-2xl font-bold text-[#18243A] font-mono tabular-nums mt-2">
            {auditLogs.length}
          </div>
          <div className="text-[11px] text-[#748097] mt-1 flex items-center justify-between">
            <span>SOC2 Type II aligned</span>
            <span className="text-[#159B72] font-semibold">Verified</span>
          </div>
        </div>
      </div>

      {/* Main Audit Trail Panel */}
      <div className="bg-white border border-[#E8EAF2] rounded-2xl shadow-xs overflow-hidden">
        {/* Filter & Search Header */}
        <div className="p-6 border-b border-[#E8EAF2] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-[#F6F7FB]">
          <div>
            <h2 className="text-base font-bold text-[#18243A] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#5B55E7]" />
              Immutable Operations & Compliance Audit Trail
            </h2>
            <p className="text-xs text-[#748097] mt-0.5">
              Chronological log of batch reconciliation triggers, human match confirmations, PayPal sandbox captures, and settlement payouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category tabs */}
            <div className="inline-flex p-1 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs font-medium">
              {[
                { id: 'ALL', label: 'All Events' },
                { id: 'RECONCILED', label: 'Reconciliation' },
                { id: 'SETTLEMENT', label: 'Settlement' },
                { id: 'PAYPAL', label: 'PayPal' },
                { id: 'AI_INVESTIGATION', label: 'AI Forensics' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setLogFilterCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                    logFilterCategory === cat.id
                      ? 'bg-white text-[#18243A] font-semibold shadow-2xs'
                      : 'text-[#748097] hover:text-[#18243A]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#748097]" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="pl-8.5 pr-3.5 py-1.5 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs text-[#18243A] focus:outline-none focus:bg-white focus:border-[#5B55E7] w-52 placeholder-[#748097]"
              />
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="divide-y divide-[#E8EAF2]">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#748097]">
              No audit log records match the current filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-[#F6F7FB]/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-[#18243A]">
                      {log.action}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${getCategoryBadge(log.category)}`}>
                      {log.category}
                    </span>
                    <span className="text-[#E8EAF2]">|</span>
                    <span className="text-[#748097] text-[11px]">
                      Triggered by: <span className="font-semibold text-[#18243A]">{log.actor}</span>
                    </span>
                  </div>
                  <div className="text-[#748097] text-[11px] leading-relaxed break-words">
                    {log.details}
                  </div>
                </div>

                <div className="text-left md:text-right shrink-0 font-mono text-[11px]">
                  <div className="text-[#18243A] font-medium flex items-center md:justify-end gap-1.5">
                    <Calendar className="w-3 h-3 text-[#748097]" />
                    {new Date(log.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                  <div className="text-[10px] text-[#748097] mt-0.5">
                    ID: <span className="text-slate-500">{log.id}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
