import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Bot,
  User,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  FileText,
  AlertTriangle,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
  referencedTransactions?: string[];
  referencedInvoices?: string[];
}

interface AIAssistantViewProps {
  onSelectTransaction: (txnId: string) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ onSelectTransaction }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "Welcome to SettleWise AI Financial Copilot. I analyze your PayPal captures, deterministic reconciliation scores, open receivables, and flagged anomaly alerts.\n\nAsk any question grounded directly in your ledger records.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        'Why is transaction TXN-2010 unmatched?',
        'Show invoices overdue by more than 30 days',
        'Find possible duplicate payments in ledger',
        'Explain today’s reconciliation health results'
      ]
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await api.sendAIChat(text);
      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: response.suggestedQuestions,
        referencedTransactions: response.referencedTransactions,
        referencedInvoices: response.referencedInvoices
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I encountered an issue querying backend ledger context. Please verify that the application server is active.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col h-[calc(100vh-4.5rem)]">
      {/* Title Header */}
      <div className="pb-4 border-b border-[#E8EAF2] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5B55E7] to-[#8C87F7] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#18243A]">
                AI Finance Copilot & Investigation Agent
              </h1>
              <p className="text-xs text-[#748097]">
                Context-grounded reasoning using server-side Gemini 3.8 Flash. Never invents financial records.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#EFEDFF] border border-[#DCD9FF] rounded-xl text-xs font-mono text-[#5B55E7] font-semibold">
            <span>Model: gemini-3.8-flash</span>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 text-xs leading-relaxed ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-[#18243A] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Bot className="w-4 h-4 text-[#EFEDFF]" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4.5 space-y-3.5 ${
                msg.sender === 'user'
                  ? 'bg-[#18243A] text-white shadow-xs'
                  : 'bg-white border border-[#E8EAF2] text-[#18243A] shadow-xs'
              }`}
            >
              <div className="whitespace-pre-line text-[12.5px] leading-relaxed">
                {msg.text}
              </div>

              {/* Referenced Transaction Context Cards */}
              {msg.referencedTransactions && msg.referencedTransactions.length > 0 && (
                <div className="pt-2 border-t border-[#E8EAF2] flex flex-wrap items-center gap-2">
                  <span className="text-[10.5px] text-[#748097] font-bold uppercase tracking-wider">Inspect Records:</span>
                  {msg.referencedTransactions.map((txId) => (
                    <button
                      key={txId}
                      onClick={() => onSelectTransaction(txId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EFEDFF] hover:bg-[#DCD9FF] text-[#5B55E7] font-mono text-[11px] font-bold transition-colors"
                    >
                      <span>{txId}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}

              {/* Suggested Questions */}
              {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="pt-2 border-t border-[#E8EAF2] space-y-1.5">
                  <div className="text-[10.5px] text-[#748097] font-bold uppercase tracking-wider">Suggested queries:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="px-3 py-1 rounded-xl bg-[#F6F7FB] hover:bg-[#EEF0F8] text-[#18243A] text-[11px] font-semibold border border-[#E8EAF2] transition-colors text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`text-[10px] text-right font-mono ${
                  msg.sender === 'user' ? 'text-[#B4B9CE]' : 'text-[#748097]'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5B55E7] to-[#8C87F7] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                TG
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-[#18243A] text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[#EFEDFF]" />
            </div>
            <div className="bg-white border border-[#E8EAF2] rounded-2xl p-4 text-[#748097] flex items-center gap-2.5 shadow-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-[#5B55E7]" />
              <span>Analyzing ledger invariants and formulating explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box with Modern Ramp/Linear Styling */}
      <div className="pt-3 border-t border-[#E8EAF2] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-[#E8EAF2] shadow-xs"
        >
          <input
            type="text"
            placeholder="Ask about payments, overdue invoices, reconciliation scores, or anomaly findings..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 px-3 py-2 bg-transparent text-xs text-[#18243A] placeholder-[#748097] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-4 py-2 bg-[#5B55E7] hover:bg-[#4740D4] disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
