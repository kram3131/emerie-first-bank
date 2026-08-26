// Shared types + transfer logic for the demo customer's accounts.
// Used by both the chat API (server-side state during a request) and
// the ChatWidget (client-side state across turns within a page session).

export type AccountState = {
  checking: number;
  savings: number;
  autoLoanBalance: number;
};

export const INITIAL_ACCOUNT_STATE: AccountState = {
  checking: 2145.32,
  savings: 8412.5,
  autoLoanBalance: 14862.0,
};

// Identity verification is tracked server-side, independent of anything the
// model claims in its own text — see verify_identity_step and get_account_info
// in app/api/chat/route.ts. Each flag flips true only after the server itself
// checks the visitor's raw input against the real secret value.
export type VerificationState = {
  accountNumber: boolean;
  ssnLast4: boolean;
  smsCode: boolean;
};

export const INITIAL_VERIFICATION_STATE: VerificationState = {
  accountNumber: false,
  ssnLast4: false,
  smsCode: false,
};

export function isFullyVerified(v: VerificationState): boolean {
  return v.accountNumber && v.ssnLast4 && v.smsCode;
}

export type Transaction = {
  date: string;
  description: string;
  type: "debit" | "credit";
  amount: number;
};

export const DEMO_TRANSACTIONS: Transaction[] = [
  { date: "Aug 25", description: "H-E-B Grocery", type: "debit", amount: 84.23 },
  { date: "Aug 24", description: "Starbucks", type: "debit", amount: 6.45 },
  { date: "Aug 23", description: "Direct Deposit from employer", type: "credit", amount: 3200.0 },
  { date: "Aug 22", description: "AT&T Wireless, Bill Pay", type: "debit", amount: 92.17 },
  { date: "Aug 20", description: "Shell Gas Station", type: "debit", amount: 48.3 },
];

export const AUTO_LOAN_INFO = {
  monthlyPayment: 325,
  nextPaymentDue: "October 6",
  rateApr: 5.49,
};

export type TransferInput = {
  from: "checking" | "savings";
  to: "checking" | "savings" | "auto_loan";
  amount: number;
};

export type TransferResult =
  | {
      ok: true;
      from: string;
      to: string;
      amount: number;
      balances: AccountState;
      summary: string;
    }
  | { ok: false; error: string };

const MAX_PER_TRANSFER = 10000;

const round2 = (n: number) => Math.round(n * 100) / 100;

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const label: Record<string, string> = {
  checking: "Free Checking ending 3847",
  savings: "Savings ending 2156",
  auto_loan: "Auto Loan ending 7723",
};

export function applyTransfer(
  state: AccountState,
  input: TransferInput
): TransferResult {
  const { from, to, amount } = input;

  if (typeof amount !== "number" || !isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Amount must be a positive number." };
  }
  if (amount > MAX_PER_TRANSFER) {
    return {
      ok: false,
      error: `Single transfers are limited to ${fmt(MAX_PER_TRANSFER)} in this demo.`,
    };
  }
  if (from === to) {
    return { ok: false, error: "From and to accounts must differ." };
  }

  // Allowed routes only
  const route = `${from}->${to}`;
  const ALLOWED = new Set([
    "checking->savings",
    "savings->checking",
    "checking->auto_loan",
  ]);
  if (!ALLOWED.has(route)) {
    return {
      ok: false,
      error: `That route isn't supported in this demo (${label[from]} → ${label[to]}). The allowed moves are checking↔savings and checking→auto loan.`,
    };
  }

  // Sufficient funds check
  if (from === "checking" && state.checking < amount) {
    return {
      ok: false,
      error: `Checking only has ${fmt(state.checking)} — not enough to move ${fmt(amount)}.`,
    };
  }
  if (from === "savings" && state.savings < amount) {
    return {
      ok: false,
      error: `Savings only has ${fmt(state.savings)} — not enough to move ${fmt(amount)}.`,
    };
  }

  // Auto loan can't go below 0
  if (to === "auto_loan" && amount > state.autoLoanBalance) {
    return {
      ok: false,
      error: `That payment (${fmt(amount)}) is more than the remaining loan balance (${fmt(state.autoLoanBalance)}).`,
    };
  }

  const next: AccountState = { ...state };
  if (from === "checking") next.checking = round2(next.checking - amount);
  else if (from === "savings") next.savings = round2(next.savings - amount);

  if (to === "checking") next.checking = round2(next.checking + amount);
  else if (to === "savings") next.savings = round2(next.savings + amount);
  else if (to === "auto_loan")
    next.autoLoanBalance = round2(next.autoLoanBalance - amount);

  return {
    ok: true,
    from,
    to,
    amount,
    balances: next,
    summary:
      to === "auto_loan"
        ? `Applied a ${fmt(amount)} payment from ${label[from]} to ${label[to]}. New checking balance: ${fmt(next.checking)}. Remaining loan balance: ${fmt(next.autoLoanBalance)}.`
        : `Transferred ${fmt(amount)} from ${label[from]} to ${label[to]}. New ${from} balance: ${fmt(from === "checking" ? next.checking : next.savings)}. New ${to} balance: ${fmt(to === "checking" ? next.checking : next.savings)}.`,
  };
}

// The ONLY source of account numbers the model is allowed to quote from.
// Returned exclusively by the get_account_info tool, which itself refuses to
// run unless the server's own verificationState says all three identity
// checks passed — see app/api/chat/route.ts. The model never has these
// figures sitting in its context before that.
export function describeFullAccountInfo(state: AccountState): string {
  const txLines = DEMO_TRANSACTIONS.map(
    (t) => `- ${t.date}: ${t.description}, ${t.type}, ${fmt(t.amount)}`
  ).join("\n");
  return [
    `Free Checking ending 3847 — balance ${fmt(state.checking)}`,
    `Recent transactions (most recent first):`,
    txLines,
    ``,
    `Savings Account ending 2156 — balance ${fmt(state.savings)}`,
    ``,
    `Auto Loan ending 7723 — $${AUTO_LOAN_INFO.monthlyPayment}/mo, next payment due ${AUTO_LOAN_INFO.nextPaymentDue}, remaining balance ${fmt(state.autoLoanBalance)}, ${AUTO_LOAN_INFO.rateApr}% APR`,
    ``,
    `These are the live, authoritative numbers right now in this session — quote them exactly, digit for digit. Do not recompute, round, or restate them from memory on a later turn; call this tool again if you need them again.`,
  ].join("\n");
}
