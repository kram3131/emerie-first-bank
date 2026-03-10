import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";

const consumerLoans = [
  {
    title: "Unsecured Personal Loan",
    rate: "8.49% – 15.99% APR",
    amount: "$2,500 – $50,000",
    terms: "12 – 60 months",
    details: [
      "No collateral required",
      "No origination fee",
      "No prepayment penalty",
      "Fixed rate and fixed payment",
      "$25 late fee (10+ days past due)",
    ],
  },
  {
    title: "Secured Personal Loan",
    rate: "From 4.99% APR",
    amount: "$1,000 – value of pledged deposit (minus 10%)",
    terms: "12 – 60 months",
    details: [
      "Secured by EFB savings or CD",
      "Rate typically 2%–3% above deposit rate",
      "Pledged deposit continues earning interest",
      "Withdrawals restricted until repaid",
    ],
  },
  {
    title: "New Auto Loan",
    rate: "From 5.49% APR (24–48 mo) / 5.99% APR (60–72 mo)",
    amount: "$10,000 – $100,000",
    terms: "24 – 72 months",
    details: [
      "Current year and one prior model year",
      "Up to 100% of purchase price + TTL",
      "$150 documentation fee",
      "No prepayment penalty",
    ],
  },
  {
    title: "Used Auto Loan",
    rate: "From 6.29% APR (24–48 mo) / 6.79% APR (60 mo)",
    amount: "$5,000 – $75,000",
    terms: "24 – 60 months",
    details: [
      "Up to 7 model years old, under 100K miles",
      "Dealer: up to 90% NADA retail",
      "Private party: up to 80% NADA retail",
      "$150 documentation fee",
    ],
  },
  {
    title: "Auto Loan Refinance",
    rate: "From 5.99% APR",
    amount: "Refinance existing auto loan from another lender",
    terms: "Vehicle up to 7 years old, under 100K miles",
    details: [
      "No application fee",
    ],
  },
  {
    title: "RV & Recreational Vehicles",
    rate: "New from 6.49% APR (6.99% 61–180 mo) / Used from 7.29% APR",
    amount: "New: $10K–$250K / Used: $10K–$150K",
    terms: "Up to 180 months (new) / 144 months (used)",
    details: [
      "Motorhomes, travel trailers, fifth wheels, camper vans",
      "New: up to 90% of purchase price",
      "Used: up to 80% NADA (up to 10 years old)",
      "$150 doc fee; no prepayment penalty",
    ],
  },
];

const homeEquity = [
  {
    title: "Home Equity Loan (Fixed Rate)",
    rate: "From 6.99% APR",
    details: [
      "$10,000 – $250,000",
      "Max 80% combined LTV",
      "Terms: 60 – 180 months",
      "Closing costs: $500 – $2,500",
      "Appraisal included in closing costs",
      "No prepayment penalty",
      "Interest may be tax-deductible for home improvements",
    ],
  },
  {
    title: "Home Equity Line of Credit (HELOC)",
    rate: "Currently 8.00% APR (Prime + 0.50%)",
    details: [
      "$10,000 – $250,000",
      "Max 80% combined LTV",
      "10-year draw period (interest only)",
      "20-year repayment period",
      "Floor: 5.50% APR / Ceiling: 18.00% APR",
      "Rate adjusts monthly with Prime Rate",
      "$75 annual fee (waived first year)",
      "$100 rate lock option available",
    ],
  },
];

const mortgageProducts = [
  {
    title: "Conventional Fixed-Rate",
    rates: [
      { term: "30-year", rate: "6.625% APR" },
      { term: "20-year", rate: "6.375% APR" },
      { term: "15-year", rate: "5.875% APR" },
    ],
    details: [
      "Min 5% down for primary residence",
      "PMI required under 20% down (auto-removed at 78% LTV)",
      "Max $766,550 conforming limit",
    ],
  },
  {
    title: "FHA Loan",
    rates: [{ term: "30-year", rate: "6.375% APR" }],
    details: [
      "3.5% down with 580+ credit score",
      "10% down with 500–579 credit score",
      "Upfront MIP: 1.75% (can be financed)",
      "Annual MIP: 0.45% – 1.05%",
      "Max $766,550 in Austin-Round Rock area",
    ],
  },
  {
    title: "VA Loan",
    rates: [{ term: "30-year", rate: "6.25% APR" }],
    details: [
      "No down payment required",
      "No private mortgage insurance",
      "VA funding fee: 1.25% – 3.30%",
      "Some veterans exempt from funding fee",
      "No max loan for full entitlement",
    ],
  },
  {
    title: "Jumbo Loan",
    rates: [
      { term: "30-year", rate: "6.875% APR" },
      { term: "15-year", rate: "6.125% APR" },
    ],
    details: [
      "$766,551 – $2,000,000",
      "Min 20% down payment",
      "Credit score 700+ generally required",
      "Held in bank portfolio",
      "Primary residences and second homes",
    ],
  },
  {
    title: "USDA Rural Development",
    rates: [{ term: "30-year", rate: "6.375% APR" }],
    details: [
      "No down payment required",
      "Eligible rural areas in Williamson, Bell counties",
      "Income limits apply",
      "Guarantee fee: 1.00% upfront + 0.35% annual",
    ],
  },
];

