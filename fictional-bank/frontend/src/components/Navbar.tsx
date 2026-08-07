"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-bank-grayDark shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-bank-blue text-xl">
          FirstDemo Bank
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium hover:text-bank-blue transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg border border-bank-blue text-bank-blue hover:bg-bank-blue hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/register" className="text-sm font-medium px-4 py-2 rounded-lg bg-bank-blue text-white hover:bg-bank-blueLight transition-colors">
            Open Account
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <span className="block w-6 h-0.5 bg-current mb-1" />
          <span className="block w-6 h-0.5 bg-current mb-1" />
          <span className="block w-6 h-0.5 bg-current" />
        </button>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="text-sm font-medium">Login</Link>
          <Link href="/register" className="text-sm font-medium text-bank-blue">Open Account</Link>
        </div>
      )}
    </nav>
  );
}
