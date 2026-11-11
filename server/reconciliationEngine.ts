import { db } from './db';
import {
  Transaction,
  Invoice,
  ReconciliationMatch,
  ReconciliationRun,
  ReconciliationScoreBreakdown
} from './types';

// Safe 2-decimal rounding to prevent floating point inaccuracy
function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

// Token-based string similarity
function calculateStringSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  const clean1 = s1.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
  const clean2 = s2.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
  if (clean1 === clean2) return 1.0;

  const tokens1 = new Set(clean1.split(/\s+/).filter(t => t.length > 2));
  const tokens2 = new Set(clean2.split(/\s+/).filter(t => t.length > 2));
  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let common = 0;
  for (const t of tokens1) {
    if (tokens2.has(t)) common++;
  }
  const union = new Set([...tokens1, ...tokens2]).size;
  return union > 0 ? common / union : 0;
}

export function evaluateTransactionInvoiceMatch(
  txn: Transaction,
  invoice: Invoice
): { score: number; breakdown: ReconciliationScoreBreakdown; matchType: 'EXACT' | 'PARTIAL' | 'AMOUNT_MISMATCH' | 'MULTIPLE_CANDIDATES' } {
  // 1. Invoice reference match (max 35)
  let invoiceRefScore = 0;
  const cleanTxnRef = (txn.invoiceReference || '').trim().toLowerCase();
  const cleanInvNum = invoice.invoiceNumber.trim().toLowerCase();
  const cleanInvId = invoice.id.trim().toLowerCase();

  if (cleanTxnRef && (cleanTxnRef === cleanInvNum || cleanTxnRef === cleanInvId)) {
    invoiceRefScore = 35;
  } else if (cleanTxnRef && (cleanTxnRef.includes(cleanInvNum) || cleanInvNum.includes(cleanTxnRef))) {
    invoiceRefScore = 28;
  } else if (txn.notes && (txn.notes.toLowerCase().includes(cleanInvNum) || txn.notes.toLowerCase().includes(cleanInvId))) {
    invoiceRefScore = 25;
  }

  // 2. Amount match (max 30)
  let amountScore = 0;
  const txnAmount = round2(txn.amount);
  const invRemaining = round2(invoice.remainingAmount > 0 ? invoice.remainingAmount : invoice.amount);
  const invTotal = round2(invoice.amount);

  let matchType: 'EXACT' | 'PARTIAL' | 'AMOUNT_MISMATCH' | 'MULTIPLE_CANDIDATES' = 'EXACT';

  if (txnAmount === invTotal || txnAmount === invRemaining) {
    amountScore = 30;
    matchType = 'EXACT';
  } else if (txnAmount < invRemaining && txnAmount > 0) {
    // Partial payment
    amountScore = 20;
    matchType = 'PARTIAL';
  } else if (Math.abs(txnAmount - invRemaining) <= 50.00) {
    // Under/Overpayment within minor variance ($50 fee or fx tolerance)
    amountScore = 18;
    matchType = 'AMOUNT_MISMATCH';
  } else if (Math.abs(txnAmount - invRemaining) / invRemaining <= 0.1) {
    // Within 10%
    amountScore = 12;
    matchType = 'AMOUNT_MISMATCH';
  } else {
    amountScore = 0;
    matchType = 'AMOUNT_MISMATCH';
  }

  // 3. Customer identity match (max 15)
  let customerScore = 0;
  const txnCustName = (txn.customerName || '').toLowerCase().trim();
  const invCustName = (invoice.customerName || '').toLowerCase().trim();
  const txnCustEmail = (txn.customerEmail || '').toLowerCase().trim();
  const invCustEmail = (invoice.customerEmail || '').toLowerCase().trim();

  if (txn.customerId && invoice.customerId && txn.customerId === invoice.customerId) {
    customerScore = 15;
  } else if (txnCustEmail && invCustEmail && txnCustEmail === invCustEmail) {
    customerScore = 15;
  } else if (txnCustName && invCustName && (txnCustName === invCustName || txnCustName.includes(invCustName) || invCustName.includes(txnCustName))) {
    customerScore = 12;
  } else {
    const custSim = calculateStringSimilarity(txnCustName, invCustName);
    customerScore = Math.round(custSim * 10);
  }

  // 4. Date proximity match (max 10)
  let dateProximityScore = 0;
  try {
    const txnDate = new Date(txn.paymentDate).getTime();
    const invDate = new Date(invoice.issueDate).getTime();
    const dueDate = new Date(invoice.dueDate).getTime();

    // Check proximity to issueDate or dueDate
    const diffDaysFromIssue = Math.abs(txnDate - invDate) / (1000 * 60 * 60 * 24);
    const diffDaysFromDue = Math.abs(txnDate - dueDate) / (1000 * 60 * 60 * 24);
    const minDiffDays = Math.min(diffDaysFromIssue, diffDaysFromDue);

    if (minDiffDays <= 3) {
      dateProximityScore = 10;
    } else if (minDiffDays <= 7) {
      dateProximityScore = 8;
    } else if (minDiffDays <= 14) {
      dateProximityScore = 5;
    } else if (minDiffDays <= 30) {
      dateProximityScore = 2;
    }
  } catch {
    dateProximityScore = 0;
  }

  // 5. Description similarity (max 10)
  let descSimilarityScore = 0;
  if (txn.notes && invoice.description) {
    const descSim = calculateStringSimilarity(txn.notes, invoice.description);
    descSimilarityScore = Math.round(descSim * 10);
  }

  const totalScore = invoiceRefScore + amountScore + customerScore + dateProximityScore + descSimilarityScore;

  let confidenceTier: 'HIGH' | 'REVIEW_RECOMMENDED' | 'MANUAL_INVESTIGATION' = 'MANUAL_INVESTIGATION';
  if (totalScore >= 90) {
    confidenceTier = 'HIGH';
  } else if (totalScore >= 70) {
    confidenceTier = 'REVIEW_RECOMMENDED';
  } else {
    confidenceTier = 'MANUAL_INVESTIGATION';
  }

  const breakdown: ReconciliationScoreBreakdown = {
    invoiceRefScore,
    amountScore,
    customerScore,
    dateProximityScore,
    descSimilarityScore,
    totalScore,
    confidenceTier
  };

  return { score: totalScore, breakdown, matchType };
}

