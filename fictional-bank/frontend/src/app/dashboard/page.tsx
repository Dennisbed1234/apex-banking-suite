"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { apiFetch, getCustomerToken, clearCustomerToken } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type Account = {
  accountNumber: string;
  routingNumber: string;
  balance: string;
  availableBalance: string;
};

type Transaction = {
  id: string;
  accountType: string;
  transactionType: string;
  amount: string;
  status: string;
  description?: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState<Account | null>(null);
  const [savings, setSavings] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [depositAmount, setDepositAmount] = useState("");
  const [depositAccount, setDepositAccount] = useState<"CHECKING" | "SAVINGS">("CHECKING");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAccount, setWithdrawAccount] = useState<"CHECKING" | "SAVINGS">("CHECKING");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferFrom, setTransferFrom] = useState<"CHECKING" | "SAVINGS">("CHECKING");
  const [transferTo, setTransferTo] = useState<"CHECKING" | "SAVINGS">("SAVINGS");

  useEffect(() => {
    const t = getCustomerToken();
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
    loadData(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData(t: string) {
    setLoading(true);
    try {
      const [accountsRes, txRes] = await Promise.all([
        apiFetch<{ checking: Account; savings: Account }>("/customer/accounts", { token: t }),
        apiFetch<Transaction[]>("/customer/transactions", { token: t }),
      ]);
      setChecking(accountsRes.checking);
      setSavings(accountsRes.savings);
      setTransactions(txRes);
    } catch (e: any) {
      if (e.message?.includes("token")) {
        clearCustomerToken();
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setActionMsg(null);
    try {
      await apiFetch("/customer/deposit-request", {
        method: "POST",
        token,
        body: { accountType: depositAccount, amount: Number(depositAmount) },
      });
      setActionMsg("Deposit request submitted for review.");
      setDepositAmount("");
      loadData(token);
    } catch (e: any) {
      setActionMsg(e.message);
    }
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setActionMsg(null);
    try {
      await apiFetch("/customer/withdrawal-request", {
        method: "POST",
        token,
        body: { accountType: withdrawAccount, amount: Number(withdrawAmount) },
      });
      setActionMsg("Withdrawal request submitted for review.");
      setWithdrawAmount("");
      loadData(token);
    } catch (e: any) {
      setActionMsg(e.message);
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setActionMsg(null);
    try {
      await apiFetch("/customer/internal-transfer", {
        method: "POST",
        token,
        body: { fromAccountType: transferFrom, toAccountType: transferTo, amount: Number(transferAmount) },
      });
      setActionMsg("Transfer complete.");
      setTransferAmount("");
      loadData(token);
    } catch (e: any) {
      setActionMsg(e.message);
    }
  }

  function logout() {
    clearCustomerToken();
    router.push("/login");
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Loading your dashboard…</div>;
  }

  const chartData = {
    labels: transactions
      .slice()
      .reverse()
      .map((t) => new Date(t.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: "Transaction amount",
        data: transactions.slice().reverse().map((t) => Number(t.amount)),
        borderColor: "#1E5FCC",
        backgroundColor: "#1E5FCC33",
        tension: 0.3,
      },
    ],
  };

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-bank-blue">Dashboard</h1>
        <button onClick={logout} className="text-sm border px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          Log out
        </button>
      </div>

      {actionMsg && <div className="mb-6 bg-blue-50 dark:bg-bank-grayDark text-bank-blue p-3 rounded-lg text-sm">{actionMsg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <AccountCard title="Checking" account={checking} />
        <AccountCard title="Savings" account={savings} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <form onSubmit={handleDeposit} className="bg-white dark:bg-bank-grayDark rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-semibold">Deposit</h3>
          <select value={depositAccount} onChange={(e) => setDepositAccount(e.target.value as any)} className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600">
            <option value="CHECKING">Checking</option>
            <option value="SAVINGS">Savings</option>
          </select>
          <input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} type="number" min="1" step="0.01" placeholder="Amount" required className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600" />
          <button type="submit" className="w-full bg-bank-blue text-white rounded-lg py-2 font-semibold hover:bg-bank-blueLight">Submit Deposit</button>
        </form>

        <form onSubmit={handleWithdraw} className="bg-white dark:bg-bank-grayDark rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-semibold">Withdraw</h3>
          <select value={withdrawAccount} onChange={(e) => setWithdrawAccount(e.target.value as any)} className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600">
            <option value="CHECKING">Checking</option>
            <option value="SAVINGS">Savings</option>
          </select>
          <input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} type="number" min="1" step="0.01" placeholder="Amount" required className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600" />
          <button type="submit" className="w-full bg-bank-blue text-white rounded-lg py-2 font-semibold hover:bg-bank-blueLight">Submit Withdrawal</button>
        </form>

        <form onSubmit={handleTransfer} className="bg-white dark:bg-bank-grayDark rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-semibold">Internal Transfer</h3>
          <div className="flex gap-2">
            <select value={transferFrom} onChange={(e) => setTransferFrom(e.target.value as any)} className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600">
              <option value="CHECKING">Checking</option>
              <option value="SAVINGS">Savings</option>
            </select>
            <select value={transferTo} onChange={(e) => setTransferTo(e.target.value as any)} className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600">
              <option value="SAVINGS">Savings</option>
              <option value="CHECKING">Checking</option>
            </select>
          </div>
          <input value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} type="number" min="1" step="0.01" placeholder="Amount" required className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600" />
          <button type="submit" className="w-full bg-bank-blue text-white rounded-lg py-2 font-semibold hover:bg-bank-blueLight">Transfer</button>
        </form>
      </div>

      <div className="bg-white dark:bg-bank-grayDark rounded-xl p-5 shadow-sm mb-10">
        <h3 className="font-semibold mb-4">Transaction Trend</h3>
        {transactions.length > 0 ? <Line data={chartData} /> : <p className="text-sm text-gray-500">No transactions yet.</p>}
      </div>

      <div className="bg-white dark:bg-bank-grayDark rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Date</th>
              <th>Type</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="py-2">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td>{t.transactionType}</td>
                <td>{t.accountType}</td>
                <td>${Number(t.amount).toFixed(2)}</td>
                <td>{t.status}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">No transactions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function AccountCard({ title, account }: { title: string; account: Account | null }) {
  if (!account) return null;
  return (
    <div className="bg-white dark:bg-bank-grayDark rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-bank-blue mb-4">{title} Account</h3>
      <p className="text-3xl font-bold mb-1">${Number(account.balance).toFixed(2)}</p>
      <p className="text-sm text-gray-500 mb-4">Available: ${Number(account.availableBalance).toFixed(2)}</p>
      <div className="text-xs text-gray-500 space-y-1">
        <p>Account #: •••• {account.accountNumber.slice(-4)}</p>
        <p>Routing #: {account.routingNumber} (demo)</p>
      </div>
    </div>
  );
}
