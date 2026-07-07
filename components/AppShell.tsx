"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { BRAND } from "@/lib/brand";

const EMERIE_SLUG = "emerie-first-bank";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <main>{children}</main>;
  }

  // Demo-shell mode: for any prospect other than Emerie, replace the whole
  // page shell with a full-page screenshot of the target bank's homepage.
  // The chat widget floats on top. Prospect sees THEIR site with our bot.
  const isDemoShell = BRAND.slug !== EMERIE_SLUG;

  if (isDemoShell) {
    return (
      <>
        <div className="min-h-screen w-full bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/site-screenshot.png"
            alt={`${BRAND.name} homepage`}
            className="w-full h-auto block select-none pointer-events-none"
            draggable={false}
          />
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] tracking-wide backdrop-blur-sm">
            DEMO · Chat widget layered on {BRAND.name}
          </div>
        </div>
        <ChatWidget />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
