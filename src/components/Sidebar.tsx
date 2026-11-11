import React, { useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  GitCompare,
  FileText,
  AlertTriangle,
  Scale,
  Sparkles,
  BarChart3,
  Settings,
  CreditCard,
  ShieldCheck,
  ChevronDown,
  Building2,
  CheckCircle2,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  openAnomaliesCount?: number;
  pendingSettlementsCount?: number;
  unmatchedCount?: number;
  paypalStatus?: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  openAnomaliesCount = 0,
  pendingSettlementsCount = 0,
  unmatchedCount = 0,
  paypalStatus = 'CONNECTED',
  isMobileOpen = false,
  onCloseMobile
}) => {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState('Acme Global HQ');

  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'transactions' as NavTab,
      label: 'Transactions',
      icon: ArrowLeftRight,
      badge: unmatchedCount > 0 ? `${unmatchedCount} unlinked` : null,
      badgeColor: 'text-[#748097] bg-[#F6F7FB]',
    },
    {
      id: 'reconciliation' as NavTab,
      label: 'Reconciliation Studio',
      icon: GitCompare,
      badge: 'Signature',
      badgeColor: 'text-[#5B55E7] bg-[#EFEDFF]',
    },
    {
      id: 'invoices' as NavTab,
      label: 'Invoices & Receivables',
      icon: FileText,
      badge: null,
    },
    {
      id: 'anomalies' as NavTab,
      label: 'Anomaly Intelligence',
      icon: AlertTriangle,
      badge: openAnomaliesCount > 0 ? `${openAnomaliesCount} flagged` : null,
      badgeColor: 'text-[#DC5B67] bg-[#FFF0F2]',
    },
    {
      id: 'settlement' as NavTab,
      label: 'Settlement Center',
      icon: Scale,
      badge: pendingSettlementsCount > 0 ? `${pendingSettlementsCount} pending` : null,
      badgeColor: 'text-[#E5A33B] bg-[#FFF9ED]',
    },
    {
      id: 'ai-assistant' as NavTab,
      label: 'AI Finance Agent',
      icon: Sparkles,
      badge: 'Gemini',
      badgeColor: 'text-[#5B55E7] bg-[#EFEDFF]',
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports & Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings & Integrations',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#18243A]/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#E8EAF2] flex flex-col shrink-0 select-none transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & Workspace Header */}
        <div className="p-4 border-b border-[#E8EAF2]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              {/* Distinctive Custom Logo Symbol: Modern geometric interlocking ledger seal */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B55E7] via-[#4740D4] to-[#18243A] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(91,85,231,0.25)] relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xs" />
                <svg className="w-5 h-5 relative z-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7h16M4 12h10M4 17h16" />
                  <circle cx="18" cy="12" r="2.5" fill="#EFEDFF" stroke="#5B55E7" strokeWidth="1.5" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-extrabold tracking-tight text-[#18243A] leading-tight flex items-center gap-1.5">
                  SettleWise <span className="text-[#5B55E7]">AI</span>
                </div>
                <div className="text-[10.5px] text-[#748097] font-medium tracking-tight">
                  Smarter Settlements.
                </div>
              </div>
            </div>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 text-[#748097] hover:text-[#18243A]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Workspace Selector Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-[#F6F7FB] hover:bg-[#EEF0F8] border border-[#E8EAF2] rounded-xl text-left transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-md bg-white border border-[#E8EAF2] flex items-center justify-center text-[#5B55E7] shadow-xs">
                  <Building2 className="w-3 h-3" />
                </div>
                <div className="truncate">
                  <div className="text-[11.5px] font-bold text-[#18243A] leading-tight truncate">
                    {currentWorkspace}
                  </div>
                  <div className="text-[10px] text-[#748097] truncate">
                    Tier 1 · Production Sandbox
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#748097] shrink-0" />
            </button>

            {workspaceMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 p-1 bg-white border border-[#E8EAF2] rounded-xl shadow-[0_8px_24px_rgba(24,36,58,0.08)] z-30 space-y-0.5 text-xs">
                {['Acme Global HQ', 'Starlight Europe Corp', 'BioGenix Labs LLC'].map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      setCurrentWorkspace(ws);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      currentWorkspace === ws ? 'bg-[#EFEDFF] text-[#5B55E7] font-semibold' : 'text-[#18243A] hover:bg-[#F6F7FB]'
                    }`}
                  >
                    <span>{ws}</span>
                    {currentWorkspace === ws && <CheckCircle2 className="w-3.5 h-3.5 text-[#5B55E7]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-[#748097] uppercase tracking-wider">
            Settlement Intelligence
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#18243A] text-white shadow-[0_4px_12px_rgba(24,36,58,0.12)]'
                    : 'text-[#748097] hover:text-[#18243A] hover:bg-[#F6F7FB]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#EFEDFF]' : 'text-[#748097] group-hover:text-[#5B55E7]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md font-mono ${
                      isActive ? 'bg-white/15 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar: Status & Profile Card */}
        <div className="p-3 border-t border-[#E8EAF2] bg-[#FAFBFD] space-y-2.5 m-2 rounded-2xl">
          {/* Live Infrastructure Status */}
          <div className="p-2.5 bg-white border border-[#E8EAF2] rounded-xl text-xs space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#18243A]">
                <CreditCard className="w-3.5 h-3.5 text-[#0070BA]" />
                PayPal Sandbox
              </span>
              <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-[#159B72] bg-[#EDF9F5] px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159B72] inline-block" />
                ONLINE
              </span>
            </div>
            <div className="text-[10px] text-[#748097] leading-tight">
              REST v2 API · Auto Capture & Webhooks
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white transition-colors cursor-pointer group">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5B55E7] to-[#8C87F7] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                TG
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-[#18243A] leading-tight truncate">
                  Tanya Garg
                </div>
                <div className="text-[10px] text-[#748097] leading-tight truncate">
                  Chief Financial Officer
                </div>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#159B72] shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};
