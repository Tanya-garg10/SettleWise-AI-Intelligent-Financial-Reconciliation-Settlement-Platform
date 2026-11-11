import React, { useState, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import {
  Download,
  Filter,
  Search,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Transaction } from '../types';
import { useToast } from './Toast';

interface TransactionsViewProps {
  transactions: Transaction[];
  onSelectTransaction: (txnId: string) => void;
  onOpenNewTransactionModal: () => void;
  searchFilter: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onSelectTransaction,
  onOpenNewTransactionModal,
  searchFilter
}) => {
  const { showToast } = useToast();
  const gridRef = useRef<AgGridReact<Transaction>>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [quickFilterText, setQuickFilterText] = useState<string>(searchFilter);

  // Filtered rows based on status & source selectors
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      if (statusFilter !== 'ALL' && t.reconciliationStatus !== statusFilter) return false;
      if (sourceFilter !== 'ALL' && t.source !== sourceFilter) return false;
      return true;
    });
  }, [transactions, statusFilter, sourceFilter]);

  const handleExportCSV = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `settlewise-transactions-${Date.now()}.csv`
      });
      showToast('Export Successful', 'Downloaded transaction ledger as CSV', 'success');
    } else {
      window.open('/api/export/csv?type=transactions', '_blank');
      showToast('Export Initiated', 'Preparing CSV download stream...', 'info');
    }
  };

  // AG Grid Column Definitions
  const columnDefs: ColDef<Transaction>[] = useMemo(() => [
    {
      headerName: 'Transaction ID',
      field: 'transactionId',
      minWidth: 175,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: ICellRendererParams<Transaction>) => {
        const val = params.value;
        const source = params.data?.source;
        return (
          <div className="flex items-center gap-2 py-0.5">
            <span className="font-mono font-bold text-[#18243A] text-xs">
              {val}
            </span>
            {source === 'SANDBOX' && (
              <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#EAF1FF] text-[#003087]">
                SBX
              </span>
            )}
          </div>
        );
      }
    },
    {
      headerName: 'PayPal Order Ref',
      field: 'paypalOrderId',
      minWidth: 160,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: ICellRendererParams<Transaction>) => {
        const orderId = params.value || params.data?.paypalCaptureId;
        return (
          <span className="font-mono text-xs text-[#748097]">
            {orderId || '—'}
          </span>
        );
      }
    },
    {
      headerName: 'Customer / Payer',
      field: 'customerName',
      minWidth: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: ICellRendererParams<Transaction>) => {
        const name = params.value || 'Unknown Customer';
        const initials = name.split(' ').map((n: string) => n[0]).slice(0, 2).join('');
        return (
          <div className="flex items-center gap-2.5 py-1">
            <div className="w-6 h-6 rounded-full bg-[#EFEDFF] text-[#5B55E7] font-bold text-[10px] flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-[#18243A] truncate leading-tight">
                {name}
              </div>
              <div className="text-[10.5px] text-[#748097] truncate leading-tight">
                {params.data?.customerEmail}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      headerName: 'Captured Amount',
      field: 'amount',
      minWidth: 140,
      filter: 'agNumberColumnFilter',
      cellClass: 'text-right',
      headerClass: 'ag-right-aligned-header',
      cellRenderer: (params: ICellRendererParams<Transaction>) => {
        const val = params.value || 0;
        const curr = params.data?.currency || 'USD';
        return (
          <span className="font-mono font-extrabold text-[#18243A] text-xs tabular-nums">
            ${val.toFixed(2)} <span className="text-[10px] text-[#748097] font-normal">{curr}</span>
          </span>
        );
      }
    },
    {
      headerName: 'Date',
      field: 'paymentDate',
      minWidth: 135,
      filter: 'agDateColumnFilter',
      cellRenderer: (params: ICellRendererParams<Transaction>) => {
        const val = params.value;
        if (!val) return '—';
        const formatted = new Date(val).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        return <span className="text-xs text-[#748097] font-mono">{formatted}</span>;
      }
    },
    {
      headerName: 'Invoice Ref',
      field: 'invoiceReference',
      minWidth: 135,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: ICellRendererParams<Transaction>) => {
        const val = params.value;
        return val ? (
          <span className="font-mono text-[11px] font-bold text-[#5B55E7] bg-[#EFEDFF] px-2 py-0.5 rounded">
            {val}
          </span>
        ) : (
          <span className="text-xs text-[#748097] italic">Unlinked</span>
        );
      }
    },
    {
      headerName: 'Reconciliation Status',
      field: 'reconciliationStatus',
      minWidth: 175,
      filter: 'agSetColumnFilter',
      cellRenderer: (params: ICellRendererParams<Transaction>) => {
        const status = params.value;
        const score = params.data?.reconciliationScore;

        if (status === 'RECONCILED' || status === 'EXACT_MATCH') {
          return (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#159B72] bg-[#EDF9F5] px-2.5 py-0.5 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#159B72]" />
              Reconciled {score ? `(${score}%)` : ''}
            </span>
          );
        } else if (status === 'PARTIAL_MATCH') {
          return (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5B55E7] bg-[#EFEDFF] px-2.5 py-0.5 rounded-md">
              <Clock className="w-3.5 h-3.5 text-[#5B55E7]" />
              Partial Match
            </span>
          );
        } else if (status === 'MANUAL_REVIEW') {
          return (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#E5A33B] bg-[#FFF9ED] px-2.5 py-0.5 rounded-md">
              <AlertCircle className="w-3.5 h-3.5 text-[#E5A33B]" />
              Review Needed ({score}%)
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#748097] bg-[#F6F7FB] px-2.5 py-0.5 rounded-md">
              Unmatched
            </span>
          );
        }
      }
    },
    {
      headerName: 'Risk',
      field: 'riskIndicator',
      width: 100,
      cellRenderer: (params: ICellRendererParams<Transaction>) => {
        const risk = params.value;
        return (
          <span
            className={`text-[9.5px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
              risk === 'HIGH'
                ? 'bg-[#FFF0F2] text-[#DC5B67]'
                : risk === 'MEDIUM'
                ? 'bg-[#FFF9ED] text-[#E5A33B]'
                : 'text-[#748097]'
            }`}
          >
            {risk}
          </span>
        );
      }
    },
    {
      headerName: 'Forensics',
      width: 120,
      pinned: 'right',
      cellRenderer: (params: ICellRendererParams<Transaction>) => {
        return (
          <button
            onClick={() => params.data && onSelectTransaction(params.data.id)}
            className="text-xs font-bold text-[#5B55E7] hover:text-[#3730A3] flex items-center gap-1 py-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5B55E7]" />
            <span>Investigate</span>
          </button>
        );
      }
    }
  ], [onSelectTransaction]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), []);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#18243A]">
            Transaction Explorer
          </h1>
          <p className="text-xs text-[#748097] mt-1">
            Enterprise AG Grid ledger with instant filtering, risk markers, CSV export, and forensic investigation drawers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewTransactionModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#18243A] bg-white border border-[#E8EAF2] hover:bg-[#F6F7FB] rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#5B55E7]" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#18243A] hover:bg-[#253755] active:scale-[0.98] rounded-xl shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#EFEDFF]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Status Tabs & Quick Filter */}
      <div className="card-elevated rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs overflow-x-auto max-w-full">
          {[
            { id: 'ALL', label: 'All Transactions' },
            { id: 'RECONCILED', label: 'Reconciled' },
            { id: 'MANUAL_REVIEW', label: 'Review Needed' },
            { id: 'UNMATCHED', label: 'Unmatched' },
            { id: 'PARTIAL_MATCH', label: 'Partials' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-[#18243A] shadow-xs'
                  : 'text-[#748097] hover:text-[#18243A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Source Selector & Search */}
        <div className="flex items-center gap-3">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs font-semibold text-[#18243A] focus:outline-none focus:border-[#5B55E7]"
          >
            <option value="ALL">All Environments</option>
            <option value="SANDBOX">PayPal Sandbox Only</option>
            <option value="DEMO">Demo Ledger Only</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#748097]" />
            <input
              type="text"
              placeholder="Search grid..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs text-[#18243A] focus:outline-none focus:bg-white focus:border-[#5B55E7] w-48 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* AG Grid Quartz Container */}
      <div className="card-elevated rounded-2xl overflow-hidden shadow-xs">
        <div className="ag-theme-quartz w-full" style={{ height: '580px' }}>
          <AgGridReact<Transaction>
            ref={gridRef}
            rowData={filteredData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            quickFilterText={quickFilterText}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            rowSelection="single"
            onRowClicked={(e) => {
              if (e.data) {
                onSelectTransaction(e.data.id);
              }
            }}
            animateRows={true}
          />
        </div>

        {/* Footer Statistics */}
        <div className="px-6 py-3.5 border-t border-[#E8EAF2] bg-[#FAFBFD] flex flex-wrap items-center justify-between text-xs text-[#748097]">
          <div className="flex items-center gap-3 font-medium">
            <span>Showing <strong className="text-[#18243A] font-mono font-bold">{filteredData.length}</strong> transactions</span>
            <span>·</span>
            <span>Completed Volume: <strong className="text-[#159B72] font-mono font-bold">${filteredData.reduce((s, t) => s + (t.paymentStatus === 'COMPLETED' ? t.amount : 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</strong></span>
          </div>

          <div className="text-[11px] text-[#748097]">
            Click any row to open the full payment timeline, linked invoice, and AI investigation drawer.
          </div>
        </div>
      </div>
    </div>
  );
};
