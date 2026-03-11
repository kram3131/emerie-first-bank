import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const checkingAccounts = [
  {
    name: "EFB Basic Checking",
    fee: "No monthly fee",
    waiver: null,
    minDeposit: "$25",
    highlights: [
      "Visa debit card",
      "Online & mobile banking",
      "Mobile deposit",
      "1 free official bank check/month",
      "Allpoint ATM network",
      "Free paper or eStatements",
    ],
    debitPurchaseLimit: "$3,000/day",
    atmLimit: "$500/day",
    badge: null,
  },
  {
    name: "EFB Essentials Checking",
    fee: "$8.95/month",
    waiver: "Waived with $1,500 min daily balance or $500 in direct deposits",
    minDeposit: "$100",
    highlights: [
      "Everything in Basic, plus:",
      "3 free official bank checks/month",
      "Free incoming domestic wires",
      "0.05% APY on balances over $1,000",
    ],
    debitPurchaseLimit: "$5,000/day",
    atmLimit: "$1,000/day",
    badge: null,
  },
  {
    name: "EFB Premium Checking",
    fee: "$18.00/month",
    waiver: "Waived with $10,000 min daily balance or $25,000 combined balances",
    minDeposit: "$500",
    highlights: [
      "Everything in Essentials, plus:",
      "0.15% APY on balances over $5,000",
      "Unlimited free official bank checks",
      "2 free outgoing domestic wires/month",
      "No foreign transaction fees",
      "Free small safe deposit box",
    ],
    debitPurchaseLimit: "$5,000/day",
    atmLimit: "$1,000/day",
    badge: "Most Popular",
  },
  {
    name: "EFB Student Checking",
    fee: "No monthly fee",
    waiver: null,
    minDeposit: "$25",
    highlights: [
      "Ages 16–24, enrolled in school",
      "Visa debit card",
      "Online & mobile banking",
      "Mobile deposit",
      "Free eStatements",
      "Converts to Basic at age 25",
    ],
    debitPurchaseLimit: "$3,000/day",
    atmLimit: "$500/day",
    badge: "Students",
  },
];

const savingsAccounts = [
  {
    name: "EFB Standard Savings",
    fee: "$5.00/month",
    waiver: "Waived with $300 min daily balance or under 18",
    minDeposit: "$25",
    rate: "0.25% APY on all balances",
    details: "Interest compounded daily, credited monthly. Six free withdrawals per cycle; $2.00 per excess transaction.",
  },
  {
    name: "EFB High-Yield Savings",
    fee: "$12.00/month",
    waiver: "Waived with $5,000 min daily balance",
    minDeposit: "$1,000",
    rate: "Up to 4.25% APY",
    tiers: [
      { range: "$0 – $4,999", apy: "0.25%" },
      { range: "$5,000 – $24,999", apy: "3.90%" },
      { range: "$25,000 – $99,999", apy: "4.10%" },
      { range: "$100,000+", apy: "4.25%" },
    ],
    details: "Interest compounded daily, credited monthly. Six free withdrawals per cycle; $2.00 per excess transaction.",
  },
  {
    name: "EFB Money Market",
    fee: "$10.00/month",
    waiver: "Waived with $10,000 min daily balance",
    minDeposit: "$2,500",
    rate: "Up to 4.15% APY",
    tiers: [
      { range: "$0 – $9,999", apy: "0.30%" },
      { range: "$10,000 – $49,999", apy: "3.75%" },
      { range: "$50,000 – $99,999", apy: "4.00%" },
      { range: "$100,000+", apy: "4.15%" },
    ],
    details: "Includes check-writing (up to 6 per cycle). $10.00 excess transaction fee.",
  },
];

const cdRates = [
  { term: "3-Month", apy: "4.50%" },
  { term: "6-Month", apy: "4.60%" },
  { term: "12-Month", apy: "4.40%" },
  { term: "18-Month", apy: "4.25%" },
  { term: "24-Month", apy: "4.10%" },
  { term: "36-Month", apy: "3.95%" },
  { term: "48-Month", apy: "3.80%" },
  { term: "60-Month", apy: "3.70%" },
];

