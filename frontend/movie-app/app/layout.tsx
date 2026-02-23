import type { Metadata } from "next";
import { Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/home";
import { AuthGate } from "@/components/auth";
import { ToastProvider } from "@/contexts/ToastContext";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movies Platform",
  description: "Explore movies, actors, and ratings with clean navigation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${playfair.variable} antialiased`}
      >
        <ToastProvider>
          <div className="flex min-h-screen flex-col bg-[#f7f1e9] text-stone-900 dark:bg-[#12110f] dark:text-stone-100">
            <AuthGate>
              <div className="flex-1">{children}</div>
            </AuthGate>
            <div className="mx-auto w-full max-w-6xl px-5 pb-10 sm:px-10 lg:px-12">
              <Footer />
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
