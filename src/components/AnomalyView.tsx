import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Info,
  Scale,
  Copy,
  Check,
  Filter
} from 'lucide-react';
import { AnomalyAlert, NavTab } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface AnomalyViewProps {
  anomalies: AnomalyAlert[];
  onRefreshData: () => void;
  onSelectTransaction: (txnId: string) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const AnomalyView: React.FC<AnomalyViewProps> = ({
  anomalies,
  onRefreshData,
  onSelectTransaction,
  onNavigateTab
}) => {
  const { showToast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      await api.detectAnomalies();
      showToast('Forensic Scan Complete', 'Evaluated transaction invariants across time delta, volume, & FX', 'success');
      onRefreshData();
    } catch (err) {
      console.error('Failed to run anomaly scan:', err);
      showToast('Scan Error', 'Could not run forensic invariant scan', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const filtered = anomalies.filter(a => {
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    return true;
  });

  const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL').length;
  const highCount = anomalies.filter(a => a.severity === 'HIGH').length;
  const mediumCount = anomalies.filter(a => a.severity === 'MEDIUM').length;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#DC5B67] bg-[#FFF0F2] px-2 py-0.5 rounded font-mono uppercase">
              Financial Risk & Forensics
            </span>
            <span className="text-xs text-[#748097]">·</span>
            <span className="text-xs text-[#748097]">Heuristic Detection + Gemini Reasoning</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#18243A] mt-1">
            Anomaly Intelligence
          </h1>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#18243A] hover:bg-[#253755] active:scale-[0.98] disabled:opacity-60 rounded-xl shadow-xs transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#5B55E7] ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning Invariants...' : 'Run Forensic Invariant Audit'}</span>
        </button>
      </div>

      {/* Governance & Explainability Notice Banner */}
      <div className="p-4 bg-white border border-[#E8EAF2] rounded-2xl flex items-start gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-[#FFF9ED] text-[#E5A33B] flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 text-xs">
          <span className="font-bold text-[#18243A]">Statistical Anomaly Policy</span>
          <p className="text-[#748097] leading-relaxed text-[11.5px]">
            Algorithmic flags indicate variance from normal transactional frequency, unexpected foreign exchange currencies, or time-delta clusters. Flagged items do not constitute proof of fraud and require contextual CFO sign-off in the Settlement Center before executing reversals.
          </p>
        </div>
      </div>

      {/* Severity Breakdown Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-bold text-[#748097] uppercase">Total Active Alerts</div>
          <div className="text-2xl font-extrabold text-[#18243A] font-mono tabular-nums">
            {anomalies.length}
          </div>
          <div className="text-[11px] text-[#748097]">In open quarantine</div>
        </div>

        <div className="card-elevated rounded-2xl p-4 space-y-1 border-l-4 border-l-[#DC5B67]">
          <div className="text-[11px] font-bold text-[#DC5B67] uppercase">Critical (Duplicates)</div>
          <div className="text-2xl font-extrabold text-[#DC5B67] font-mono tabular-nums">
            {criticalCount}
          </div>
          <div className="text-[11px] text-[#748097]">High financial exposure</div>
        </div>

        <div className="card-elevated rounded-2xl p-4 space-y-1 border-l-4 border-l-[#E5A33B]">
          <div className="text-[11px] font-bold text-[#E5A33B] uppercase">High (Volume/FX)</div>
          <div className="text-2xl font-extrabold text-[#E5A33B] font-mono tabular-nums">
            {highCount}
          </div>
          <div className="text-[11px] text-[#748097]">Spikes & cross-currency</div>
        </div>

        <div className="card-elevated rounded-2xl p-4 space-y-1 border-l-4 border-l-[#5B55E7]">
          <div className="text-[11px] font-bold text-[#5B55E7] uppercase">Medium (Underpay/Bursts)</div>
          <div className="text-2xl font-extrabold text-[#5B55E7] font-mono tabular-nums">
            {mediumCount}
          </div>
          <div className="text-[11px] text-[#748097]">Minor variance tolerances</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs w-fit">
        {[
          { id: 'ALL', label: `All Alerts (${anomalies.length})` },
          { id: 'CRITICAL', label: `Critical (${criticalCount})` },
          { id: 'HIGH', label: `High Risk (${highCount})` },
          { id: 'MEDIUM', label: `Medium (${mediumCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedSeverity(tab.id)}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap ${
              selectedSeverity === tab.id
                ? 'bg-white text-[#18243A] shadow-xs'
                : 'text-[#748097] hover:text-[#18243A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Anomaly Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card-elevated rounded-2xl p-12 text-center text-[#748097] text-xs">
            No anomaly alerts found for the selected filter.
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              className="card-elevated rounded-2xl p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8EAF2]">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-[#FFF0F2] text-[#DC5B67]'
                        : alert.severity === 'HIGH'
                        ? 'bg-[#FFF9ED] text-[#E5A33B]'
                        : 'bg-[#EAF1FF] text-[#5B55E7]'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <h3 className="text-sm font-bold text-[#18243A]">
                    {alert.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#748097] font-mono">
                  <span>Detected: {new Date(alert.detectedAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span className="text-[#18243A] font-bold">Txn: {alert.transactionId}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[#748097] leading-relaxed">
                {alert.description}
              </p>

              {/* Supporting Evidence Tokens */}
              {alert.evidence && alert.evidence.length > 0 && (
                <div className="p-3.5 bg-[#FAFBFD] border border-[#E8EAF2] rounded-xl text-xs space-y-1.5">
                  <div className="text-[10.5px] font-bold text-[#748097] uppercase tracking-wider">
                    Invariant Violation Tokens:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {alert.evidence.map((ev, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[#18243A] text-[11.5px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5B55E7]" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gemini AI Root-Cause Forensics */}
              {alert.aiExplanation && (
                <div className="p-3.5 bg-[#EFEDFF]/60 border border-[#DCD9FF] rounded-xl text-xs space-y-1">
                  <div className="text-[11px] font-bold text-[#5B55E7] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini Forensic Root-Cause Analysis:</span>
                  </div>
                  <p className="text-[#18243A] leading-relaxed text-[11.5px]">
                    {alert.aiExplanation}
                  </p>
                </div>
              )}

              {/* Resolution Routing Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E8EAF2]">
                <div className="text-xs text-[#748097]">
                  Suggested Resolution: <strong className="text-[#18243A]">{alert.suggestedResolution || 'Inspect ledger details'}</strong>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSelectTransaction(alert.transactionId)}
                    className="text-xs font-bold text-[#748097] hover:text-[#18243A] px-3 py-1.5 border border-[#E8EAF2] rounded-xl hover:bg-[#F6F7FB] transition-colors"
                  >
                    View Transaction Drawer
                  </button>
                  <button
                    onClick={() => onNavigateTab('settlement')}
                    className="text-xs font-bold text-white bg-[#5B55E7] hover:bg-[#4740D4] px-4 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Route to Settlement Center</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
