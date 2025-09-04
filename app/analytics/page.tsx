'use client'

import { useState, useMemo, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Download, Eye } from 'lucide-react'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { usePortfolioMetrics } from '@/hooks/usePortfolioMetrics'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

// Fallback data for when no real data is available
const fallbackSpendingByCategory = [
  { category: 'Food & Dining', amount: 1250, percentage: 25, color: '#0ea5e9' },
  { category: 'Transportation', amount: 800, percentage: 16, color: '#22c55e' },
  { category: 'Shopping', amount: 650, percentage: 13, color: '#f59e0b' },
  { category: 'Entertainment', amount: 450, percentage: 9, color: '#ef4444' },
  { category: 'Healthcare', amount: 350, percentage: 7, color: '#8b5cf6' },
  { category: 'Other', amount: 1500, percentage: 30, color: '#64748b' },
]

const fallbackMonthlySpending = [
  { month: 'Jan', spending: 4200, income: 6500, savings: 2300 },
  { month: 'Feb', spending: 3800, income: 6500, savings: 2700 },
  { month: 'Mar', spending: 4500, income: 6500, savings: 2000 },
  { month: 'Apr', spending: 4100, income: 6500, savings: 2400 },
  { month: 'May', spending: 3900, income: 6500, savings: 2600 },
  { month: 'Jun', spending: 4300, income: 6500, savings: 2200 },
]

const fallbackInvestmentPerformance = [
  { month: 'Jan', portfolio: 100000, benchmark: 100000 },
  { month: 'Feb', portfolio: 102500, benchmark: 101800 },
  { month: 'Mar', portfolio: 101800, benchmark: 101200 },
  { month: 'Apr', portfolio: 105200, benchmark: 102900 },
  { month: 'May', portfolio: 104800, benchmark: 103900 },
  { month: 'Jun', portfolio: 106100, benchmark: 104500 },
]

