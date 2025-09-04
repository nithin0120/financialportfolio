// Custom hook for calculating real-time portfolio metrics
// This hook aggregates data from bank accounts and transactions to provide
// comprehensive financial insights for the dashboard
import { useState, useEffect } from 'react'
import { useAccounts } from './useAccounts'
import { useTransactions } from './useTransactions'

// Interface defining the structure of portfolio metrics
interface PortfolioMetrics {
  totalPortfolioValue: number
  totalBankBalance: number
  dailyPnL: number
  dailyPnLPercent: number
  totalPnLPercent: number
  monthlySpending: number
  riskScore: string
  accountCount: number
  transactionCount: number
  loading: boolean
}

export function usePortfolioMetrics(): PortfolioMetrics {
  // Fetch real-time data from our custom hooks
  const { accounts, loading: accountsLoading } = useAccounts()
  const { transactions, loading: transactionsLoading } = useTransactions()
  
  // State to store calculated metrics
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalPortfolioValue: 0,
    totalBankBalance: 0,
    dailyPnL: 0,
    dailyPnLPercent: 0,
    totalPnLPercent: 0,
    monthlySpending: 0,
    riskScore: 'Low',
    accountCount: 0,
    transactionCount: 0,
    loading: true
  })

  // Ensure we always return a valid object
  const safeMetrics: PortfolioMetrics = metrics || {
    totalPortfolioValue: 0,
    totalBankBalance: 0,
    dailyPnL: 0,
    dailyPnLPercent: 0,
    totalPnLPercent: 0,
    monthlySpending: 0,
    riskScore: 'Low',
    accountCount: 0,
    transactionCount: 0,
    loading: true
  }

  // Effect hook that recalculates metrics whenever account or transaction data changes
  useEffect(() => {
    // Show loading state while data is being fetched
    if (accountsLoading || transactionsLoading) {
      setMetrics(prev => ({ ...prev, loading: true }))
      return
    }

    // Calculate total balance across all connected bank accounts
    const totalBankBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
    const accountCount = accounts.length

    // Calculate daily profit & loss from today's transactions
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Filter transactions to only include today's activity
    const todayTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.toDateString() === today.toDateString()
    })

    // Sum up today's transaction amounts (positive = credits, negative = debits)
    const dailyPnL = todayTransactions.reduce((sum, transaction) => {
      // Positive amounts are credits, negative are debits
      return sum + transaction.amount
    }, 0)

    // Calculate daily P&L as a percentage of total balance
    const dailyPnLPercent = totalBankBalance > 0 ? (dailyPnL / totalBankBalance) * 100 : 0

    // Calculate risk score based on account diversification
    // More accounts = lower risk due to diversification
    let riskScore = 'Low'
    if (accountCount === 0) {
      riskScore = 'Unknown'
    } else if (accountCount === 1) {
      riskScore = 'Medium' // Single account = higher risk
    } else if (accountCount >= 3) {
      riskScore = 'Low' // Well diversified
    } else {
      riskScore = 'Medium' // Some diversification
    }

    // For now, total portfolio value equals bank balance
    // In the future, we can add investment accounts, crypto, etc.
    const totalPortfolioValue = totalBankBalance

    // Calculate total P&L percentage (same as daily for now)
    const totalPnLPercent = dailyPnLPercent

    // Calculate monthly spending from transactions
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlySpending = transactions
      .filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear &&
               t.amount < 0 // Only negative amounts (spending)
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Update metrics with calculated values
    const newMetrics = {
      totalPortfolioValue,
      totalBankBalance,
      dailyPnL,
      dailyPnLPercent,
      totalPnLPercent,
      monthlySpending,
      riskScore,
      accountCount,
      transactionCount: transactions.length,
      loading: false
    }
    
    setMetrics(newMetrics)
  }, [accounts, transactions, accountsLoading, transactionsLoading])

  return safeMetrics
}
