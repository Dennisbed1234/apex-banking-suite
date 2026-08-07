import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-bank-blue mb-6">Privacy Policy (Demo)</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          This is placeholder privacy policy text for a fictional demo application. In a
          production deployment, replace this page with a real privacy policy reviewed by
          legal counsel, describing what data is collected, how it is stored, and users' rights.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Data entered into this demo (e.g. during registration) is used only to demonstrate
          application functionality and should not include real sensitive personal information.
        </p>
      </main>
      <Footer />
    </>
  );
}