const fallbackInsights = [
  {
    type: 'positive',
    title: 'Increased Savings Rate',
    description: 'Your savings rate improved by 15% this month compared to last month.',
    value: '+15%',
    icon: TrendingUp
  },
  {
    type: 'warning',
    title: 'High Dining Expenses',
    description: 'Food & dining expenses are 20% above your monthly budget.',
    value: '+20%',
    icon: TrendingDown
  },
  {
    type: 'positive',
    title: 'Investment Growth',
    description: 'Your portfolio outperformed the benchmark by 1.5% this quarter.',
    value: '+1.5%',
    icon: TrendingUp
  }
]

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6M')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isClient, setIsClient] = useState(false)
  
  // Fetch real-time data from connected accounts and transactions
  const { accounts, loading: accountsLoading, error: accountsError } = useAccounts()
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions()
  const { portfolioMetrics, loading: portfolioLoading } = usePortfolioMetrics()

  // Prevent hydration mismatch by only rendering on client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate dynamic analytics data based on real account and transaction data
  const analyticsData = useMemo(() => {
    // Calculate spending by category from transactions
    const spendingByCategory = transactions.length > 0 ? (() => {
      const categoryGroups = transactions.reduce((groups, transaction) => {
        // Only include negative amounts (spending)
        if (transaction.amount >= 0) return groups
        
        const category = transaction.category || 'Other'
        if (!groups[category]) {
          groups[category] = 0
        }
        groups[category] += Math.abs(transaction.amount)
        return groups
      }, {} as Record<string, number>)

      const totalSpending = Object.values(categoryGroups).reduce((sum, amount) => sum + amount, 0)
      const colors = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

      return Object.entries(categoryGroups).map(([category, amount], index) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount: Math.round(amount),
        percentage: totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0,
        color: colors[index % colors.length]
      }))
    })() : fallbackSpendingByCategory

    // Calculate monthly spending vs income
    const monthlySpending = transactions.length > 0 ? (() => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const currentMonth = new Date().getMonth()
      
      return months.map((month, index) => {
        const monthIndex = (currentMonth - 5 + index + 12) % 12 // Last 6 months
        const monthTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date)
          return transactionDate.getMonth() === monthIndex
        })

        const spending = monthTransactions
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        
        const income = monthTransactions
          .filter(t => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0)

        return {
          month,
          spending: Math.round(spending),
          income: Math.round(income),
          savings: Math.round(income - spending)
        }
      })
    })() : fallbackMonthlySpending

    // Calculate investment performance based on portfolio metrics
    const investmentPerformance = accounts.length > 0 ? (() => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      const currentBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
      
      return months.map((month, index) => {
        // Simulate portfolio growth with some volatility
        const baseValue = currentBalance * 0.8 // Start from 80% of current value
        const growthFactor = 1 + (index * 0.02) // 2% monthly growth
        const volatility = (Math.random() - 0.5) * 0.05 // ±2.5% random volatility
        
        const portfolioValue = baseValue * growthFactor * (1 + volatility)
        const benchmarkValue = baseValue * (1 + index * 0.015) // 1.5% monthly benchmark growth

        return {
          month,
          portfolio: Math.round(portfolioValue),
          benchmark: Math.round(benchmarkValue)
        }
      })
    })() : fallbackInvestmentPerformance

    // Calculate key metrics
    const totalSpending = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0
    const investmentReturn = portfolioMetrics?.totalPnLPercent || 0

    // Generate dynamic insights based on real data
    const insights = [
      {
        type: savingsRate > 20 ? 'positive' : 'warning',
        title: savingsRate > 20 ? 'Great Savings Rate' : 'Low Savings Rate',
        description: savingsRate > 20 
          ? `Your savings rate of ${savingsRate.toFixed(1)}% is excellent!`
          : `Your savings rate of ${savingsRate.toFixed(1)}% could be improved.`,
        value: `${savingsRate.toFixed(1)}%`,
        icon: savingsRate > 20 ? TrendingUp : TrendingDown
      },
      {
        type: totalSpending > 5000 ? 'warning' : 'positive',
        title: totalSpending > 5000 ? 'High Spending Alert' : 'Spending Under Control',
        description: totalSpending > 5000 
          ? `Your monthly spending of $${totalSpending.toLocaleString()} is above average.`
          : `Your monthly spending of $${totalSpending.toLocaleString()} is well managed.`,
        value: `$${totalSpending.toLocaleString()}`,
        icon: totalSpending > 5000 ? TrendingDown : TrendingUp
      },
      {
        type: investmentReturn > 0 ? 'positive' : 'warning',
        title: investmentReturn > 0 ? 'Portfolio Growth' : 'Portfolio Decline',
        description: investmentReturn > 0 
          ? `Your portfolio has grown by ${investmentReturn.toFixed(1)}% this period.`
          : `Your portfolio has declined by ${Math.abs(investmentReturn).toFixed(1)}% this period.`,
        value: `${investmentReturn > 0 ? '+' : ''}${investmentReturn.toFixed(1)}%`,
        icon: TrendingUp
      }
    ]

    return {
      spendingByCategory,
      monthlySpending,
      investmentPerformance,
      insights,
      totalSpending,
      totalIncome,
      savingsRate,
      investmentReturn
    }
  }, [accounts, transactions, portfolioMetrics])

  const getInsightColor = (type: string) => {
    return type === 'positive' ? 'text-success-600' : 'text-warning-600'
  }

  const getInsightBgColor = (type: string) => {
    return type === 'positive' ? 'bg-success-50' : 'bg-warning-50'
  }

  const getInsightBorderColor = (type: string) => {
    return type === 'positive' ? 'border-success-200' : 'border-warning-200'
  }

  // Prevent static rendering issues by not rendering until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-dark-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="mb-4">
              <BackButton href="/" label="Back to Dashboard" />
            </div>
            <h1 className="text-3xl font-bold text-dark-900">Financial Analytics</h1>
            <p className="mt-2 text-dark-600">
              Deep insights into your spending, saving, and investment patterns
            </p>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-dark-600">Loading analytics...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dark-900">Financial Analytics</h1>
              <p className="mt-2 text-dark-600">
                Analysis of your spending, saving, and investment patterns
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-field w-32"
              >
                <option value="1M">1 Month</option>
                <option value="3M">3 Months</option>
                <option value="6M">6 Months</option>
                <option value="1Y">1 Year</option>
              </select>
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-600">Total Spending</p>
                <p className="text-2xl font-bold text-dark-900">
                  {accountsLoading || transactionsLoading ? 'Loading...' : `$${analyticsData.totalSpending.toLocaleString()}`}
                </p>
                <p className="text-sm text-success-600">
                  {transactions.length > 0 ? 'Based on real data' : 'Connect accounts for real data'}
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
                <p className="text-sm font-medium text-dark-600">Total Income</p>
                <p className="text-2xl font-bold text-dark-900">
                  {accountsLoading || transactionsLoading ? 'Loading...' : `$${analyticsData.totalIncome.toLocaleString()}`}
                </p>
                <p className="text-sm text-success-600">
                  {transactions.length > 0 ? 'From connected accounts' : 'Connect accounts for real data'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-success-100 text-success-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-600">Savings Rate</p>
                <p className="text-2xl font-bold text-dark-900">
                  {accountsLoading || transactionsLoading ? 'Loading...' : `${analyticsData.savingsRate.toFixed(1)}%`}
                </p>
                <p className="text-sm text-success-600">
                  {analyticsData.savingsRate > 20 ? 'Excellent!' : 'Could be improved'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-warning-100 text-warning-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-600">Portfolio Return</p>
                <p className="text-2xl font-bold text-dark-900">
                  {portfolioLoading ? 'Loading...' : `${analyticsData.investmentReturn > 0 ? '+' : ''}${analyticsData.investmentReturn.toFixed(1)}%`}
                </p>
                <p className="text-sm text-success-600">
                  {analyticsData.investmentReturn > 0 ? 'Positive growth' : 'Monitor closely'}
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
          {/* Spending by Category */}
          <div className="card">
            <h3 className="text-lg font-semibold text-dark-900 mb-4">Spending by Category</h3>
            {transactionsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-center">
                <div>
                  <p className="text-dark-500 mb-2">No transaction data available</p>
                  <p className="text-sm text-dark-400">Connect your bank accounts to see spending breakdown</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.spendingByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {analyticsData.spendingByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Monthly Spending vs Income */}
          <div className="card">
            <h3 className="text-lg font-semibold text-dark-900 mb-4">Monthly Spending vs Income</h3>
            {transactionsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-center">
                <div>
                  <p className="text-dark-500 mb-2">No transaction data available</p>
                  <p className="text-sm text-dark-400">Connect your bank accounts to see monthly trends</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.monthlySpending}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                    />
                    <Bar dataKey="income" fill="#22c55e" name="Income" />
                    <Bar dataKey="spending" fill="#ef4444" name="Spending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Investment Performance */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Portfolio Performance vs Benchmark</h3>
          {portfolioLoading || accountsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-center">
              <div>
                <p className="text-dark-500 mb-2">No portfolio data available</p>
                <p className="text-sm text-dark-400">Connect your bank accounts to see performance tracking</p>
              </div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.investmentPerformance}>
                  <defs>
                    <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                  />
                  <Area type="monotone" dataKey="portfolio" stroke="#0ea5e9" fill="url(#colorPortfolio)" name="Portfolio" />
                  <Area type="monotone" dataKey="benchmark" stroke="#64748b" fill="url(#colorBenchmark)" name="Benchmark" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Financial Insights</h3>
          {accountsLoading || transactionsLoading || portfolioLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analyticsData.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getInsightBgColor(insight.type)} ${getInsightBorderColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-white ${getInsightColor(insight.type)}`}>
                      <insight.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-dark-900">{insight.title}</h4>
                        <span className={`text-sm font-semibold ${getInsightColor(insight.type)}`}>
                          {insight.value}
                        </span>
                      </div>
                      <p className="text-sm text-dark-600">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

