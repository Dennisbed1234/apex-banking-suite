import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-bank-grayDark text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="text-white font-semibold mb-2">FirstDemo Bank</h3>
          <p>A fictional bank built for software demonstration purposes only. Not a real financial institution — no real deposits or lending occur here.</p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Contact</h3>
          <p>Bronx, New York</p>
          <p>(337) 800-2049</p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Legal</h3>
          <ul className="space-y-1">
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs py-4 border-t border-white/10">
        © {new Date().getFullYear()} FirstDemo Bank (fictional demo). All accounts and figures shown are simulated.
      </div>
    </footer>
  );
}
