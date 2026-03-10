import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";

const businessChecking = [
  {
    name: "Business Basic",
    fee: "No monthly fee",
    waiver: null,
    minDeposit: "$100",
    highlights: [
      "200 free transactions/month",
      "$0.25 per additional transaction",
      "$5,000 free cash deposits/month ($1.50/$1,000 over)",
      "Visa business debit card",
      "Online & mobile banking",
      "Mobile deposit, Bill Pay",
    ],
    interest: null,
  },
  {
    name: "Business Plus",
    fee: "$20.00/month",
    waiver: "Waived with $10,000 min daily balance",
    minDeposit: "$500",
    highlights: [
      "500 free transactions/month",
      "$0.20 per additional transaction",
      "$10,000 free cash deposits/month ($1.50/$1,000 over)",
      "Free incoming domestic wires",
      "2 free outgoing domestic wires/month",
      "Earnings credit on service charges",
    ],
    interest: "0.10% APY on balances over $10,000",
  },
  {
    name: "Business Premium",
    fee: "$35.00/month",
    waiver: "Waived with $50,000 min daily balance or $100,000 combined balances",
    minDeposit: "$1,000",
    highlights: [
      "Unlimited transactions, no per-item fees",
      "$25,000 free cash deposits/month ($1.00/$1,000 over)",
      "Unlimited free domestic wires",
      "Dedicated relationship manager",
      "Free positive pay fraud protection",
      "Priority loan processing",
    ],
    interest: "0.20% APY on balances over $25,000",
    badge: "Best Value",
  },
  {
    name: "Nonprofit",
    fee: "No monthly fee",
    waiver: "Available to 501(c)(3) organizations",
    minDeposit: "$100",
    highlights: [
      "300 free transactions/month",
      "$10,000 free cash deposits/month",
      "Fees beyond thresholds match Business Plus",
      "Requires IRS determination letter",
    ],
    interest: null,
  },
];

const businessSavings = [
  {
    name: "Business Savings",
    fee: "$5.00/month",
    waiver: "Waived with $1,000 min daily balance",
    minDeposit: "$100",
    rate: "0.30% APY on all balances",
    tiers: null,
  },
  {
    name: "Business Money Market",
    fee: "$15.00/month",
    waiver: "Waived with $25,000 min daily balance",
    minDeposit: "$5,000",
    rate: "Up to 3.90% APY",
    tiers: [
      { range: "$0 – $24,999", apy: "0.30%" },
      { range: "$25,000 – $99,999", apy: "3.50%" },
      { range: "$100,000 – $249,999", apy: "3.75%" },
      { range: "$250,000+", apy: "3.90%" },
    ],
    checkWriting: "Up to 6 checks or transfers per statement cycle",
  },
];

const lendingProducts = [
  {
    title: "Business Line of Credit",
    details: [
      "Revolving credit: $10,000 – $250,000",
      "Rate: Prime + 1.00% to Prime + 3.00%",
      "Current range: 8.50% – 10.50% APR",
      "Interest-only payments during draw",
      "$250 annual fee",
    ],
  },
  {
    title: "SBA 7(a) Loans",
    details: [
      "Up to $5,000,000",
      "Working capital, equipment, real estate, acquisition",
      "Terms up to 10 years (25 for real estate)",
      "Emerie First Bank is an SBA Preferred Lender",
    ],
  },
  {
    title: "SBA 504 Loans",
    details: [
      "Up to $5,500,000",
      "Long-term fixed-rate for major assets",
      "10% borrower equity, 50% bank, 40% CDC",
      "Commercial real estate and heavy equipment",
    ],
  },
  {
    title: "Commercial Real Estate",
    details: [
      "$100,000 – $5,000,000",
      "Terms: 5 – 25 years",
      "Min 20% down (owner-occupied)",
      "Min 25% down (investment)",
      "Fixed or variable rates",
    ],
  },
  {
    title: "Equipment Financing",
    details: [
      "$5,000 – $500,000",
      "Terms up to 7 years (matches equipment life)",
      "Rates from 7.25% APR",
      "Equipment serves as collateral",
    ],
  },
  {
    title: "SBA Express Loans",
    details: [
      "Up to $500,000",
      "Faster processing",
      "Revolving or term options",
    ],
  },
];

