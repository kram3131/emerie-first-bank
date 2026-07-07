import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { BRAND } from "@/lib/brand";

const IS_EMERIE = BRAND.slug === "emerie-first-bank";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: IS_EMERIE
    ? "Emerie First Bank | Community Banking in Central Texas"
    : `${BRAND.name} · AI assistant demo`,
  description: IS_EMERIE
    ? "Emerie First Bank is a community-focused regional bank headquartered in Georgetown, Texas. Personal and business banking, loans, mortgages, and more."
    : `Interactive AI-assistant demo layered on ${BRAND.name}'s website. Chat and voice grounded in ${BRAND.name}'s published content.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
