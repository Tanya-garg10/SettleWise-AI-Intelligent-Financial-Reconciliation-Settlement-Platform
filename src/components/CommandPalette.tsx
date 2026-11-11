import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  ArrowLeftRight,
  GitCompare,
  FileText,
  AlertTriangle,
  Scale,
  Sparkles,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  X,
  CreditCard
} from 'lucide-react';
import { NavTab } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onRunReconciliation: () => void;
  onResetDemo: () => void;
  onExportCSV: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onToggle,
  onNavigateTab,
  onRunReconciliation,
  onResetDemo,
  onExportCSV
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onToggle();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onToggle]);

  if (!isOpen) return null;

  const actions = [
    { id: 'overview', title: 'Go to Overview Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => onNavigateTab('overview') },
    { id: 'transactions', title: 'Open Transaction Explorer', category: 'Navigation', icon: ArrowLeftRight, action: () => onNavigateTab('transactions') },
    { id: 'reconciliation', title: 'Launch Reconciliation Studio', category: 'Navigation', icon: GitCompare, action: () => onNavigateTab('reconciliation') },
    { id: 'invoices', title: 'Manage Invoices & Receivables', category: 'Navigation', icon: FileText, action: () => onNavigateTab('invoices') },
    { id: 'anomalies', title: 'Inspect Anomaly Intelligence', category: 'Navigation', icon: AlertTriangle, action: () => onNavigateTab('anomalies') },
    { id: 'settlement', title: 'Review Smart Settlement Console', category: 'Navigation', icon: Scale, action: () => onNavigateTab('settlement') },
    { id: 'ai-assistant', title: 'Consult AI Finance Copilot', category: 'Navigation', icon: Sparkles, action: () => onNavigateTab('ai-assistant') },
    { id: 'reports', title: 'Audit Trail & Compliance Reports', category: 'Navigation', icon: BarChart3, action: () => onNavigateTab('reports') },
    { id: 'settings', title: 'Settings & Integrations', category: 'Navigation', icon: Settings, action: () => onNavigateTab('settings') },
    { id: 'reconcile-now', title: 'Run Deterministic Reconciliation Batch', category: 'Action', icon: GitCompare, action: onRunReconciliation },
    { id: 'export-csv', title: 'Export Transactions as CSV', category: 'Action', icon: Download, action: onExportCSV },
    { id: 'reset-demo', title: 'Reset Demo Benchmark (25 Invoices / 35 Txns)', category: 'Action', icon: RefreshCw, action: onResetDemo },
  ];

  const filtered = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-24 bg-[#18243A]/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(24,36,58,0.2)] border border-[#E8EAF2] max-w-xl w-full overflow-hidden flex flex-col max-h-[480px]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E8EAF2] bg-[#FBFBFE]">
          <Search className="w-4 h-4 text-[#748097]" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, navigate view, or search action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[#18243A] placeholder-[#748097] focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E8EAF2] text-[#748097]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#748097]">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-left hover:bg-[#F6F7FB] text-[#18243A] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#EFEDFF] text-[#5B55E7] flex items-center justify-center shrink-0 group-hover:bg-[#5B55E7] group-hover:text-white transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#748097] uppercase">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#F6F7FB] border-t border-[#E8EAF2] flex items-center justify-between text-[11px] text-[#748097]">
          <span>Tip: Press <kbd className="font-mono text-[#18243A]">↑</kbd> <kbd className="font-mono text-[#18243A]">↓</kbd> to navigate</span>
          <span className="font-mono">SettleWise Omnisearch</span>
        </div>
      </div>
    </div>
  );
};
