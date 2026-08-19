import type { Metadata } from "next";
import { Google_Sans } from "next/font/google";
import { NavBar } from "@/components/nav-bar";
import { BottomGlow } from "@/components/bottom-glow";
import "./globals.css";

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Flavorly",
  description: "Find recipes fast, powered by TheMealDB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${googleSans.variable} h-dvh antialiased`}
    >
      {/* h-dvh instead of h-full: on mobile Safari, 100vh includes the
          browser chrome (address bar, toolbar) and overflows the visible
          area. dvh (dynamic viewport height) tracks the actual visible
          height and updates when the on-screen keyboard appears. */}
      <body className="relative min-h-dvh flex flex-col bg-background text-foreground">
        <BottomGlow />
        <NavBar />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
