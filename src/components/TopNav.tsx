import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  Zap,
  Calendar,
  Bell,
  CheckCircle2,
  AlertCircle,
  Menu,
  ChevronDown,
  Sparkles,
  Command
} from 'lucide-react';
import { NavTab } from '../types';

interface TopNavProps {
  activeTab: NavTab;
  onRunReconciliation: () => void;
  isReconciling: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  paypalStatus: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
  onSeedDemo: () => void;
  onOpenCommandPalette: () => void;
  onOpenMobileMenu: () => void;
  openAnomaliesCount?: number;
}

const TAB_BREADCRUMBS: Record<NavTab, { section: string; title: string }> = {
  overview: { section: 'Executive', title: 'Financial Command Center' },
  transactions: { section: 'Operations', title: 'Transaction Explorer' },
  reconciliation: { section: 'Intelligence', title: 'Reconciliation Studio' },
  invoices: { section: 'Receivables', title: 'Invoice & Aging Management' },
  anomalies: { section: 'Forensics', title: 'Anomaly Intelligence' },
  settlement: { section: 'Governance', title: 'Smart Settlement Center' },
  'ai-assistant': { section: 'AI Intelligence', title: 'Financial Copilot' },
  reports: { section: 'Compliance', title: 'Reports & Immutable Audit' },
  settings: { section: 'System', title: 'Settings & Integrations' },
};

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onRunReconciliation,
  isReconciling,
  searchQuery,
  onSearchChange,
  paypalStatus,
  onSeedDemo,
  onOpenCommandPalette,
  onOpenMobileMenu,
  openAnomaliesCount = 0
}) => {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [showNotifications, setShowNotifications] = useState(false);

  const breadcrumb = TAB_BREADCRUMBS[activeTab] || { section: 'Operations', title: 'Dashboard' };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#E8EAF2] px-6 flex items-center justify-between gap-6 shrink-0 z-20">
      {/* Left: Mobile Toggle & Breadcrumb Navigation */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-[#748097] hover:text-[#18243A] hover:bg-[#F6F7FB] rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs truncate">
          <span className="text-[#748097] font-medium hidden sm:inline">
            {breadcrumb.section}
          </span>
          <span className="text-[#E8EAF2] hidden sm:inline">/</span>
          <span className="font-bold text-[#18243A] truncate">
            {breadcrumb.title}
          </span>
        </div>
      </div>

      {/* Center: Global Command Search Trigger (Ramp/Linear style) */}
      <div className="flex-1 max-w-md hidden lg:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-[#F6F7FB] hover:bg-[#EEF0F8] border border-[#E8EAF2] hover:border-[#D6D9E7] rounded-xl text-xs text-[#748097] transition-all group"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-3.5 h-3.5 text-[#748097] group-hover:text-[#5B55E7] transition-colors" />
            <span className="truncate">Search transactions, invoices, anomalies or actions...</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#E8EAF2] text-[#748097] shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Controls: Date Range, PayPal Pill, Notifications, Quick Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Date Filter Dropdown */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs font-semibold text-[#18243A]">
          <Calendar className="w-3.5 h-3.5 text-[#748097]" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer pr-1"
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Quarter to date">Q4 2026</option>
            <option value="Last 90 Days">Last 90 Days</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        {/* PayPal Sandbox Environment Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EAF1FF] border border-[#D5E3FF] rounded-xl text-[11px] font-bold text-[#003087]">
          <span className="w-2 h-2 rounded-full bg-[#0070BA] animate-pulse" />
          <span>SANDBOX</span>
        </div>

        {/* Notification Bell with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-[#748097] hover:text-[#18243A] hover:bg-[#F6F7FB] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {openAnomaliesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC5B67] ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E8EAF2] rounded-2xl shadow-[0_12px_36px_rgba(24,36,58,0.1)] p-4 space-y-3 z-50 text-xs animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8EAF2]">
                <span className="font-bold text-[#18243A]">Notifications & Alerts</span>
                <span className="text-[10px] font-mono text-[#5B55E7] bg-[#EFEDFF] px-1.5 py-0.5 rounded font-semibold">
                  {openAnomaliesCount} alerts
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-[#FFF0F2] border border-[#FED7DC] rounded-xl text-[11px] text-[#DC5B67] space-y-0.5">
                  <div className="font-bold">Duplicate Payment Flagged</div>
                  <div className="text-[#18243A]">TXN-2012: $4,200 from BioGenix Labs needs review.</div>
                </div>
                <div className="p-2.5 bg-[#EDF9F5] border border-[#C6EFE2] rounded-xl text-[11px] text-[#159B72] space-y-0.5">
                  <div className="font-bold">PayPal Sandbox Capture</div>
                  <div className="text-[#18243A]">$2,200 USD settled for invoice INV-2026-011.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button: Run Reconciliation */}
        <button
          onClick={onRunReconciliation}
          disabled={isReconciling}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-[#5B55E7] hover:bg-[#4740D4] active:scale-[0.98] disabled:opacity-60 rounded-xl shadow-[0_2px_8px_rgba(91,85,231,0.25)] transition-all whitespace-nowrap"
        >
          <Zap className={`w-3.5 h-3.5 text-[#EFEDFF] ${isReconciling ? 'animate-spin' : ''}`} />
          <span>{isReconciling ? 'Reconciling...' : 'Run Reconciliation'}</span>
        </button>
      </div>
    </header>
  );
};