const mortgageSteps = [
  { step: "1", title: "Prequalification", desc: "Online or by phone, no credit impact" },
  { step: "2", title: "Application", desc: "Full application with tax returns, bank statements, pay stubs" },
  { step: "3", title: "Processing", desc: "Appraisal, employment verification, file review" },
  { step: "4", title: "Conditional Approval", desc: "Underwriter reviews; remaining items identified" },
  { step: "5", title: "Clear to Close", desc: "All conditions met; Closing Disclosure issued" },
  { step: "6", title: "Closing", desc: "Sign documents at title company; funds disbursed" },
];

export default function LoansPage() {
  return (
    <>
      <Hero
        title="Loans & Mortgages"
        subtitle="Personal loans, auto financing, home equity, and a full suite of mortgage products. All originated and underwritten locally."
      />

      {/* Consumer Lending */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Consumer Lending"
            subtitle="Fixed rates, local underwriting, and no hidden fees."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consumerLoans.map((loan) => (
              <div key={loan.title} className="bg-white rounded-2xl border border-border p-6 flex flex-col">
                <h3 className="text-base font-semibold text-navy mb-3">{loan.title}</h3>
                <div className="mb-4 space-y-1">
                  <div className="text-lg font-bold text-gold-dark">{loan.rate}</div>
                  <div className="text-xs text-body-light">{loan.amount}</div>
                  <div className="text-xs text-body-light">{loan.terms}</div>
                </div>
                <ul className="space-y-2 flex-1">
                  {loan.details.map((detail, i) => (
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

      {/* Home Equity */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Home Equity Products"
            subtitle="Access the equity in your home for improvements, debt consolidation, or major expenses."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {homeEquity.map((product) => (
              <div key={product.title} className="bg-cream rounded-2xl border border-border p-8">
                <h3 className="text-lg font-semibold text-navy mb-2">{product.title}</h3>
                <div className="text-xl font-bold text-teal mb-4">{product.rate}</div>
                <ul className="space-y-2">
                  {product.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-body">
                      <svg className="w-4 h-4 text-teal mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mortgage Products */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Mortgage Products"
            subtitle="Work with the same loan officer from application through closing. Rates as of March 2026."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mortgageProducts.map((product) => (
              <div key={product.title} className="bg-white rounded-2xl border border-border p-6 flex flex-col">
                <h3 className="text-base font-semibold text-navy mb-3">{product.title}</h3>
                <div className="mb-4 space-y-1">
                  {product.rates.map((r) => (
                    <div key={r.term} className="flex justify-between items-baseline">
                      <span className="text-sm text-body">{r.term}</span>
                      <span className="text-lg font-bold text-navy">{r.rate}</span>
                    </div>
                  ))}
                </div>
                <ul className="space-y-2 flex-1">
                  {product.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-body">
                      <span className="w-1.5 h-1.5 bg-teal rounded-full mt-1.5 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mortgage Process Timeline */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="The Mortgage Process"
            subtitle="Typical timeline: 30 to 45 days from application to closing."
          />
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mortgageSteps.map((item) => (
                <div key={item.step} className="relative bg-cream rounded-2xl border border-border p-6">
                  <div className="w-10 h-10 bg-navy text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-base font-semibold text-navy mb-1">{item.title}</h3>
                  <p className="text-sm text-body">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Refinance & DPA */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-border p-8">
              <h3 className="text-lg font-semibold text-navy mb-4">Refinance Options</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-navy">Rate-and-Term Refinance</h4>
                  <p className="text-sm text-body">Lower your payment, shorten your term, or switch from adjustable to fixed. Same rates as purchase loans.</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-navy">Cash-Out Refinance</h4>
                  <p className="text-sm text-body">Max 80% LTV (conventional), 85% (FHA), 90% (VA). Rates typically 0.125%–0.250% above standard.</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-navy">Streamline Refinance</h4>
                  <p className="text-sm text-body">FHA Streamline and VA IRRRL with reduced docs. May not require a new appraisal.</p>
                </div>
              </div>
            </div>
            <div className="bg-navy rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-white mb-4">Down Payment Assistance</h3>
              <p className="text-white/70 mb-4">
                Emerie First Bank participates in TSAHC and Southeast Texas Housing Finance Corporation programs offering grants or forgivable second liens.
              </p>
              <ul className="space-y-2">
                {[
                  "Covers down payment and closing costs",
                  "Based on income, credit score, and location",
                  "Our loan officers help determine eligibility",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <svg className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-white/10 text-sm text-white/50">
                $500 application fee (credited to closing costs). Closing costs typically 2%–5% of loan amount.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* General info */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-body-light">
            Emerie First Bank is an Equal Housing Lender. NMLS #482310. All loans subject to credit approval. Rates and terms subject to change.
            Mortgage Department: (512) 930-4550. Apply online at www.emeriefirstbank.com or at any branch.
          </p>
        </div>
      </section>
    </>
  );
}