export default function PersonalBanking() {
  return (
    <>
      <Hero
        title="Personal Banking"
        subtitle="Checking, savings, and CDs designed for every stage of life. All deposits FDIC insured up to $250,000."
      />

      {/* Checking Accounts */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            variant="label"
            label="Checking"
            title="Checking Accounts"
            subtitle="All checking accounts include a Visa debit card, online and mobile banking, and free Bill Pay."
          />
          <AnimateOnScroll animation="stagger-children">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {checkingAccounts.map((account) => (
                <div
                  key={account.name}
                  className={`relative bg-white rounded-2xl p-6 flex flex-col transition-shadow ${
                    account.badge === "Most Popular"
                      ? "shadow-lg scale-[1.02] ring-1 ring-gold/20"
                      : "shadow-sm hover:shadow-md"
                  }`}
                >
                  {account.badge && (
                    <div className={`absolute -top-3 left-6 px-3 py-1 text-xs font-semibold rounded-full ${
                      account.badge === "Most Popular"
                        ? "bg-gold text-white"
                        : "bg-teal text-white"
                    }`}>
                      {account.badge}
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-navy mb-1">{account.name}</h3>
                  <div className="text-2xl font-bold text-navy mb-1">{account.fee}</div>
                  {account.waiver && (
                    <p className="text-xs text-body-light mb-4">{account.waiver}</p>
                  )}
                  {!account.waiver && <div className="mb-4" />}
                  <ul className="space-y-2 mb-6 flex-1">
                    {account.highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-body">
                        <svg className="w-4 h-4 text-teal mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-border/60 space-y-1">
                    <div className="flex justify-between text-xs text-body-light">
                      <span>Daily purchase limit</span>
                      <span className="font-medium text-navy">{account.debitPurchaseLimit}</span>
                    </div>
                    <div className="flex justify-between text-xs text-body-light">
                      <span>Daily ATM limit</span>
                      <span className="font-medium text-navy">{account.atmLimit}</span>
                    </div>
                    <div className="flex justify-between text-xs text-body-light">
                      <span>Min opening deposit</span>
                      <span className="font-medium text-navy">{account.minDeposit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Savings & Money Market */}
      <section className="py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            variant="editorial"
            title="Savings & Money Market"
            subtitle="Grow your money with competitive rates. Interest compounded daily and credited monthly."
          />
          <AnimateOnScroll animation="stagger-children">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {savingsAccounts.map((account) => (
                <div
                  key={account.name}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8"
                >
                  <h3 className="text-lg font-semibold text-navy mb-2">{account.name}</h3>
                  <div className="text-sm text-body-light mb-1">{account.fee}</div>
                  <div className="text-xs text-body-light mb-4">{account.waiver}</div>
                  <div className="text-2xl font-bold text-teal mb-4">{account.rate}</div>
                  {"tiers" in account && account.tiers && (
                    <div className="space-y-2 mb-4">
                      {account.tiers.map((tier) => (
                        <div key={tier.range} className="flex justify-between text-sm">
                          <span className="text-body">{tier.range}</span>
                          <span className="font-semibold text-navy">{tier.apy} APY</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-body-light">{account.details}</p>
                  <div className="mt-4 pt-4 border-t border-border/60 text-xs text-body-light">
                    Min opening deposit: <span className="font-medium text-navy">{account.minDeposit}</span>
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* CDs */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            variant="minimal"
            title="Certificates of Deposit"
            subtitle="Lock in a guaranteed rate. Minimum deposit $1,000. Rates as of March 2026."
          />
          <AnimateOnScroll animation="reveal">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="grid grid-cols-3 bg-navy text-white text-sm font-semibold">
                  <div className="px-6 py-4">Term</div>
                  <div className="px-6 py-4 text-center">Standard APY</div>
                  <div className="px-6 py-4 text-center">Jumbo APY ($100K+)</div>
                </div>
                {cdRates.map((rate, i) => (
                  <div
                    key={rate.term}
                    className={`grid grid-cols-3 text-sm ${
                      i % 2 === 0 ? "bg-cream/50" : "bg-white"
                    }`}
                  >
                    <div className="px-6 py-4 font-medium text-navy">{rate.term}</div>
                    <div className="px-6 py-4 text-center font-semibold text-navy">{rate.apy}</div>
                    <div className="px-6 py-4 text-center font-semibold text-gold-dark">
                      {(parseFloat(rate.apy) + 0.1).toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h4 className="text-sm font-semibold text-navy mb-1">Early Withdrawal</h4>
                  <p className="text-xs text-body-light">
                    12 months or less: 90 days interest. 13–36 months: 180 days. 37–60 months: 365 days.
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h4 className="text-sm font-semibold text-navy mb-1">Auto-Renewal</h4>
                  <p className="text-xs text-body-light">
                    CDs renew at maturity for the same term at the current posted rate. 10-day grace period.
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h4 className="text-sm font-semibold text-navy mb-1">IRA CDs</h4>
                  <p className="text-xs text-body-light">
                    Traditional and Roth IRA CDs available at the same rates. $1,000 minimum. Subject to IRS rules.
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Digital Banking */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="reveal">
            <div className="bg-navy grain-overlay rounded-2xl p-10 md:p-12 relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-light text-white mb-4 tracking-tight">Digital Banking</h2>
                  <p className="text-white/60 mb-6">
                    Free for all personal account holders. Manage your accounts from anywhere with our mobile app and online banking.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      "Mobile Deposit",
                      "Zelle Transfers",
                      "Card Controls",
                      "Bill Pay",
                      "eStatements (7 years)",
                      "Account Alerts",
                      "Biometric Login",
                      "256-bit SSL Encryption",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-white/80">
                        <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/10 rounded-xl p-5">
                    <div className="text-2xl font-light text-gold">$5,000</div>
                    <div className="text-xs text-white/50 mt-1">Daily mobile deposit limit</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-5">
                    <div className="text-2xl font-light text-gold">$1,000</div>
                    <div className="text-xs text-white/50 mt-1">Zelle per transaction</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-5">
                    <div className="text-2xl font-light text-gold">$5,000</div>
                    <div className="text-xs text-white/50 mt-1">External transfer limit</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-5">
                    <div className="text-2xl font-light text-gold">55K+</div>
                    <div className="text-xs text-white/50 mt-1">Free ATMs via Allpoint</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Overdraft Info */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Overdraft Options"
            subtitle="Choose the overdraft option that works best for you. All accounts default to no overdraft coverage."
          />
          <AnimateOnScroll animation="stagger-children">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-navy mb-2">Overdraft Protection Transfer</h3>
                <p className="text-sm text-body">
                  Link to a savings account or line of credit. Funds transfer in $100 increments. $5.00 per transfer.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-navy mb-2">Standard Overdraft Coverage</h3>
                <p className="text-sm text-body">
                  Bank may authorize overdrafts on checks and recurring debits. $29.00 per item, max 3 per day ($87.00 cap). Items $5.00 or less exempt.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-navy mb-2">No Overdraft Coverage</h3>
                <p className="text-sm text-body">
                  Transactions that would overdraw the account are simply declined at no charge. This is the default for all new accounts.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
