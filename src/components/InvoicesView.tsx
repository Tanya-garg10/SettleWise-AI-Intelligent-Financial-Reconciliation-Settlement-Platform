import React, { useState } from 'react';
import {
  FileText,
  Plus,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ExternalLink,
  DollarSign,
  Download,
  Search,
  Upload,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Invoice } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface InvoicesViewProps {
  invoices: Invoice[];
  onRefreshData: () => void;
  onPayInvoiceWithPayPal: (invoice: Invoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  onRefreshData,
  onPayInvoiceWithPayPal
}) => {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<Invoice | null>(null);

  const [newInvoiceData, setNewInvoiceData] = useState({
    customerName: '',
    customerEmail: '',
    amount: '',
    description: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceData.customerName || !newInvoiceData.amount) return;

    setIsSubmitting(true);
    try {
      await api.createInvoice({
        customerName: newInvoiceData.customerName,
        customerEmail: newInvoiceData.customerEmail || 'billing@customer.com',
        amount: parseFloat(newInvoiceData.amount),
        description: newInvoiceData.description || 'Enterprise Technology Consulting Q4',
        dueDate: newInvoiceData.dueDate
      });

      showToast('Invoice Published', `Invoice created for ${newInvoiceData.customerName}`, 'success');
      setShowCreateModal(false);
      setNewInvoiceData({
        customerName: '',
        customerEmail: '',
        amount: '',
        description: '',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      onRefreshData();
    } catch (err) {
      console.error('Failed to create invoice:', err);
      showToast('Creation Failed', 'Could not create invoice record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalOutstanding = invoices.reduce((s, i) => s + i.remainingAmount, 0);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#18243A]">
            Invoices & Receivables Management
          </h1>
          <p className="text-xs text-[#748097] mt-1">
            Accounts receivable aging ledger, partial payment tracking, and in-app PayPal Sandbox checkout integration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/export/csv?type=invoices"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#18243A] bg-white border border-[#E8EAF2] hover:bg-[#F6F7FB] rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#748097]" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#5B55E7] hover:bg-[#4740D4] active:scale-[0.98] rounded-xl shadow-[0_2px_8px_rgba(91,85,231,0.25)] transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#EFEDFF]" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-elevated rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs overflow-x-auto max-w-full">
          {[
            { id: 'ALL', label: `All (${invoices.length})` },
            { id: 'UNPAID', label: `Unpaid (${invoices.filter(i => i.status === 'UNPAID').length})` },
            { id: 'OVERDUE', label: `Overdue (${invoices.filter(i => i.status === 'OVERDUE').length})` },
            { id: 'PARTIALLY_PAID', label: `Partials (${invoices.filter(i => i.status === 'PARTIALLY_PAID').length})` },
            { id: 'PAID', label: `Paid (${invoices.filter(i => i.status === 'PAID').length})` },
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

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#748097]" />
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs text-[#18243A] focus:outline-none focus:bg-white focus:border-[#5B55E7] w-64 transition-colors"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card-elevated rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFE] border-b border-[#E8EAF2] text-[#748097] uppercase font-bold text-[10.5px] tracking-wider">
              <tr>
                <th className="py-3 px-5">Invoice Number</th>
                <th className="py-3 px-5">Customer Account</th>
                <th className="py-3 px-5">Service Deliverable</th>
                <th className="py-3 px-5 text-right">Total Amount</th>
                <th className="py-3 px-5 text-right">Remaining Due</th>
                <th className="py-3 px-5">Due Date</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAF2]">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => setSelectedInvoiceForDetail(inv)}
                  className="hover:bg-[#F6F7FB] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-5 font-mono font-bold text-[#18243A]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-[#18243A]">{inv.customerName}</div>
                    <div className="text-[11px] text-[#748097]">{inv.customerEmail}</div>
                  </td>
                  <td className="py-3.5 px-5 text-[#748097] max-w-xs truncate">
                    {inv.description}
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-right text-[#18243A] tabular-nums">
                    ${inv.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-5 font-mono font-extrabold text-right tabular-nums">
                    <span className={inv.remainingAmount > 0 ? 'text-[#18243A]' : 'text-[#748097]'}>
                      ${inv.remainingAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[#748097]">
                    {inv.dueDate}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                        inv.status === 'PAID'
                          ? 'bg-[#EDF9F5] text-[#159B72]'
                          : inv.status === 'OVERDUE'
                          ? 'bg-[#FFF0F2] text-[#DC5B67]'
                          : inv.status === 'PARTIALLY_PAID'
                          ? 'bg-[#EFEDFF] text-[#5B55E7]'
                          : 'bg-[#F6F7FB] text-[#748097]'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                    {inv.remainingAmount > 0 ? (
                      <button
                        onClick={() => onPayInvoiceWithPayPal(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#003087] bg-[#EAF1FF] hover:bg-[#D5E3FF] rounded-xl transition-colors shadow-2xs"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#0070BA]" />
                        <span>Pay with PayPal</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#159B72] font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-6 py-3.5 border-t border-[#E8EAF2] bg-[#FAFBFD] flex items-center justify-between text-xs text-[#748097]">
          <span>Total Receivables: <strong className="text-[#18243A] font-mono font-bold">${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</strong></span>
          <span className="text-[11px]">Click any invoice row to view line items and matched payments.</span>
        </div>
      </div>

      {/* Invoice Detail Modal / Drawer */}
      {selectedInvoiceForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18243A]/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(24,36,58,0.2)] max-w-lg w-full p-6 space-y-4 border border-[#E8EAF2]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF2]">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EFEDFF] text-[#5B55E7] uppercase">
                  {selectedInvoiceForDetail.status}
                </span>
                <h3 className="text-base font-extrabold text-[#18243A] font-mono mt-1">
                  {selectedInvoiceForDetail.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceForDetail(null)}
                className="text-[#748097] hover:text-[#18243A] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#F6F7FB] rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#748097]">Customer</span>
                  <span className="font-bold text-[#18243A]">{selectedInvoiceForDetail.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#748097]">Email</span>
                  <span className="font-mono text-[#18243A]">{selectedInvoiceForDetail.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#748097]">Due Date</span>
                  <span className="font-mono text-[#18243A]">{selectedInvoiceForDetail.dueDate}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E8EAF2] font-bold text-sm">
                  <span>Balance Remaining</span>
                  <span className="font-mono text-[#5B55E7]">${selectedInvoiceForDetail.remainingAmount.toFixed(2)} USD</span>
                </div>
              </div>

              <div>
                <div className="font-bold text-[#18243A] mb-1">Service Items</div>
                <p className="text-[#748097] leading-relaxed bg-[#FAFBFD] p-3 rounded-xl border border-[#E8EAF2]">
                  {selectedInvoiceForDetail.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8EAF2] flex items-center justify-between">
              <button
                onClick={() => setSelectedInvoiceForDetail(null)}
                className="px-4 py-2 text-xs font-bold text-[#748097] hover:text-[#18243A]"
              >
                Close
              </button>

              {selectedInvoiceForDetail.remainingAmount > 0 && (
                <button
                  onClick={() => {
                    const inv = selectedInvoiceForDetail;
                    setSelectedInvoiceForDetail(null);
                    onPayInvoiceWithPayPal(inv);
                  }}
                  className="px-4 py-2 bg-[#0070BA] hover:bg-[#003087] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Launch PayPal Checkout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18243A]/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(24,36,58,0.2)] max-w-lg w-full p-6 space-y-4 border border-[#E8EAF2]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF2]">
              <h3 className="text-base font-extrabold text-[#18243A]">
                Create Receivable Invoice
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#748097] hover:text-[#18243A] p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#18243A]">Client / Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Industrial Systems"
                  value={newInvoiceData.customerName}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, customerName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs text-[#18243A] focus:bg-white focus:outline-none focus:border-[#5B55E7]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#18243A]">Client Billing Email</label>
                <input
                  type="email"
                  placeholder="billing@apexindustrial.com"
                  value={newInvoiceData.customerEmail}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs text-[#18243A] focus:bg-white focus:outline-none focus:border-[#5B55E7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#18243A]">Total Amount (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="4200.00"
                    value={newInvoiceData.amount}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs text-[#18243A] focus:bg-white focus:outline-none focus:border-[#5B55E7] font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#18243A]">Due Date</label>
                  <input
                    type="date"
                    value={newInvoiceData.dueDate}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs text-[#18243A] focus:bg-white focus:outline-none focus:border-[#5B55E7] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#18243A]">Deliverable Description</label>
                <textarea
                  rows={2}
                  placeholder="Cloud architecture review & high-throughput API gateway deployment"
                  value={newInvoiceData.description}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl text-xs text-[#18243A] focus:bg-white focus:outline-none focus:border-[#5B55E7]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8EAF2] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-[#748097] hover:text-[#18243A] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#18243A] hover:bg-[#253755] disabled:opacity-60 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Publishing...' : 'Save & Publish Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
