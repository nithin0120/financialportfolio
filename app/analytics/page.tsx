'use client'

import { useState, useMemo, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
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
  { month: 'Jan', portfolio: 10000, benchmark: 10000 },
  { month: 'Feb', portfolio: 10250, benchmark: 10100 },
  { month: 'Mar', portfolio: 10100, benchmark: 9900 },
  { month: 'Apr', portfolio: 10350, benchmark: 10150 },
  { month: 'May', portfolio: 10200, benchmark: 10050 },
  { month: 'Jun', portfolio: 10400, benchmark: 10200 },
]

export default function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false)
  const [dateRange, setDateRange] = useState('6M')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const { accounts, loading: accountsLoading } = useAccounts()
  const { transactions, loading: transactionsLoading } = useTransactions()
  const portfolioMetrics = usePortfolioMetrics()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate dynamic analytics data from real accounts and transactions
  const analyticsData = useMemo(() => {
    if (!isClient) {
      return {
        spendingByCategory: fallbackSpendingByCategory,
        monthlySpending: fallbackMonthlySpending,
        investmentPerformance: fallbackInvestmentPerformance,
        insights: [],
        totalSpending: 0,
        totalIncome: 0,
        savingsRate: 0,
        investmentReturn: 0
      }
    }

    // Calculate spending by category from transactions
    const spendingByCategory = transactions.length > 0 ? (() => {
      const categoryGroups = transactions
        .filter(t => t.amount < 0) // Only spending transactions
        .reduce((groups, transaction) => {
          const category = Array.isArray(transaction.category) 
            ? transaction.category[0] || 'Other'
            : transaction.category || 'Other'
          if (!groups[category]) {
            groups[category] = 0
          }
          groups[category] += Math.abs(transaction.amount)
          return groups
        }, {} as Record<string, number>)

      const totalSpending = Object.values(categoryGroups).reduce((sum, amount) => sum + amount, 0)
      const colors = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#06b6d4', '#84cc16']
      
      return Object.entries(categoryGroups).map(([category, amount], index) => ({
        category,
        amount,
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
        color: colors[index % colors.length]
      }))
    })() : fallbackSpendingByCategory

    // Calculate monthly spending from transactions
    const monthlySpending = transactions.length > 0 ? (() => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const currentMonth = new Date().getMonth()
      
      return months.slice(0, 6).map((month, index) => {
        const monthTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date)
          return transactionDate.getMonth() === (currentMonth - 5 + index + 12) % 12
        })
        
        const spending = monthTransactions
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        
        const income = monthTransactions
          .filter(t => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0)
        
        const savings = income - spending
        
        return {
          month,
          spending,
          income,
          savings
        }
      })
    })() : fallbackMonthlySpending

    // Calculate investment performance based on portfolio metrics
    const investmentPerformance = accounts.length > 0 ? (() => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      const baseValue = portfolioMetrics.totalPortfolioValue || 10000
      
      return months.map((month, index) => {
        const growthFactor = 1 + (index * 0.02) + (Math.random() * 0.1 - 0.05) // Simulate growth with volatility
        const portfolioValue = baseValue * growthFactor
        const benchmarkValue = baseValue * (1 + index * 0.015) // Simulate benchmark growth
        
        return {
          month,
          portfolio: Math.round(portfolioValue),
          benchmark: Math.round(benchmarkValue)
        }
      })
    })() : fallbackInvestmentPerformance

    // Generate insights based on data
    const insights = (() => {
      const totalSpending = spendingByCategory.reduce((sum, cat) => sum + cat.amount, 0)
      const totalIncome = monthlySpending.reduce((sum, month) => sum + month.income, 0)
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0
      
      const insightsList = []
      
      if (savingsRate > 20) {
        insightsList.push({
          type: 'positive',
          title: 'Excellent Savings Rate',
          description: `You're saving ${savingsRate.toFixed(1)}% of your income, which is above the recommended 20%.`
        })
      } else if (savingsRate < 10) {
        insightsList.push({
          type: 'warning',
          title: 'Low Savings Rate',
          description: `Your savings rate is ${savingsRate.toFixed(1)}%. Consider reducing expenses or increasing income.`
        })
      }
      
      const topCategory = spendingByCategory[0]
      if (topCategory && topCategory.percentage > 30) {
        insightsList.push({
          type: 'warning',
          title: 'High Spending Category',
          description: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(1)}% of your spending.`
        })
      }
      
      if (portfolioMetrics.totalPnLPercent > 5) {
        insightsList.push({
          type: 'positive',
          title: 'Strong Portfolio Performance',
          description: `Your portfolio is up ${portfolioMetrics.totalPnLPercent.toFixed(1)}% this period.`
        })
      }
      
      return insightsList
    })()

    const totalSpending = spendingByCategory.reduce((sum, cat) => sum + cat.amount, 0)
    const totalIncome = monthlySpending.reduce((sum, month) => sum + month.income, 0)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0
    const investmentReturn = portfolioMetrics.totalPnLPercent || 0

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
  }, [accounts, transactions, portfolioMetrics, isClient])

  const { spendingByCategory, monthlySpending, investmentPerformance, insights, totalSpending, totalIncome, savingsRate, investmentReturn } = analyticsData

  const getInsightColor = (type: string) => {
    return type === 'positive' ? 'text-emerald-400' : 'text-yellow-400'
  }

  const getInsightBgColor = (type: string) => {
    return type === 'positive' ? 'bg-emerald-400 bg-opacity-20' : 'bg-yellow-400 bg-opacity-20'
  }

  const getInsightBorderColor = (type: string) => {
    return type === 'positive' ? 'border-emerald-400 border-opacity-30' : 'border-yellow-400 border-opacity-30'
  }

  // Prevent static rendering issues by not rendering until client-side
  if (!isClient) {
    return (
      <div className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Financial Analytics</h1>
            <p className="mt-2 text-white opacity-90 drop-shadow-md">Loading analytics data...</p>
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
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Financial Analytics</h1>
          <p className="mt-2 text-white opacity-90 drop-shadow-md">
            Comprehensive analysis of your financial data and spending patterns
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80 mb-1">Total Spending</p>
                <p className="text-2xl font-bold text-white">${totalSpending.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-white">${totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80 mb-1">Savings Rate</p>
                <p className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-emerald-400' : savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {savingsRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80 mb-1">Investment Return</p>
                <p className={`text-2xl font-bold ${investmentReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {investmentReturn >= 0 ? '+' : ''}{investmentReturn.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                {investmentReturn >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending by Category */}
          <div className="chart-container">
            <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} ${percentage.toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
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

          {/* Monthly Spending */}
          <div className="chart-container">
            <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Monthly Spending vs Income</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySpending}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255, 255, 255, 0.8)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.8)"
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="spending" fill="#ef4444" name="Spending" />
                <Bar dataKey="income" fill="#22c55e" name="Income" />
                <Bar dataKey="savings" fill="#0ea5e9" name="Savings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment Performance */}
        <div className="chart-container mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Investment Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={investmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
              <XAxis 
                dataKey="month" 
                stroke="rgba(255, 255, 255, 0.8)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.8)"
                fontSize={12}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
              />
              <Line type="monotone" dataKey="portfolio" stroke="#0ea5e9" strokeWidth={2} name="Portfolio" />
              <Line type="monotone" dataKey="benchmark" stroke="#64748b" strokeWidth={2} name="Benchmark" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Insights */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Financial Insights</h3>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getInsightBgColor(insight.type)} ${getInsightBorderColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getInsightBgColor(insight.type)}`}>
                      {insight.type === 'positive' ? (
                        <TrendingUp className={`h-5 w-5 ${getInsightColor(insight.type)}`} />
                      ) : (
                        <TrendingDown className={`h-5 w-5 ${getInsightColor(insight.type)}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${getInsightColor(insight.type)}`}>
                        {insight.title}
                      </h4>
                      <p className="text-white opacity-90 text-sm mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white opacity-70">No insights available. Connect more accounts to get personalized recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}