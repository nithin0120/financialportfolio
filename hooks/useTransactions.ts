import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  plaid_transaction_id: string
  amount: number
  currency_code: string
  description: string
  category: string[]
  date: string
  pending: boolean
  created_at: string
  accounts: {
    id: string
    name: string
    type: string
    subtype: string
    mask: string
  }
}

export interface TransactionsResponse {
  transactions: Transaction[]
  count: number
  limit: number
  offset: number
}

export function useTransactions(accountId?: string, limit: number = 50) {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  const fetchTransactions = async (offset: number = 0) => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (accountId) {
        params.append('account_id', accountId)
      }

      const response = await fetch(`/api/transactions?${params}`)
      const data = await response.json()

      if (response.ok) {
        setTransactions(data.transactions || [])
        setCount(data.count || 0)
      } else {
        setError(data.error || 'Failed to fetch transactions')
      }
    } catch (err) {
      setError('An error occurred while fetching transactions')
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [session?.user?.id, accountId, limit])

  const syncTransactions = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/plaid/sync-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh transactions after sync
        await fetchTransactions()
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'An error occurred while syncing transactions' }
    }
  }

  return {
    transactions,
    loading,
    error,
    count,
    refetch: fetchTransactions,
    syncTransactions,
  }
}
