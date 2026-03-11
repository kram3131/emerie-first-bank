import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const values = [
  {
    title: "Local Decision-Making",
    description:
      "Your loan applications, business proposals, and banking needs are reviewed right here in Central Texas by people who understand the local economy and care about its growth.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    title: "Personal Service",
    description:
      "We believe that when your banker knows your name and understands your goals, better outcomes follow. That principle guides everything we do.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: "Community First",
    description:
      "With more than $300,000 in annual giving and 16 hours of paid volunteer time for every employee, investing in Central Texas is part of who we are.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
];

const communityPartners = [
  "Georgetown Chamber of Commerce",
  "Round Rock ISD Education Foundation",
  "Habitat for Humanity of Williamson County",
  "Williamson County Children's Advocacy Center",
  "Youth sports programs across the region",
];

const stats = [
  { value: "1987", label: "Founded" },
  { value: "5", label: "Branch Locations" },
  { value: "185+", label: "Team Members" },
  { value: "$300K+", label: "Annual Community Giving" },
  { value: "55K+", label: "Free ATMs Nationwide" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <Hero
        title="Our Story"
        subtitle="Nearly four decades of personal banking, rooted in the heart of Central Texas."
      />

      {/* Mission */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="reveal">
            <div className="max-w-3xl mx-auto text-center relative">
              {/* Decorative quotation mark */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-8xl font-serif text-gold/15 leading-none select-none">&ldquo;</div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 text-gold-dark text-xs font-semibold uppercase tracking-wider rounded-full mb-8">
                <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                Our Mission
              </div>
              <blockquote className="text-xl md:text-2xl font-light text-navy leading-relaxed">
                &ldquo;Emerie First Bank exists to strengthen the communities we serve by providing reliable, personal banking backed by local decision-making. We believe that when your banker knows your name and understands your goals, better outcomes follow.&rdquo;
              </blockquote>
              <div className="mt-6 h-1 w-16 bg-gold rounded-full mx-auto" />
            </div>
          </AnimateOnScroll>

          {/* Values — horizontal cards */}
          <AnimateOnScroll animation="stagger-children" className="mt-16">
            <div className="space-y-4">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="flex flex-col md:flex-row items-start gap-6 bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gold/10 text-gold-dark flex items-center justify-center">
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-body leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Our History */}
      <section className="py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll animation="reveal">
              <div>
                <SectionHeading
                  variant="editorial"
                  title="Rooted in Georgetown Since 1987"
                  subtitle=""
                  centered={false}
                />
                <div className="space-y-4 text-body leading-relaxed">
                  <p>
                    Emerie First Bank opened its doors in Georgetown, Texas in 1987 with a simple idea: a bank should know its customers by name. At a time when banking was becoming increasingly impersonal, our founders believed that local ownership and local decision-making would always serve communities better than distant corporate offices.
                  </p>
                  <p>
                    Nearly four decades later, that belief has only grown stronger. From our original Georgetown headquarters, we have expanded to five branches across Central Texas, serving Round Rock, Cedar Park, the Austin Domain area, and Temple. Through every stage of growth, we have stayed true to our founding principle: the best banking is personal.
                  </p>
                  <p>
                    Today, Emerie First Bank operates under a Texas state banking charter, regulated by the Texas Department of Banking and the FDIC. We remain locally owned and governed by a board of directors made up of Central Texas business and civic leaders who understand the needs of our communities firsthand.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="reveal" delay={150}>
              <div className="relative bg-cream rounded-3xl shadow-md p-10 md:p-12">
                {/* Vertical timeline line */}
                <div className="absolute left-[2.5rem] md:left-[3rem] top-12 bottom-12 w-px bg-gradient-to-b from-gold/40 via-teal/30 to-gold/40" />
                <div className="space-y-8 relative">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center relative z-10">
                      <span className="text-xl font-bold text-gold-dark">1987</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy">Founded in Georgetown</h4>
                      <p className="text-sm text-body-light mt-1">Opened our first branch with a commitment to personal, community-focused banking.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center relative z-10">
                      <svg className="w-7 h-7 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy">Expanded Across Central Texas</h4>
                      <p className="text-sm text-body-light mt-1">Grew to five branches in Georgetown, Round Rock, Cedar Park, Austin, and Temple.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center relative z-10">
                      <svg className="w-7 h-7 text-gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy">Embraced Digital Banking</h4>
                      <p className="text-sm text-body-light mt-1">Launched full online and mobile banking with Zelle, mobile deposit, and card controls for all accounts.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center relative z-10">
                      <svg className="w-7 h-7 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy">Still Growing, Still Local</h4>
                      <p className="text-sm text-body-light mt-1">185+ team members strong, contributing over $300,000 annually to the communities we call home.</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            variant="minimal"
            title="Leadership"
            subtitle="Guided by Central Texas business and civic leaders who understand our communities firsthand."
          />
          <AnimateOnScroll animation="reveal-scale">
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                {/* Gradient glow ring behind headshot */}
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold/30 via-teal/20 to-gold/30 blur-md scale-110" />
                  <Image
                    src="/sarah_headshot.png"
                    alt="Sarah Langford, President & CEO"
                    width={96}
                    height={96}
                    className="relative w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                </div>
                <h3 className="text-xl font-bold text-navy">Sarah Langford</h3>
                <p className="text-sm text-gold-dark font-medium mt-1">President & CEO</p>
                <p className="text-sm text-body mt-4 leading-relaxed">
                  Under Sarah&apos;s leadership, Emerie First Bank has grown to five branches and 185+ team members while maintaining the personal, community-focused approach that has defined the bank since 1987.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
          <p className="text-center text-sm text-body-light mt-8 max-w-lg mx-auto">
            Our board of directors is made up of Central Texas business and civic leaders who bring deep local knowledge and a shared commitment to community banking.
          </p>
        </div>
      </section>

      {/* Community Impact */}
      <section className="py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            variant="editorial"
            title="Invested in Central Texas"
            subtitle="Banking is about more than accounts and transactions. It's about building stronger communities."
          />
          <AnimateOnScroll animation="stagger-children">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Giving highlights */}
              <div className="bg-white rounded-2xl shadow-md p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-navy">Community Giving</h3>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-light text-gold-dark">$300,000+</span>
                  <span className="text-sm text-body-light">contributed annually</span>
                </div>
                <p className="text-sm text-body leading-relaxed mb-6">
                  Every year, Emerie First Bank contributes more than $300,000 to organizations that make Central Texas a better place to live, work, and raise a family.
                </p>
                <div className="flex items-center gap-3 p-4 bg-teal/5 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-body">
                    Every employee receives <span className="font-semibold text-navy">16 hours of paid volunteer time</span> each year to give back to the causes they care about.
                  </p>
                </div>
              </div>

              {/* Partners list */}
              <div className="bg-white rounded-2xl shadow-md p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-navy">Community Partners</h3>
                </div>
                <p className="text-sm text-body leading-relaxed mb-6">
                  We are proud to actively support the organizations that strengthen our neighborhoods and uplift our families.
                </p>
                <ul className="space-y-3">
                  {communityPartners.map((partner) => (
                    <li key={partner} className="flex items-start gap-3">
                      <span className="mt-1.5 w-2 h-2 bg-gold rounded-full flex-shrink-0" />
                      <span className="text-sm text-navy font-medium">{partner}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* By the Numbers — full bleed dark */}
      <section className="relative bg-navy grain-overlay">
        <div className="py-24 md:py-32">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll animation="stagger-children">
              <h2 className="text-3xl md:text-4xl font-light text-white text-center mb-16 tracking-tight">
                Emerie First Bank by the Numbers
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-4xl md:text-5xl font-light text-gold tracking-tight">{stat.value}</div>
                    <div className="text-sm text-white/50 mt-2">{stat.label}</div>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="reveal">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-light text-navy mb-4 tracking-tight">
                Ready to Bank With People Who Know Your Name?
              </h2>
              <p className="text-body-light leading-relaxed mb-8">
                Visit any of our five Central Texas branches or open an account online. We look forward to getting to know you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/personal"
                  className="btn-premium inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white bg-gold rounded-lg transition-all hover:bg-gold-dark hover:shadow-lg"
                >
                  Open an Account
                </Link>
                <Link
                  href="/locations"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-navy border-2 border-border rounded-lg transition-all hover:bg-cream"
                >
                  Find a Branch
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
