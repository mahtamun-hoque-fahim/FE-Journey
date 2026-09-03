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
      <body className="relative h-dvh flex flex-col overflow-hidden bg-background text-foreground">
        {/* Skip link — first focusable element; invisible until focused.
            Keyboard users press Tab → Enter to jump past the nav. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background focus:outline-none"
        >
          Skip to main content
        </a>
        <BottomGlow />
        <NavBar />
        <main id="main-content" className="flex flex-1 flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
