import React, { useState, useEffect } from 'react';
import {
  Settings,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  Server,
  Terminal,
  Download,
  ShieldCheck,
  Cpu,
  KeyRound,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../api';

interface SettingsViewProps {
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshData }) => {
  const [paypalStatus, setPaypalStatus] = useState<{
    status: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
    message: string;
    baseUrl: string;
    hasCredentials: boolean;
    webhookIdConfigured: boolean;
  } | null>(null);

  const [isTestingPayPal, setIsTestingPayPal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setIsTestingPayPal(true);
    try {
      const res = await api.getPayPalStatus();
      setPaypalStatus(res);
    } catch (err) {
      console.error('Failed to get PayPal status:', err);
    } finally {
      setIsTestingPayPal(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset database to initial benchmark state with 25 invoices and 35 payment records?')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetDemoData();
      setResetMessage('Database successfully re-seeded with 25 invoices and 35 benchmark transactions.');
      onRefreshData();
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B55E7] bg-[#EFEDFF] px-2.5 py-0.5 rounded-md">
            System & Infrastructure
          </span>
          <span className="text-xs text-[#748097]">Production-Grade Architecture</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#18243A]">
          Integrations & System Settings
        </h1>
        <p className="text-sm text-[#748097] mt-1 max-w-2xl">
          Review PayPal Developer Platform credentials, APIMatic context plugin schemas, Render deployment blueprint, and demo ledger controls.
        </p>
      </div>

      {resetMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-[#159B72] rounded-2xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#159B72] shrink-0" />
            <span className="font-medium text-[#18243A]">{resetMessage}</span>
          </div>
          <button
            onClick={() => setResetMessage(null)}
            className="text-xs font-bold text-[#748097] hover:text-[#18243A] px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. PayPal Developer Platform Card */}
      <div className="bg-white border border-[#E8EAF2] rounded-2xl p-6 shadow-xs card-elevated space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8EAF2]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#003087] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              PP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#18243A]">
                  PayPal Developer Platform (Sandbox)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EFEDFF] text-[#5B55E7] font-semibold">
                  REST v2
                </span>
              </div>
              <p className="text-xs text-[#748097] mt-0.5">
                Orders v2, Payment Capture API, and Automated Webhook Dispatches
              </p>
            </div>
          </div>

          <button
            onClick={checkStatus}
            disabled={isTestingPayPal}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F6F7FB] border border-[#E8EAF2] hover:bg-white rounded-xl transition-all shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#5B55E7] ${isTestingPayPal ? 'animate-spin' : ''}`} />
            <span>{isTestingPayPal ? 'Verifying...' : 'Test Connection'}</span>
          </button>
        </div>

        {paypalStatus && (
          <div className="p-4 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#18243A]">Gateway Handshake:</span>
              <span
                className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  paypalStatus.status === 'CONNECTED'
                    ? 'bg-emerald-100 text-[#159B72]'
                    : 'bg-amber-100 text-[#E5A33B]'
                }`}
              >
                {paypalStatus.status}
              </span>
            </div>

            <p className="text-[#748097] text-xs leading-relaxed">
              {paypalStatus.message}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#748097] pt-2 border-t border-[#E8EAF2] font-mono">
              <div>Endpoint: <span className="text-[#18243A] font-semibold">{paypalStatus.baseUrl}</span></div>
              <div>Credentials Mode: <span className="text-[#18243A] font-semibold">{paypalStatus.hasCredentials ? 'Configured (Live Sandbox)' : 'Active (Built-in Dev Mode)'}</span></div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#18243A] flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-[#748097]" />
            Environment Configuration (.env.example):
          </div>
          <pre className="p-3.5 bg-[#18243A] text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=your_webhook_id`}
          </pre>
        </div>
      </div>

      {/* 2. APIMatic Context Plugin Card */}
      <div className="bg-white border border-[#E8EAF2] rounded-2xl p-6 shadow-xs card-elevated space-y-4">
        <div className="flex items-center gap-3.5 pb-3 border-b border-[#E8EAF2]">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#18243A]">
                APIMatic Context Plugin
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                Official Plugin
              </span>
            </div>
            <p className="text-xs text-[#748097] mt-0.5">
              PayPal REST API Code Generation & Schema Context
            </p>
          </div>
        </div>

        <p className="text-xs text-[#748097] leading-relaxed">
          The APIMatic PayPal Context Plugin injects validated API contracts, TypeScript interfaces, and error-handling pipelines for PayPal Orders v2 and Webhook event structures directly into LLM developer context.
        </p>

        <div className="p-3.5 bg-[#18243A] text-slate-200 rounded-xl font-mono text-xs flex items-center justify-between border border-slate-800">
          <span className="text-indigo-300">npx context-plugins install paypal</span>
          <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider font-semibold">CLI Command</span>
        </div>
      </div>

      {/* 3. Render Deployment & Postman Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Render Blueprint Card */}
        <div className="bg-white border border-[#E8EAF2] rounded-2xl p-6 shadow-xs card-elevated space-y-3">
          <div className="flex items-center gap-3 pb-2.5 border-b border-[#E8EAF2]">
            <div className="w-8 h-8 rounded-lg bg-[#EFEDFF] text-[#5B55E7] flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#18243A]">Render Blueprint</h3>
              <p className="text-[11px] text-[#748097]">Infrastructure as Code</p>
            </div>
          </div>
          <p className="text-xs text-[#748097] leading-relaxed">
            Multi-tier Render deployment manifest (<code className="font-mono text-[#18243A] font-semibold">render.yaml</code>) deploying the SPA frontend, Express API layer, and automated environment hooks.
          </p>
          <div className="text-[11px] text-[#5B55E7] font-mono bg-[#EFEDFF]/60 px-3 py-1.5 rounded-lg border border-[#5B55E7]/20">
            Source file: /render.yaml
          </div>
        </div>

        {/* Postman Collection Card */}
        <div className="bg-white border border-[#E8EAF2] rounded-2xl p-6 shadow-xs card-elevated space-y-3">
          <div className="flex items-center gap-3 pb-2.5 border-b border-[#E8EAF2]">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#E5A33B] flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#18243A]">Postman Test Suite</h3>
              <p className="text-[11px] text-[#748097]">Interactive Collection</p>
            </div>
          </div>
          <p className="text-xs text-[#748097] leading-relaxed">
            Pre-configured requests for PayPal order creation, captures, webhook signatures, and Gemini 3.8 Flash reconciliation prompts.
          </p>
          <div>
            <a
              href="/settlewise.postman_collection.json"
              download="settlewise.postman_collection.json"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B55E7] hover:text-[#3730A3] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Postman Collection (.JSON)</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4. Demo Data Seeder */}
      <div className="bg-white border border-[#E8EAF2] rounded-2xl p-6 shadow-xs card-elevated space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E8EAF2]">
          <div className="w-10 h-10 rounded-xl bg-[#F6F7FB] text-[#18243A] flex items-center justify-center font-bold border border-[#E8EAF2]">
            <Database className="w-5 h-5 text-[#5B55E7]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#18243A]">
              Workspace Demo Data Controls
            </h3>
            <p className="text-xs text-[#748097]">
              Reset or reload the benchmark testing dataset
            </p>
          </div>
        </div>

        <p className="text-xs text-[#748097] leading-relaxed">
          Reinitializes the in-memory SQLite/ledger store with 25 customer invoices and 35 payment transactions (including exact 1:1 matches, partial payments, cross-currency variances, and duplicate payment candidates).
        </p>

        <button
          onClick={handleResetData}
          disabled={isResetting}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#18243A] hover:bg-[#253654] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-300 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting Ledger Data...' : 'Re-Seed Demo Workspace (25 Invoices / 35 Txns)'}</span>
        </button>
      </div>
    </div>
  );
};
