"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getAdminToken, clearAdminToken } from "@/lib/api";

type Stats = {
  totalUsers: number;
  pendingTransactions: number;
  approvedTransactions: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getAdminToken();
    if (!t) {
      router.push("/secure-admin-login");
      return;
    }
    setToken(t);
    apiFetch<Stats>("/admin/dashboard", { token: t })
      .then(setStats)
      .catch(() => {
        clearAdminToken();
        router.push("/secure-admin-login");
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function searchUsers(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const res = await apiFetch<any[]>(`/admin/users?q=${encodeURIComponent(query)}`, { token });
    setUsers(res);
  }

  async function approve(kind: "deposit" | "withdrawal", requestId: string) {
    if (!token) return;
    await apiFetch(`/admin/approve-${kind}`, { method: "POST", token, body: { requestId } });
    alert(`${kind} approved`);
  }

  function logout() {
    clearAdminToken();
    router.push("/secure-admin-login");
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading admin dashboard…</div>;

  return (
    <main className="min-h-screen bg-bank-grayDark text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Administrator Dashboard</h1>
          <button onClick={logout} className="text-sm border border-white/30 px-4 py-2 rounded-lg hover:bg-white/10">
            Log out
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            <StatCard label="Total Users" value={stats.totalUsers} />
            <StatCard label="Pending Tx" value={stats.pendingTransactions} />
            <StatCard label="Approved Tx" value={stats.approvedTransactions} />
            <StatCard label="Pending Deposits" value={stats.pendingDeposits} />
            <StatCard label="Pending Withdrawals" value={stats.pendingWithdrawals} />
          </div>
        )}

        <div className="bg-white text-bank-grayDark rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-3">Customer Search</h3>
          <form onSubmit={searchUsers} className="flex gap-2 mb-4">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" className="flex-1 border rounded-lg px-3 py-2" />
            <button type="submit" className="bg-bank-blue text-white px-4 py-2 rounded-lg">Search</button>
          </form>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2">{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.status}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={3} className="py-4 text-center text-gray-500">No results yet — search above.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400">
          Deposit/withdrawal approval queues, balance adjustment tools, and the audit log use the
          same <code>apiFetch</code> pattern shown here against <code>/api/admin/*</code> — wire
          additional list views the same way as this customer search table.
        </p>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/10 rounded-xl p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-300">{label}</p>
    </div>
  );
}
