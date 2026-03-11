import Link from "next/link";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";

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

export default function Home() {
  return (
    <>
      {/* Hero */}
      <Hero
        title="Banking That Knows Your Name"
        subtitle="Since 1987, Emerie First Bank has served Central Texas families and businesses with personal service backed by local decision-making. Five branches. One community."
        large
        videoSrc="/hero-video.mp4"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/personal"
            className="btn-premium inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-navy bg-gold rounded-lg transition-all hover:bg-gold-light hover:shadow-lg"
          >
            Open an Account
          </Link>
          <Link
            href="/locations"
            className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white border-2 border-white/30 rounded-lg transition-all hover:bg-white/10 backdrop-blur-sm"
          >
            Find a Branch
          </Link>
        </div>
      </Hero>

      {/* Product cards */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            variant="label"
            label="Banking Solutions"
            title="How Can We Help You?"
            subtitle="Whether you're saving for the future, growing a business, or buying a home, we have the right account for you."
          />
          <AnimateOnScroll animation="stagger-children">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ProductCard
                title="Personal Banking"
                description="Checking, savings, money market accounts, and CDs designed for every stage of life. No-fee options available."
                href="/personal"
                accent="gold"
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                }
              />
              <ProductCard
                title="Business Banking"
                description="Accounts, lending, and treasury management built for small and mid-sized businesses. SBA Preferred Lender."
                href="/business"
                accent="teal"
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                }
              />
              <ProductCard
                title="Loans & Mortgages"
                description="Personal loans, auto financing, home equity, and a full suite of mortgage products with local underwriting."
                href="/loans"
                accent="navy"
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                }
              />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Rates snapshot */}
      <section className="py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: editorial heading + featured rate */}
            <div className="lg:col-span-5">
              <SectionHeading
                variant="editorial"
                title="Competitive Rates"
                subtitle="Grow your money with our savings and CD products. Rates current as of March 2026."
              />
              <AnimateOnScroll animation="reveal">
                <div className="mt-8 p-8 bg-cream rounded-2xl">
                  <div className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">Featured Rate</div>
                  <div className="text-6xl font-light text-navy tracking-tight">4.60%</div>
                  <div className="text-sm text-body-light mt-1">6-Month CD &middot; APY</div>
                  <div className="mt-4 h-px bg-border" />
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-light text-teal">4.25%</div>
                      <div className="text-xs text-body-light mt-0.5">High-Yield Savings APY</div>
                    </div>
                    <div>
                      <div className="text-2xl font-light text-gold-dark">4.15%</div>
                      <div className="text-xs text-body-light mt-0.5">Money Market APY</div>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            {/* Right: CD rate table + savings cards */}
            <div className="lg:col-span-7 space-y-6">
              <AnimateOnScroll animation="reveal">
                <div className="bg-white rounded-2xl shadow-md p-8">
                  <h3 className="text-lg font-semibold text-navy mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gold rounded-full" />
                    Certificate of Deposit Rates
                  </h3>
                  <div className="space-y-3">
                    {cdRates.map((rate) => (
                      <div
                        key={rate.term}
                        className="flex items-center justify-between py-2.5 border-b border-border/60 last:border-0"
                      >
                        <span className="text-sm text-body">{rate.term} CD</span>
                        <span className="text-lg font-bold text-navy">{rate.apy} <span className="text-xs font-normal text-body-light">APY</span></span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-body-light">
                    Minimum deposit $1,000. Jumbo CDs ($100,000+) earn an additional 0.10% APY.
                  </p>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation="reveal" delay={100}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="text-sm font-semibold text-navy mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-teal rounded-full" />
                      High-Yield Savings
                    </h3>
                    <p className="text-sm text-body leading-relaxed">
                      Tiered rates up to 4.25% APY. Balances $5,000–$24,999 earn 3.90% APY. Balances $25,000–$99,999 earn 4.10% APY.
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="text-sm font-semibold text-navy mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                      Money Market
                    </h3>
                    <p className="text-sm text-body leading-relaxed">
                      Check-writing ability included. Balances $10,000–$49,999 earn 3.75% APY. Balances $50,000–$99,999 earn 4.00% APY.
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Community section — full bleed dark */}
      <section className="relative bg-navy grain-overlay section-divider-wave">
        <div className="py-24 md:py-32">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll animation="stagger-children">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight leading-tight mb-6">
                    Rooted in Central Texas
                  </h2>
                  <p className="text-white/60 leading-relaxed mb-8 text-lg font-light">
                    Founded in Georgetown in 1987, Emerie First Bank is locally owned and governed by Central Texas business and civic leaders. We believe that when your banker knows your name and understands your goals, better outcomes follow.
                  </p>
                  <Link
                    href="/locations"
                    className="btn-premium inline-flex items-center px-6 py-3 text-sm font-semibold text-navy bg-gold rounded-lg hover:bg-gold-light transition-all"
                  >
                    Visit a Branch
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { value: "$300K+", label: "Annual Community Giving" },
                    { value: "5", label: "Branch Locations" },
                    { value: "185+", label: "Team Members" },
                    { value: "55K+", label: "Free ATMs Nationwide" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-4xl md:text-5xl font-light text-gold tracking-tight">{stat.value}</div>
                      <div className="text-sm text-white/50 mt-2">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Digital banking callout */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="reveal">
            <div className="relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-teal to-teal-light rounded-2xl p-8 md:p-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="relative">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Bank Anytime, Anywhere</h2>
                <p className="text-white/80 max-w-lg">
                  Free online and mobile banking for all account holders. Mobile deposit, Zelle, card controls, Bill Pay, and more.
                </p>
              </div>
              <Link
                href="/personal"
                className="relative flex-shrink-0 inline-flex items-center px-6 py-3 text-sm font-semibold text-teal bg-white rounded-lg hover:bg-white/90 transition-all shadow-lg"
              >
                Explore Digital Banking
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
