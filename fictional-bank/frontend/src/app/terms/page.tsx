import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-bank-blue mb-6">Terms &amp; Conditions (Demo)</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          FirstDemo Bank is a fictional application intended solely for software demonstration.
          By using this demo you acknowledge that no real financial services, deposits, loans,
          or account protections are provided.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Replace this placeholder with real terms drafted by legal counsel before using any
          part of this codebase for an actual financial product.
        </p>
      </main>
      <Footer />
    </>
  );
}
