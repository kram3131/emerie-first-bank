import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Emerie First Bank | Community Banking in Central Texas",
  description:
    "Emerie First Bank is a community-focused regional bank headquartered in Georgetown, Texas. Personal and business banking, loans, mortgages, and more.",
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
