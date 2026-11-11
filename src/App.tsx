import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { OverviewView } from './components/OverviewView';
import { TransactionsView } from './components/TransactionsView';
import { ReconciliationView } from './components/ReconciliationView';
import { InvoicesView } from './components/InvoicesView';
import { AnomalyView } from './components/AnomalyView';
import { SettlementView } from './components/SettlementView';
import { AIAssistantView } from './components/AIAssistantView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { TransactionDrawer } from './components/TransactionDrawer';
import { PayPalModal } from './components/PayPalModal';
import { CommandPalette } from './components/CommandPalette';
import { ToastProvider, useToast } from './components/Toast';
import {
  NavTab,
  OverviewStatsResponse,
  Transaction,
  Invoice,
  AnomalyAlert,
  SettlementRecommendation,
  AuditLog
} from './types';
import { api } from './api';

function SettleWiseAppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<OverviewStatsResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [settlements, setSettlements] = useState<SettlementRecommendation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [paypalStatus, setPaypalStatus] = useState<'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR'>('NOT_CONFIGURED');

  const [isLoading, setIsLoading] = useState(true);
  const [isReconciling, setIsReconciling] = useState(false);

  // Modals & Panels
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { addToast } = useToast();

  // Fetch all core application data
  const loadData = useCallback(async () => {
    try {
      const [
        statsRes,
        txnsRes,
        invsRes,
        anomsRes,
        settlesRes,
        logsRes,
        paypalRes
      ] = await Promise.all([
        api.getOverviewStats(),
        api.getTransactions(),
        api.getInvoices(),
        api.getAnomalies(),
        api.getSettlements(),
        api.getAuditLogs(),
        api.getPayPalStatus()
      ]);

      setStats(statsRes);
      setTransactions(txnsRes);
      setInvoices(invsRes);
      setAnomalies(anomsRes);
      setSettlements(settlesRes);
      setAuditLogs(logsRes);
      setPaypalStatus(paypalRes.status);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle top bar quick reconciliation run
  const handleRunReconciliation = async () => {
    setIsReconciling(true);
    try {
      const result = await api.runReconciliation();
      await loadData();
      setActiveTab('reconciliation');
      addToast(
        `Batch reconciliation completed. ${result.run.exactMatchesCount} exact matches, ${result.run.reviewRecommendedCount} proposed for review, ${result.run.unmatchedCount} unlinked.`,
        'success'
      );
    } catch (err) {
      console.error('Reconciliation batch failed:', err);
      addToast('Reconciliation run encountered an error.', 'error');
    } finally {
      setIsReconciling(false);
    }
  };

  // One-click demo data reset
  const handleSeedDemoData = async () => {
    try {
      await api.resetDemoData();
      await loadData();
      addToast('Workspace restored to 25 benchmark invoices and 35 transactions.', 'info');
    } catch (err) {
      console.error('Demo reset failed:', err);
      addToast('Failed to reset demo data.', 'error');
    }
  };

  // Quick transaction drawer opening
  const handleSelectTransaction = (txnId: string) => {
    setSelectedTxnId(txnId);
  };

  const handleExportCSV = () => {
    window.location.href = '/api/export/csv?type=transactions';
    addToast('Downloading transactions CSV ledger export...', 'info');
  };

  const openAnomaliesCount = anomalies.filter(a => a.status === 'OPEN').length;
  const pendingSettlementsCount = settlements.filter(s => s.approvalStatus === 'PENDING_APPROVAL').length;
  const unmatchedCount = transactions.filter(t => t.reconciliationStatus === 'UNMATCHED').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F6F7FB] text-[#18243A] font-sans antialiased">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMobileOpen(false);
        }}
        openAnomaliesCount={openAnomaliesCount}
        pendingSettlementsCount={pendingSettlementsCount}
        unmatchedCount={unmatchedCount}
        paypalStatus={paypalStatus}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar with Search & Quick Actions */}
        <TopNav
          activeTab={activeTab}
          onRunReconciliation={handleRunReconciliation}
          isReconciling={isReconciling}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          paypalStatus={paypalStatus}
          onSeedDemo={handleSeedDemoData}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          openAnomaliesCount={openAnomaliesCount}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewView
              stats={stats}
              isLoading={isLoading}
              onNavigateTab={setActiveTab}
              onSelectTransaction={handleSelectTransaction}
              onRunReconciliation={handleRunReconciliation}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              onSelectTransaction={handleSelectTransaction}
              onOpenNewTransactionModal={() => setActiveTab('invoices')}
              searchFilter={searchQuery}
            />
          )}

          {activeTab === 'reconciliation' && (
            <ReconciliationView
              transactions={transactions}
              invoices={invoices}
              onRefreshData={loadData}
              onSelectTransaction={handleSelectTransaction}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              onRefreshData={loadData}
              onPayInvoiceWithPayPal={(inv) => setPayingInvoice(inv)}
            />
          )}

          {activeTab === 'anomalies' && (
            <AnomalyView
              anomalies={anomalies}
              onRefreshData={loadData}
              onSelectTransaction={handleSelectTransaction}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'settlement' && (
            <SettlementView
              settlements={settlements}
              onRefreshData={loadData}
              onSelectTransaction={handleSelectTransaction}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AIAssistantView
              onSelectTransaction={handleSelectTransaction}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              auditLogs={auditLogs}
              transactions={transactions}
              invoices={invoices}
              anomalies={anomalies}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onRefreshData={loadData}
            />
          )}
        </main>
      </div>

      {/* Slide-out Transaction Investigation Center */}
      <TransactionDrawer
        transactionId={selectedTxnId}
        onClose={() => setSelectedTxnId(null)}
        onTransactionUpdated={loadData}
      />

      {/* PayPal Sandbox Checkout Modal */}
      <PayPalModal
        invoice={payingInvoice}
        onClose={() => setPayingInvoice(null)}
        onPaymentSuccess={() => {
          loadData();
          addToast('PayPal Sandbox payment captured and matched successfully.', 'success');
        }}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onToggle={() => setIsCommandPaletteOpen(prev => !prev)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        onRunReconciliation={() => {
          setIsCommandPaletteOpen(false);
          handleRunReconciliation();
        }}
        onResetDemo={() => {
          setIsCommandPaletteOpen(false);
          handleSeedDemoData();
        }}
        onExportCSV={() => {
          setIsCommandPaletteOpen(false);
          handleExportCSV();
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <SettleWiseAppContent />
    </ToastProvider>
  );
}

export default App;
