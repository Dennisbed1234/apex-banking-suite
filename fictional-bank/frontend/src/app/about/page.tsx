import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-bank-blue mb-6">About FirstDemo Bank</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          FirstDemo Bank is a <strong>fictional banking platform</strong> created solely to demonstrate
          full-stack web application design and engineering. It is not a licensed bank, is not
          insured by the FDIC, and does not hold, transmit, or lend real money.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Every account, balance, and transaction shown in this application is simulated data
          used for development and demonstration purposes only.
        </p>
      </main>
      <Footer />
    </>
  );
}
