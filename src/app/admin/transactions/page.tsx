'use client'

import { useEffect, useState } from 'react'

interface Transaction {
  id: string
  amount_inr: number
  item_type: string
  status: string
  created_at: string
  razorpay_payment_id: string
  student?: { email: string }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/transactions?pageSize=50')
      .then(r => r.json())
      .then(d => {
        setTransactions(d.data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>Payment Transactions</h1>
      <p className="mt-1 text-sm text-muted-foreground">Monitor platform revenue and individual payments.</p>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center text-muted-foreground gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
            </svg>
            Loading...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/40 bg-muted/20 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">User / Email</th>
                  <th className="px-6 py-4 font-semibold">TXN ID</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-foreground">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-muted/10 transition-colors bg-card">
                    <td className="px-6 py-4 font-medium">{t.student?.email || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{t.razorpay_payment_id}</td>
                    <td className="px-6 py-4">
                      <span className="capitalize">{t.item_type}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">₹{t.amount_inr}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        t.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
