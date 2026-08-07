import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-bank-blue to-bank-blueLight text-white">
          <div className="max-w-6xl mx-auto px-4 py-24 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Banking, simplified.</h1>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              FirstDemo Bank is a fictional demo platform showcasing modern online banking —
              checking, savings, transfers, and insights, all in one place.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register" className="bg-white text-bank-blue font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                Open a Demo Account
              </Link>
              <Link href="/login" className="border border-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
                Login
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Checking & Savings", desc: "Manage both accounts side by side with real-time balances." },
            { title: "Instant Transfers", desc: "Move money between your accounts in seconds." },
            { title: "Insights & Charts", desc: "Track deposits, withdrawals, and balance history over time." },
          ].map((f) => (
            <div key={f.title} className="bg-white dark:bg-bank-grayDark rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-bank-blue">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