export default function BusinessBanking() {
  return (
    <>
      <Hero
        title="Business Banking"
        subtitle="Banking solutions for small and mid-sized businesses across Central Texas. SBA Preferred Lender with local decision-making."
      />

      {/* Business Checking */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Business Checking Accounts"
            subtitle="From sole proprietors to established corporations, we have the right account for your business."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {businessChecking.map((account) => (
              <div
                key={account.name}
                className={`relative bg-white rounded-2xl border p-6 flex flex-col ${
                  account.badge ? "border-teal shadow-lg ring-1 ring-teal/20" : "border-border"
                }`}
              >
                {account.badge && (
                  <div className="absolute -top-3 left-6 px-3 py-1 text-xs font-semibold rounded-full bg-teal text-white">
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
                <div className="pt-4 border-t border-border space-y-1">
                  {account.interest && (
                    <div className="text-xs text-teal font-medium mb-1">{account.interest}</div>
                  )}
                  <div className="flex justify-between text-xs text-body-light">
                    <span>Min opening deposit</span>
                    <span className="font-medium text-navy">{account.minDeposit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Savings & Money Market */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Business Savings & Money Market"
            subtitle="Build reserves and earn competitive rates on your business deposits."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {businessSavings.map((account) => (
              <div key={account.name} className="bg-cream rounded-2xl border border-border p-8">
                <h3 className="text-lg font-semibold text-navy mb-2">{account.name}</h3>
                <div className="text-sm text-body-light mb-1">{account.fee}</div>
                <div className="text-xs text-body-light mb-4">{account.waiver}</div>
                <div className="text-2xl font-bold text-teal mb-4">{account.rate}</div>
                {account.tiers && (
                  <div className="space-y-2 mb-4">
                    {account.tiers.map((tier) => (
                      <div key={tier.range} className="flex justify-between text-sm">
                        <span className="text-body">{tier.range}</span>
                        <span className="font-semibold text-navy">{tier.apy} APY</span>
                      </div>
                    ))}
                  </div>
                )}
                {"checkWriting" in account && account.checkWriting && (
                  <div className="text-xs text-body-light mb-4">{account.checkWriting}</div>
                )}
                <div className="pt-4 border-t border-border text-xs text-body-light">
                  Min opening deposit: <span className="font-medium text-navy">{account.minDeposit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Lending */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Business Lending"
            subtitle="Local underwriting and local decision-making. SBA Preferred Lender."
          />

          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal/10 text-teal text-sm font-semibold rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              SBA Preferred Lender
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lendingProducts.map((product) => (
              <div key={product.title} className="bg-white rounded-2xl border border-border p-6">
                <h3 className="text-base font-semibold text-navy mb-4">{product.title}</h3>
                <ul className="space-y-2">
                  {product.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-body">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1.5 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Treasury Management */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-navy rounded-2xl p-10 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Treasury Management</h2>
                <p className="text-white/70 mb-6">
                  Advanced cash management tools for Business Plus and Business Premium account holders.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "ACH Origination",
                  "Remote Deposit Capture",
                  "Positive Pay",
                  "Zero Balance Accounts",
                  "Sweep Accounts",
                  "Account Analysis",
                ].map((service) => (
                  <div key={service} className="flex items-center gap-2 text-sm text-white/80">
                    <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {service}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Merchant Services & How to Open */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-border p-8">
              <h3 className="text-lg font-semibold text-navy mb-3">Merchant Services</h3>
              <p className="text-sm text-body mb-4">
                Credit and debit card processing through our third-party partner. Point-of-sale terminals, mobile readers, and e-commerce gateways available.
              </p>
              <p className="text-sm text-body-light">
                Contact Business Banking at (512) 930-4560 to schedule a consultation.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-border p-8">
              <h3 className="text-lg font-semibold text-navy mb-3">How to Open a Business Account</h3>
              <p className="text-sm text-body mb-3">
                Sole proprietorships can open online. All other business types must visit a branch.
              </p>
              <ul className="space-y-1.5 text-sm text-body">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-navy rounded-full mt-1.5 flex-shrink-0" />
                  Articles of organization/incorporation or partnership agreement
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-navy rounded-full mt-1.5 flex-shrink-0" />
                  EIN (sole proprietors may use SSN)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-navy rounded-full mt-1.5 flex-shrink-0" />
                  Photo ID for all signers and beneficial owners (25%+)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-navy rounded-full mt-1.5 flex-shrink-0" />
                  Operating agreement or corporate resolution
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
