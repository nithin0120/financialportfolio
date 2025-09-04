import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface Account {
  id: string
  user_id: string
  plaid_account_id: string
  name: string
  type: string
  subtype: string
  mask: string
  institution_name: string
  balance: number
  currency_code: string
  created_at: string
  updated_at: string
}

export interface AccountsResponse {
  accounts: Account[]
  count: number
}

export function useAccounts() {
  const { data: session } = useSession()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async () => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/accounts')
      const data = await response.json()

      if (response.ok) {
        setAccounts(data.accounts || [])
      } else {
        setError(data.error || 'Failed to fetch accounts')
      }
    } catch (err) {
      setError('An error occurred while fetching accounts')
      console.error('Error fetching accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  const syncTransactions = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/plaid/sync-transactions', {
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        // Refresh accounts after syncing transactions
        await fetchAccounts()
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err) {
      console.error('Error syncing transactions:', err)
      return { success: false, error: 'Failed to sync transactions' }
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [session?.user?.id])

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
    syncTransactions,
  }
}
