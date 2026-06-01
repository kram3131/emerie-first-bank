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

export function describeAccountState(state: AccountState): string {
  return [
    `# Current account state`,
    `(These are the live balances right now in this session. Always quote these, not the starting balances in the demo data.)`,
    ``,
    `- Free Checking ending 3847: ${fmt(state.checking)}`,
    `- Savings ending 2156: ${fmt(state.savings)}`,
    `- Auto Loan ending 7723: remaining balance ${fmt(state.autoLoanBalance)}`,
  ].join("\n");
}
