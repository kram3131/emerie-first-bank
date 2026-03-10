import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";

const branches = [
  {
    name: "Georgetown Main (Headquarters)",
    address: "1420 Williams Drive, Georgetown, TX 78628",
    phone: "(512) 930-4500",
    lobby: "Mon–Fri 9:00 AM – 5:00 PM, Sat 9:00 AM – 12:00 PM",
    driveThrough: "Mon–Fri 7:30 AM – 6:00 PM, Sat 8:00 AM – 1:00 PM",
    features: ["ATM", "Safe Deposit Boxes", "Notary"],
    isHQ: true,
  },
  {
    name: "Round Rock",
    address: "2305 N. Mays Street, Round Rock, TX 78665",
    phone: "(512) 930-4510",
    lobby: "Mon–Fri 9:00 AM – 5:00 PM, Sat 9:00 AM – 12:00 PM",
    driveThrough: "Mon–Fri 7:30 AM – 6:00 PM, Sat 8:00 AM – 1:00 PM",
    features: ["ATM", "Safe Deposit Boxes", "Notary"],
    isHQ: false,
  },
  {
    name: "Cedar Park",
    address: "900 E. Whitestone Blvd, Suite 100, Cedar Park, TX 78613",
    phone: "(512) 930-4520",
    lobby: "Mon–Fri 9:00 AM – 5:00 PM",
    driveThrough: "Mon–Fri 7:30 AM – 6:00 PM",
    features: ["ATM", "Notary"],
    isHQ: false,
  },
  {
    name: "Austin – Domain",
    address: "11901 Domain Blvd, Suite 150, Austin, TX 78758",
    phone: "(512) 930-4530",
    lobby: "Mon–Fri 9:00 AM – 5:00 PM, Sat 10:00 AM – 2:00 PM",
    driveThrough: null,
    features: ["ATM", "Lobby Only", "Notary"],
    isHQ: false,
  },
  {
    name: "Temple",
    address: "3215 S. 31st Street, Temple, TX 76502",
    phone: "(512) 930-4540",
    lobby: "Mon–Fri 9:00 AM – 5:00 PM",
    driveThrough: "Mon–Fri 7:30 AM – 6:00 PM",
    features: ["ATM", "Safe Deposit Boxes", "Notary"],
    isHQ: false,
  },
];

const holidays = [
  "New Year's Day",
  "Martin Luther King Jr. Day",
  "Presidents' Day",
  "Memorial Day",
  "Juneteenth",
  "Independence Day",
  "Labor Day",
  "Columbus Day",
  "Veterans Day",
  "Thanksgiving Day",
  "Christmas Day",
];

const contactInfo = [
  { label: "General Customer Service", number: "(512) 930-4500", hours: "Mon–Fri 8 AM – 6 PM, Sat 9 AM – 1 PM" },
  { label: "Toll-Free", number: "1-888-364-7428", hours: "Mon–Fri 8 AM – 6 PM, Sat 9 AM – 1 PM" },
  { label: "Lost/Stolen Debit Card", number: "1-888-364-7429", hours: "24/7" },
  { label: "Fraud Reporting", number: "1-888-364-7430", hours: "24/7" },
  { label: "Mortgage Department", number: "(512) 930-4550", hours: "Mon–Fri 8 AM – 6 PM" },
  { label: "Business Banking", number: "(512) 930-4560", hours: "Mon–Fri 8 AM – 6 PM" },
];

export default function LocationsPage() {
  return (
    <>
      <Hero
        title="Locations & Contact"
        subtitle="Five branches across Central Texas plus 55,000+ surcharge-free ATMs nationwide through the Allpoint network."
      />

      {/* Branch Cards */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Our Branches" subtitle="All branches closed on federal holidays." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <div
                key={branch.name}
                className={`bg-white rounded-2xl border p-6 ${
                  branch.isHQ ? "border-gold ring-1 ring-gold/20 lg:col-span-1" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-navy">{branch.name}</h3>
                  {branch.isHQ && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-gold/10 text-gold rounded-full">
                      HQ
                    </span>
                  )}
                </div>
                <p className="text-sm text-body mb-4">{branch.address}</p>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                      Lobby Hours
                    </div>
                    <div className="text-sm text-body">{branch.lobby}</div>
                    <div className="text-xs text-body-light">Closed Sunday</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                      Drive-Through
                    </div>
                    {branch.driveThrough ? (
                      <div className="text-sm text-body">{branch.driveThrough}</div>
                    ) : (
                      <div className="text-sm text-body-light italic">Lobby only — no drive-through</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {branch.features.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-1 text-xs font-medium bg-cream text-body rounded-md border border-border"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <a
                  href={`tel:${branch.phone.replace(/[^0-9]/g, "")}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-dark transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {branch.phone}
                </a>
              </div>
            ))}

            {/* ATM Network Card */}
            <div className="bg-navy rounded-2xl p-6 text-white">
              <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold mb-2">ATM Network</h3>
              <p className="text-sm text-white/70 mb-3">
                ATMs at all five branches plus surcharge-free access to 55,000+ ATMs nationwide through the Allpoint network.
              </p>
              <p className="text-xs text-white/50">
                Find ATMs via the Emerie First Bank mobile app or at allpointnetwork.com
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Contact Us" subtitle="Reach the right team for your needs." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {contactInfo.map((item) => (
              <div key={item.label} className="bg-cream rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-navy mb-1">{item.label}</h3>
                <a
                  href={`tel:${item.number.replace(/[^0-9]/g, "")}`}
                  className="text-lg font-bold text-gold-dark hover:text-gold transition-colors"
                >
                  {item.number}
                </a>
                <div className="text-xs text-body-light mt-1">{item.hours}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-body">
            <p>
              Secure Messaging available through the mobile app and online banking. Responses within one business day.
            </p>
            <p className="mt-2 text-body-light">
              Email: info@emeriefirstbank.com &bull; Mailing: 1420 Williams Drive, Georgetown, TX 78628
            </p>
          </div>
        </div>
      </section>

      {/* Holidays */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Holiday Schedule" subtitle="All branches are closed on the following holidays." />
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-border p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {holidays.map((holiday) => (
                  <div key={holiday} className="flex items-center gap-2 text-sm text-body">
                    <span className="w-2 h-2 bg-navy rounded-full flex-shrink-0" />
                    {holiday}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
