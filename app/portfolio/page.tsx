'use client'

import { useState, useMemo, useEffect } from 'react'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import DataTable from '@/components/DataTable'
import BankConnection from '@/components/BankConnection'
import { TrendingUp, TrendingDown, DollarSign, Percent, CreditCard, RefreshCw } from 'lucide-react'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'

// Dynamic portfolio data will be calculated from real account and transaction data
// These are fallback values when no real data is available
const fallbackHoldingsData = [
  { symbol: 'CASH', name: 'Cash & Equivalents', shares: 1, avgPrice: 1, currentPrice: 1, marketValue: 0, pnl: 0, pnlPercent: 0 },
]

const fallbackAssetAllocationData = [
  { name: 'Cash & Equivalents', value: 100, color: '#0ea5e9' },
]

const fallbackPerformanceData = [
  { month: 'Jan', return: 0, benchmark: 0.5 },
  { month: 'Feb', return: 0, benchmark: 0.3 },
  { month: 'Mar', return: 0, benchmark: -0.2 },
  { month: 'Apr', return: 0, benchmark: 0.8 },
  { month: 'May', return: 0, benchmark: 0.4 },
  { month: 'Jun', return: 0, benchmark: 0.6 },
]

export default function PortfolioPage() {
  const [isClient, setIsClient] = useState(false)
  const [showBankConnection, setShowBankConnection] = useState(false)
  
  const { accounts, loading: accountsLoading, error: accountsError, refetch: refetchAccounts } = useAccounts()
  const { transactions, loading: transactionsLoading, error: transactionsError, syncTransactions } = useTransactions()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate dynamic portfolio data from real accounts and transactions
  const portfolioData = useMemo(() => {
    if (!isClient) {
      return {
        holdingsData: fallbackHoldingsData,
        assetAllocationData: fallbackAssetAllocationData,
        performanceData: fallbackPerformanceData,
        totalValue: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        totalBankBalance: 0
      }
    }

    // Calculate holdings data from accounts
    const holdingsData = accounts.length > 0 ? accounts.map(account => ({
      symbol: account.type.toUpperCase(),
      name: `${account.name} (${account.type})`,
      shares: 1,
      avgPrice: account.balance,
      currentPrice: account.balance,
      marketValue: account.balance,
      pnl: 0,
      pnlPercent: 0
    })) : fallbackHoldingsData

    // Calculate asset allocation from account types
    const assetAllocationData = accounts.length > 0 ? (() => {
      const typeGroups = accounts.reduce((groups, account) => {
        const type = account.type || 'other'
        if (!groups[type]) {
          groups[type] = { total: 0, count: 0 }
        }
        groups[type].total += account.balance
        groups[type].count += 1
        return groups
      }, {} as Record<string, { total: number, count: number }>)

      const totalBalance = Object.values(typeGroups).reduce((sum, group) => sum + group.total, 0)
      const colors = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']
      
      return Object.entries(typeGroups).map(([type, data], index) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: totalBalance > 0 ? (data.total / totalBalance) * 100 : 0,
        color: colors[index % colors.length]
      }))
    })() : fallbackAssetAllocationData

    // Calculate performance data based on transactions
    const performanceData = accounts.length > 0 ? (() => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const currentMonth = new Date().getMonth()
      
      return months.map((month, index) => {
        // Calculate monthly return based on transaction activity
        const monthTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date)
          return transactionDate.getMonth() === (currentMonth - 11 + index + 12) % 12
        })
        
        const monthlyNetFlow = monthTransactions.reduce((sum, t) => sum + t.amount, 0)
        const monthlyReturn = monthlyNetFlow > 0 ? (monthlyNetFlow / 10000) * 0.1 : 0 // Simulate return based on activity
        
        // Simulate benchmark return (in real app, you'd get this from market data)
        const benchmarkReturn = 0.3 + (Math.random() * 0.4 - 0.2) // 0.1% to 0.5% range
        
        return {
          month,
          return: Math.round(monthlyReturn * 100) / 100, // Round to 2 decimal places
          benchmark: Math.round(benchmarkReturn * 100) / 100
        }
      })
    })() : fallbackPerformanceData

    const totalValue = accounts.reduce((sum, account) => sum + account.balance, 0)
    const totalPnL = 0 // In a real app, you'd calculate this from historical data
    const totalPnLPercent = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0
    const totalBankBalance = totalValue

    return {
      holdingsData,
      assetAllocationData,
      performanceData,
      totalValue,
      totalPnL,
      totalPnLPercent,
      totalBankBalance
    }
  }, [accounts, transactions, isClient])

  const { holdingsData, assetAllocationData, performanceData, totalValue, totalPnL, totalPnLPercent, totalBankBalance } = portfolioData

  const handleSyncTransactions = async () => {
    const result = await syncTransactions()
    if (result.success) {
      alert('Transactions synced successfully!')
    } else {
      alert(`Failed to sync transactions: ${result.error}`)
    }
  }

  // Prevent static rendering issues by not rendering until client-side
  if (!isClient) {
    return (
      <div className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Portfolio Overview</h1>
            <p className="mt-2 text-white opacity-90 drop-shadow-md">Loading portfolio data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Portfolio Overview</h1>
          <p className="mt-2 text-white opacity-90 drop-shadow-md">
            Track your investments and performance
          </p>
        </div>

        {/* Bank Accounts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">Connected Bank Accounts</h2>
            <div className="flex space-x-3">
              <button
                onClick={handleSyncTransactions}
                disabled={accountsLoading}
                className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg px-4 py-2 text-white hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${accountsLoading ? 'animate-spin' : ''}`} />
                <span>Sync Transactions</span>
              </button>
              <button
                onClick={() => setShowBankConnection(!showBankConnection)}
                className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg px-4 py-2 text-white hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>{showBankConnection ? 'Hide' : 'Connect Bank'}</span>
              </button>
            </div>
          </div>

          {showBankConnection && (
            <div className="mb-6">
              <BankConnection onSuccess={() => {
                refetchAccounts()
                setShowBankConnection(false)
              }} />
            </div>
          )}

          {accountsLoading ? (
            <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="mt-2 text-white opacity-90">Loading accounts...</p>
            </div>
          ) : accountsError ? (
            <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg p-8 text-center">
              <p className="text-red-400">Error loading accounts: {accountsError}</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg p-8 text-center">
              <CreditCard className="h-12 w-12 text-white opacity-60 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Bank Accounts Connected</h3>
              <p className="text-white opacity-90 mb-4">Connect your bank accounts to view transactions and balances</p>
              <button
                onClick={() => setShowBankConnection(true)}
                className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg px-4 py-2 text-white hover:bg-opacity-30 transition-all duration-200"
              >
                Connect Bank Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <div key={account.id} className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white bg-opacity-30 rounded-lg">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{account.name}</h3>
                        <p className="text-sm text-white opacity-70">{account.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">${account.balance.toLocaleString()}</p>
                      <p className="text-sm text-white opacity-70">Available</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white opacity-90 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-white">${totalValue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white opacity-90 mb-1">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${totalPnL.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                {totalPnL >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-400" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white opacity-90 mb-1">P&L %</p>
                <p className={`text-2xl font-bold ${totalPnLPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
                </p>
              </div>
              <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                <Percent className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white opacity-90 mb-1">Bank Balance</p>
                <p className="text-2xl font-bold text-white">${totalBankBalance.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Asset Allocation */}
          <div className="bg-white bg-opacity-30 backdrop-blur-md border border-white border-opacity-40 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Asset Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetAllocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Allocation']}
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Performance vs Benchmark */}
          <div className="bg-white bg-opacity-30 backdrop-blur-md border border-white border-opacity-40 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Performance vs Benchmark</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255, 255, 255, 0.8)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.8)"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Return']}
                />
                <Bar dataKey="return" fill="#0ea5e9" name="Portfolio" />
                <Bar dataKey="benchmark" fill="#64748b" name="Benchmark" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Holdings */}
        <div className="bg-white bg-opacity-30 backdrop-blur-md border border-white border-opacity-40 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Portfolio Holdings</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white divide-opacity-20">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white text-opacity-80 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white text-opacity-80 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white text-opacity-80 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white text-opacity-80 uppercase tracking-wider">
                    Avg Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white text-opacity-80 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white text-opacity-80 uppercase tracking-wider">
                    Market Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white text-opacity-80 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white text-opacity-80 uppercase tracking-wider">
                    P&L %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white divide-opacity-20">
                {holdingsData.map((holding, index) => (
                  <tr key={index} className="hover:bg-white hover:bg-opacity-10 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {holding.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white opacity-90">
                      {holding.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white opacity-90">
                      {holding.shares.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white opacity-90">
                      ${holding.avgPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white opacity-90">
                      ${holding.currentPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      ${holding.marketValue.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      holding.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      ${holding.pnl.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      holding.pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}