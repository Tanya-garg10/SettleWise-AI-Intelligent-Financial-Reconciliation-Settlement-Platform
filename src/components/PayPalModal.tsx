import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ShieldCheck,
  Building,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { Invoice } from '../types';
import { api } from '../api';

interface PayPalModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PayPalModal: React.FC<PayPalModalProps> = ({
  invoice,
  onClose,
  onPaymentSuccess
}) => {
  const [step, setStep] = useState<'REVIEW' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('REVIEW');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [captureResult, setCaptureResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!invoice) return null;

  const handleInitiatePayPalPayment = async () => {
    setStep('PROCESSING');
    setErrorMessage(null);
    try {
      // 1. Create PayPal Order
      const order = await api.createPayPalOrder({
        amount: invoice.remainingAmount,
        currency: invoice.currency,
        invoiceId: invoice.id,
        description: `Settlement for invoice ${invoice.invoiceNumber}: ${invoice.description}`
      });

      setOrderId(order.orderId);

      // 2. Capture PayPal Payment (sandbox approval simulation or live capture)
      const capture = await api.capturePayPalPayment(order.orderId);
      setCaptureResult(capture);
      setStep('SUCCESS');
      onPaymentSuccess();
    } catch (err: unknown) {
      console.error('PayPal checkout error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'PayPal Sandbox processing failed.');
      setStep('ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18243A]/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#E8EAF2]">
        {/* PayPal Header */}
        <div className="bg-[#003087] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="text-xl font-black italic tracking-tight flex items-baseline">
              <span className="text-white">Pay</span>
              <span className="text-[#0079C1]">Pal</span>
              <span className="ml-2 not-italic text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white/90">
                SANDBOX
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {step === 'REVIEW' && (
            <>
              <div>
                <h3 className="text-base font-bold text-[#18243A]">
                  Direct PayPal Settlement
                </h3>
                <p className="text-xs text-[#748097] mt-0.5">
                  Authorize sandbox capture for invoice <span className="font-mono font-semibold text-[#18243A]">{invoice.invoiceNumber}</span>.
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl space-y-2.5">
                <div className="flex justify-between items-center text-[#748097]">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    Customer
                  </span>
                  <span className="font-semibold text-[#18243A]">{invoice.customerName}</span>
                </div>
                <div className="flex justify-between items-center text-[#748097]">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    Invoice Total
                  </span>
                  <span className="font-mono text-[#18243A]">${invoice.amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center text-[#748097]">
                  <span>Outstanding Balance</span>
                  <span className="font-mono text-[#18243A]">${invoice.remainingAmount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-[#E8EAF2] font-bold text-[#18243A]">
                  <span>Amount to Capture</span>
                  <span className="font-mono text-[#5B55E7] text-base">
                    ${invoice.remainingAmount.toFixed(2)} {invoice.currency}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#748097] text-[11px] bg-[#EFEDFF]/40 p-2.5 rounded-xl border border-[#EFEDFF]">
                <ShieldCheck className="w-4 h-4 text-[#159B72] shrink-0" />
                <span>Protected by PayPal Sandbox REST API OAuth 2.0 capture verification.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-[#748097] hover:text-[#18243A] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInitiatePayPalPayment}
                  className="px-5 py-2.5 bg-[#0070BA] hover:bg-[#003087] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Authorize & Pay with PayPal</span>
                </button>
              </div>
            </>
          )}

          {step === 'PROCESSING' && (
            <div className="py-10 text-center space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0070BA]" />
              <div>
                <h4 className="font-bold text-[#18243A] text-sm">
                  Connecting to PayPal Sandbox REST API...
                </h4>
                <p className="text-[#748097] text-xs mt-1">
                  Creating order & capturing payment units for invoice {invoice.invoiceNumber}.
                </p>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#159B72] flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-[#18243A]">
                  Payment Captured Successfully!
                </h3>
                <p className="text-[#748097] text-xs mt-1">
                  Transaction has been logged to the ledger and matched to invoice {invoice.invoiceNumber}.
                </p>
              </div>

              <div className="p-4 bg-[#F6F7FB] border border-[#E8EAF2] rounded-xl space-y-2 text-[#748097] font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-bold text-[#18243A]">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capture ID:</span>
                  <span className="font-bold text-[#18243A]">{captureResult?.captureId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Captured Amount:</span>
                  <span className="font-bold text-[#159B72]">${invoice.remainingAmount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Gateway Environment:</span>
                  <span className="font-bold text-[#18243A]">{captureResult?.source || 'SANDBOX'}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#18243A] hover:bg-[#253654] text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  Return to Receivables
                </button>
              </div>
            </div>
          )}

          {step === 'ERROR' && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-[#DC5B67] flex items-center justify-center mx-auto border border-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-[#18243A]">
                  Payment Capture Error
                </h3>
                <p className="text-[#DC5B67] text-xs mt-1">
                  {errorMessage}
                </p>
              </div>
              <button
                onClick={() => setStep('REVIEW')}
                className="w-full py-2.5 bg-[#18243A] text-white font-bold text-xs rounded-xl hover:bg-[#253654] transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
