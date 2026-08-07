import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-bank-blue mb-6">Contact Us</h1>
        <div className="bg-white dark:bg-bank-grayDark rounded-xl p-6 shadow-sm space-y-2">
          <p><strong>Address:</strong> Bronx, New York</p>
          <p><strong>Telephone:</strong> (337) 800-2049</p>
          <p className="text-sm text-gray-500 mt-4">
            This is a demo contact record for FirstDemo Bank, a fictional platform. It does not represent a real business.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
