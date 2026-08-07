import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FirstDemo Bank — Fictional Demo Banking Platform",
  description:
    "FirstDemo Bank is a FICTIONAL banking platform built for software demonstration purposes only. It is not a real financial institution.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <div className="bg-bank-blue text-white text-center text-xs py-1 px-2">
            Demo only — FirstDemo Bank is a fictional bank for software development demonstration. No real money or accounts.
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