export function runReconciliationBatch(): {
  run: ReconciliationRun;
  matches: ReconciliationMatch[];
} {
  const transactions = db.getTransactions();
  const invoices = db.getInvoices();

  const runId = `RUN-${Date.now().toString().slice(-6)}`;
  const matches: ReconciliationMatch[] = [];

  let exactMatchesCount = 0;
  let reviewRecommendedCount = 0;
  let unmatchedCount = 0;
  let totalReconciledAmount = 0;

  for (const txn of transactions) {
    // Only attempt matching for completed payments not already permanently approved or cancelled
    if (txn.paymentStatus !== 'COMPLETED') {
      continue;
    }

    let bestMatch: {
      invoice: Invoice;
      score: number;
      breakdown: ReconciliationScoreBreakdown;
      matchType: 'EXACT' | 'PARTIAL' | 'AMOUNT_MISMATCH' | 'MULTIPLE_CANDIDATES';
    } | null = null;

    const candidateMatches: Array<{
      invoice: Invoice;
      score: number;
      breakdown: ReconciliationScoreBreakdown;
      matchType: 'EXACT' | 'PARTIAL' | 'AMOUNT_MISMATCH' | 'MULTIPLE_CANDIDATES';
    }> = [];

    for (const inv of invoices) {
      const evaluation = evaluateTransactionInvoiceMatch(txn, inv);
      if (evaluation.score >= 50) {
        candidateMatches.push({
          invoice: inv,
          ...evaluation
        });
      }
    }

    // Sort candidate matches by highest score
    candidateMatches.sort((a, b) => b.score - a.score);

    if (candidateMatches.length > 0) {
      bestMatch = candidateMatches[0];
      const isAmbiguous = candidateMatches.length > 1 && (candidateMatches[0].score - candidateMatches[1].score < 10);

      const matchId = `MATCH-${txn.id}-${bestMatch.invoice.id}`;
      const matchRecord: ReconciliationMatch = {
        id: matchId,
        runId,
        transactionId: txn.id,
        invoiceId: bestMatch.invoice.id,
        score: bestMatch.score,
        confidenceTier: isAmbiguous ? 'REVIEW_RECOMMENDED' : bestMatch.breakdown.confidenceTier,
        breakdown: bestMatch.breakdown,
        matchType: isAmbiguous ? 'MULTIPLE_CANDIDATES' : bestMatch.matchType,
        status: bestMatch.score >= 90 && !isAmbiguous ? 'APPROVED' : 'PROPOSED',
        createdAt: new Date().toISOString()
      };

      matches.push(matchRecord);

      if (matchRecord.status === 'APPROVED') {
        exactMatchesCount++;
        totalReconciledAmount = round2(totalReconciledAmount + txn.amount);
        txn.reconciliationStatus = bestMatch.matchType === 'PARTIAL' ? 'PARTIAL_MATCH' : 'RECONCILED';
        txn.reconciliationScore = bestMatch.score;
        txn.matchedInvoiceId = bestMatch.invoice.id;
        db.saveTransaction(txn);

        // Update invoice paid balance
        const inv = bestMatch.invoice;
        inv.paidAmount = round2(Math.min(inv.amount, inv.paidAmount + txn.amount));
        inv.remainingAmount = round2(Math.max(0, inv.amount - inv.paidAmount));
        inv.status = inv.remainingAmount === 0 ? 'PAID' : 'PARTIALLY_PAID';
        db.saveInvoice(inv);
      } else {
        reviewRecommendedCount++;
        txn.reconciliationStatus = 'MANUAL_REVIEW';
        txn.reconciliationScore = bestMatch.score;
        txn.matchedInvoiceId = bestMatch.invoice.id;
        db.saveTransaction(txn);
      }
    } else {
      unmatchedCount++;
      txn.reconciliationStatus = 'UNMATCHED';
      txn.reconciliationScore = 0;
      db.saveTransaction(txn);
    }
  }

  const run: ReconciliationRun = {
    id: runId,
    runTimestamp: new Date().toISOString(),
    totalTransactionsProcessed: transactions.length,
    exactMatchesCount,
    reviewRecommendedCount,
    unmatchedCount,
    totalReconciledAmount,
    status: 'COMPLETED'
  };

  db.saveReconciliationRun(run);
  db.saveReconciliationMatches(matches);

  db.addAuditLog({
    action: 'RECONCILIATION_RUN_EXECUTED',
    category: 'RECONCILIATION',
    details: `Executed Reconciliation Run ${runId}. Matched ${exactMatchesCount} exact, ${reviewRecommendedCount} review recommended, ${unmatchedCount} unmatched. Total volume: $${totalReconciledAmount.toFixed(2)}.`,
    actor: 'reconciliation_engine',
    targetId: runId,
    targetType: 'ReconciliationRun'
  });

  return { run, matches };
}
