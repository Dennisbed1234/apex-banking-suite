import { Router } from "express";

const router = Router();

// NOTE: This is a simple keyword-based FAQ responder, not a real AI model.
// To make it AI-powered, wire this endpoint to an LLM API (e.g. the
// Anthropic API) with a system prompt restricted to this bank's FAQ content.
const FAQ: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["hour", "open", "close"],
    answer: "FirstDemo Bank (demo) branches are open Mon–Fri 9am–5pm ET. Online banking is available 24/7.",
  },
  {
    keywords: ["deposit"],
    answer: "You can submit a deposit request from your dashboard under Accounts > Deposit. It will be reviewed and typically posts within 1 business day in this demo.",
  },
  {
    keywords: ["withdraw"],
    answer: "Withdrawal requests are submitted from your dashboard and require available balance to cover the amount.",
  },
  {
    keywords: ["balance"],
    answer: "Your current and available balances are shown on your Accounts page for both Checking and Savings.",
  },
  {
    keywords: ["password", "reset", "forgot"],
    answer: "Use 'Forgot password' on the login page to receive a reset link, or change it anytime from Security Settings.",
  },
  {
    keywords: ["contact", "phone", "address"],
    answer: "You can reach FirstDemo Bank (demo) at (337) 800-2049, Bronx, New York.",
  },
];

router.post("/message", (req, res) => {
  const message: string = (req.body?.message || "").toLowerCase();
  const match = FAQ.find((f) => f.keywords.some((k) => message.includes(k)));
  res.json({
    reply:
      match?.answer ||
      "I'm a demo support bot for FirstDemo Bank. I can help with deposits, withdrawals, balances, hours, password resets, and contact info. Could you rephrase your question?",
  });
});

export default router;
