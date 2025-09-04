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
  { month: 'Jul', return: 0, benchmark: 0.2 },
  { month: 'Aug', return: 0, benchmark: 0.7 },
  { month: 'Sep', return: 0, benchmark: 0.3 },
  { month: 'Oct', return: 0, benchmark: -0.1 },
  { month: 'Nov', return: 0, benchmark: 0.9 },
  { month: 'Dec', return: 0, benchmark: 0.4 },
]

const portfolioColumns = [
  { key: 'symbol', label: 'Symbol', sortable: true },
  { key: 'name', label: 'Company Name', sortable: true },
  { key: 'shares', label: 'Shares', sortable: true },
  { key: 'avgPrice', label: 'Avg Price', sortable: true, render: (value: number) => `$${value.toFixed(2)}` },
  { key: 'currentPrice', label: 'Current Price', sortable: true, render: (value: number) => `$${value.toFixed(2)}` },
  { key: 'marketValue', label: 'Market Value', sortable: true, render: (value: number) => `$${value.toLocaleString()}` },
  { key: 'pnl', label: 'P&L', sortable: true, render: (value: number) => (
    <span className={value >= 0 ? 'text-success-600' : 'text-danger-600'}>
      {value >= 0 ? '+' : ''}${value.toFixed(2)}
    </span>
  )},
  { key: 'pnlPercent', label: 'P&L %', sortable: true, render: (value: number) => (
    <span className={value >= 0 ? 'text-success-600' : 'text-danger-600'}>
      {value >= 0 ? '+' : ''}{value.toFixed(2)}%
    </span>
  )},
]

