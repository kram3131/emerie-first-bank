import Link from "next/link";
import Image from "next/image";

const branches = [
  { name: "Georgetown (HQ)", phone: "(512) 930-4500" },
  { name: "Round Rock", phone: "(512) 930-4510" },
  { name: "Cedar Park", phone: "(512) 930-4520" },
  { name: "Austin - Domain", phone: "(512) 930-4530" },
  { name: "Temple", phone: "(512) 930-4540" },
];

const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/personal", label: "Personal Banking" },
  { href: "/business", label: "Business Banking" },
  { href: "/loans", label: "Loans & Mortgages" },
  { href: "/locations", label: "Locations & Hours" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Image
              src="/EmerieFirstBankNoBackgroundWeb.png"
              alt="Emerie First Bank"
              width={180}
              height={40}
              className="h-10 w-auto brightness-0 invert mb-4"
            />
            <p className="text-sm leading-relaxed text-white/60">
              Community-focused banking in Central Texas since 1987. Member FDIC.
            </p>
            <div className="mt-4 space-y-1 text-sm text-white/60">
              <p>Toll-Free: 1-888-364-7428</p>
              <p>Lost/Stolen Card (24/7): 1-888-364-7429</p>
              <p>Fraud Reporting (24/7): 1-888-364-7430</p>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Branches */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Our Branches
            </h3>
            <ul className="space-y-2.5">
              {branches.map((branch) => (
                <li key={branch.name} className="text-sm text-white/60">
                  <span className="text-white/80">{branch.name}</span>
                  <br />
                  {branch.phone}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & departments */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Departments
            </h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>
                <span className="text-white/80">Mortgage</span>
                <br />
                (512) 930-4550
              </li>
              <li>
                <span className="text-white/80">Business Banking</span>
                <br />
                (512) 930-4560
              </li>
              <li>
                <span className="text-white/80">Customer Service</span>
                <br />
                (512) 930-4500
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center">
              <span>&copy; {new Date().getFullYear()} Emerie First Bank</span>
              <span>Member FDIC</span>
              <span>Equal Housing Lender</span>
              <span>NMLS #482310</span>
            </div>
            <p>Routing Number: 111400527</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
