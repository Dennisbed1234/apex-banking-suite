import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqs = [
  { q: "Is this a real bank?", a: "No. FirstDemo Bank is a fictional demo platform for software development purposes only." },
  { q: "How do deposits work?", a: "Submit a deposit request from your dashboard; it is reviewed and posted to your simulated balance." },
  { q: "How do withdrawals work?", a: "Submit a withdrawal request; it requires sufficient available balance and is reviewed before posting." },
  { q: "Can I transfer between my accounts?", a: "Yes, use Internal Transfer on your dashboard to move funds between Checking and Savings instantly." },
  { q: "What are your hours?", a: "This demo's simulated branch hours are Mon–Fri 9am–5pm ET; online banking is available 24/7." },
];

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-bank-blue mb-6">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="bg-white dark:bg-bank-grayDark rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold mb-1">{f.q}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{f.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
