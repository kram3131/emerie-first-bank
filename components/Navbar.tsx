"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/personal", label: "Personal" },
  { href: "/business", label: "Business" },
  { href: "/loans", label: "Loans & Mortgages" },
  { href: "/locations", label: "Locations" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
    <div className="bg-navy text-white/70 text-xs text-center py-2 px-4">
      <span className="font-semibold text-gold">DEMO SITE</span> — Emerie First Bank is a fictitious institution created to demonstrate the Emerie AI assistant. All information on this site is simulated.
    </div>
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-border/50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/EmerieFirstBankNoBackgroundWeb.png"
              alt="Emerie First Bank"
              width={280}
              height={56}
              className="h-28 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-navy"
                    : "text-body hover:text-navy"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gold rounded-full" />
                )}
              </Link>
            ))}
            <Link
              href="/personal"
              className="ml-4 btn-premium inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gold rounded-lg transition-all hover:bg-gold-dark hover:shadow-md"
            >
              Open an Account
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-navy rounded-lg hover:bg-cream"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-white/95 backdrop-blur-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  pathname === link.href
                    ? "text-navy bg-cream"
                    : "text-body hover:text-navy hover:bg-cream"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/personal"
              onClick={() => setMobileOpen(false)}
              className="block mt-2 text-center px-4 py-3 text-sm font-semibold text-white bg-gold rounded-lg hover:bg-gold-dark"
            >
              Open an Account
            </Link>
          </div>
        </div>
      )}
    </nav>
    </>
  );
}