export default function PortfolioPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y')
  const [showBankConnection, setShowBankConnection] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  const { accounts, loading: accountsLoading, error: accountsError, refetch: refetchAccounts, syncTransactions } = useAccounts()
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions()

  // Prevent hydration mismatch by only rendering on client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate dynamic portfolio data based on real account and transaction data
  const portfolioData = useMemo(() => {
    const totalBankBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
    
    // Create holdings data from bank accounts (treating each account as a "holding")
    const holdingsData = accounts.length > 0 ? accounts.map((account, index) => {
      // Simulate some growth for demonstration (in real app, you'd get this from market data)
      const simulatedGrowth = 1 + (Math.random() * 0.1 - 0.05) // ±5% random growth
      const currentValue = account.balance * simulatedGrowth
      const pnl = currentValue - account.balance
      const pnlPercent = account.balance > 0 ? (pnl / account.balance) * 100 : 0
      
      return {
        symbol: account.type?.toUpperCase() || 'CASH',
        name: `${account.institution_name} ${account.name}`,
        shares: 1,
        avgPrice: account.balance,
        currentPrice: currentValue,
        marketValue: currentValue,
        pnl: pnl,
        pnlPercent: pnlPercent
      }
    }) : fallbackHoldingsData

    // Calculate asset allocation based on account types
    const assetAllocationData = accounts.length > 0 ? (() => {
      const typeGroups = accounts.reduce((groups, account) => {
        const type = account.type || 'checking'
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
        const monthlyReturn = totalBankBalance > 0 ? (monthlyNetFlow / totalBankBalance) * 100 : 0
        
        // Simulate benchmark return (in real app, you'd get this from market data)
        const benchmarkReturn = 0.3 + (Math.random() * 0.4 - 0.2) // 0.1% to 0.5% range
        
        return {
          month,
          return: Math.round(monthlyReturn * 100) / 100, // Round to 2 decimal places
          benchmark: Math.round(benchmarkReturn * 100) / 100
        }
      })
    })() : fallbackPerformanceData

    const totalValue = holdingsData.reduce((sum, holding) => sum + holding.marketValue, 0)
    const totalPnL = holdingsData.reduce((sum, holding) => sum + holding.pnl, 0)
    const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0

    return {
      holdingsData,
      assetAllocationData,
      performanceData,
      totalValue,
      totalPnL,
      totalPnLPercent,
      totalBankBalance
    }
  }, [accounts, transactions])

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
      <div className="min-h-screen bg-dark-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-900">Portfolio Overview</h1>
            <p className="mt-2 text-dark-600">
              Track your investments and performance
            </p>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-dark-600">Loading portfolio...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-900">Portfolio Overview</h1>
          <p className="mt-2 text-dark-600">
            Track your investments and performance
          </p>
        </div>

        {/* Bank Accounts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-dark-900">Connected Bank Accounts</h2>
            <div className="flex space-x-3">
              <button
                onClick={handleSyncTransactions}
                disabled={accountsLoading}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${accountsLoading ? 'animate-spin' : ''}`} />
                <span>Sync Transactions</span>
              </button>
              <button
                onClick={() => setShowBankConnection(!showBankConnection)}
                className="btn-primary flex items-center space-x-2"
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
            <div className="card text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-dark-600">Loading accounts...</p>
            </div>
          ) : accountsError ? (
            <div className="card text-center py-8">
              <p className="text-danger-600">Error loading accounts: {accountsError}</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="card text-center py-8">
              <CreditCard className="h-12 w-12 text-dark-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-900 mb-2">No Bank Accounts Connected</h3>
              <p className="text-dark-600 mb-4">Connect your bank accounts to view transactions and balances</p>
              <button
                onClick={() => setShowBankConnection(true)}
                className="btn-primary"
              >
                Connect Your First Bank Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <div key={account.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-primary-100 text-primary-600">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-dark-900">{account.name}</h3>
                        <p className="text-sm text-dark-600">
                          {account.type} •••• {account.mask}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-dark-600">Balance</p>
                      <p className="text-lg font-semibold text-dark-900">
                        ${account.balance.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-dark-600">{account.subtype}</p>
                      <p className="text-xs text-dark-500">{account.institution_name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {accounts.length > 0 && (
            <div className="mt-4 card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-600">Total Bank Balance</p>
                  <p className="text-2xl font-bold text-dark-900">
                    ${totalBankBalance.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-600">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-dark-900">
                  {accountsLoading ? 'Loading...' : `$${totalValue.toLocaleString()}`}
                </p>
                <p className="text-xs text-dark-500 mt-1">
                  {accounts.length > 0 ? `${accounts.length} accounts` : 'No accounts connected'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-600">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {accountsLoading ? 'Loading...' : `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`}
                </p>
                <p className="text-xs text-dark-500 mt-1">
                  {accounts.length > 0 ? 'Simulated growth' : 'Connect accounts to see P&L'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${totalPnL >= 0 ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'}`}>
                {totalPnL >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-600">P&L %</p>
                <p className={`text-2xl font-bold ${totalPnLPercent >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {accountsLoading ? 'Loading...' : `${totalPnLPercent >= 0 ? '+' : ''}${totalPnLPercent.toFixed(2)}%`}
                </p>
                <p className="text-xs text-dark-500 mt-1">
                  {accounts.length > 0 ? 'Based on account balances' : 'No data available'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-dark-100 text-dark-600">
                <Percent className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-600">Account Holdings</p>
                <p className="text-2xl font-bold text-dark-900">
                  {accountsLoading ? 'Loading...' : holdingsData.length}
                </p>
                <p className="text-xs text-dark-500 mt-1">
                  {accounts.length > 0 ? 'Connected accounts' : 'No holdings'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-dark-100 text-dark-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Asset Allocation */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-900">Asset Allocation</h3>
              <div className="text-sm text-dark-500">
                {accounts.length > 0 ? `${accounts.length} accounts` : 'No data'}
              </div>
            </div>
            <div className="h-64">
              {accountsLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-dark-500">Loading asset allocation...</div>
                </div>
              ) : accounts.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-dark-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-2 text-dark-400" />
                    <p className="text-sm">Connect bank accounts to see asset allocation</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
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
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Allocation']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {accounts.length > 0 && (
              <div className="mt-4 text-xs text-dark-500">
                <p>Asset allocation based on account types and balances</p>
              </div>
            )}
          </div>

          {/* Performance vs Benchmark */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-900">Performance vs Benchmark</h3>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="input-field w-24"
              >
                <option value="1M">1M</option>
                <option value="3M">3M</option>
                <option value="6M">6M</option>
                <option value="1Y">1Y</option>
              </select>
            </div>
            <div className="h-64">
              {accountsLoading || transactionsLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-dark-500">Loading performance data...</div>
                </div>
              ) : accounts.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-dark-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-dark-400" />
                    <p className="text-sm">Connect accounts to see performance</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        `${value}%`, 
                        name === 'return' ? 'Portfolio' : 'Benchmark'
                      ]}
                    />
                    <Bar dataKey="return" fill="#0ea5e9" name="Portfolio" />
                    <Bar dataKey="benchmark" fill="#64748b" name="Benchmark" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            {accounts.length > 0 && (
              <div className="mt-4 text-xs text-dark-500">
                <p>Performance based on transaction activity vs simulated benchmark</p>
              </div>
            )}
          </div>
        </div>

        {/* Holdings Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-900">Portfolio Holdings</h3>
            <div className="text-sm text-dark-500">
              {accountsLoading ? 'Loading...' : `${holdingsData.length} holdings`}
            </div>
          </div>
          
          {accountsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-dark-600">Loading holdings...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-dark-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-900 mb-2">No Holdings Available</h3>
              <p className="text-dark-600 mb-4">Connect your bank accounts to see portfolio holdings</p>
              <button
                onClick={() => setShowBankConnection(true)}
                className="btn-primary"
              >
                Connect Bank Accounts
              </button>
            </div>
          ) : (
            <>
              <DataTable
                columns={portfolioColumns}
                data={holdingsData}
                searchable={true}
                filterable={true}
                pagination={true}
                itemsPerPage={10}
              />
              <div className="mt-4 text-xs text-dark-500">
                <p>Holdings represent your connected bank accounts with simulated growth for demonstration purposes</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

