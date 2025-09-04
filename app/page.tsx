'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Activity,
  Users,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import PortfolioChart from '@/components/PortfolioChart'
import BankConnection from '@/components/BankConnection'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { usePortfolioMetrics } from '@/hooks/usePortfolioMetrics'

export default function Dashboard() {
  const { data: session } = useSession()
  const { accounts, loading: accountsLoading } = useAccounts()
  const { transactions, loading: transactionsLoading } = useTransactions()
  const portfolioMetrics = usePortfolioMetrics()


  // Simplified animations for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  const metrics = useMemo(() => [
    {
      title: 'Total Portfolio Value',
      value: portfolioMetrics.loading ? 'Loading...' : `$${portfolioMetrics.totalPortfolioValue?.toLocaleString() || 0}`,
      change: portfolioMetrics.loading ? '...' : `${(portfolioMetrics.totalPnLPercent || 0) > 0 ? '+' : ''}${(portfolioMetrics.totalPnLPercent || 0).toFixed(2)}%`,
      changeType: (portfolioMetrics.totalPnLPercent || 0) >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
    },
    {
      title: 'Bank Balance',
      value: portfolioMetrics.loading ? 'Loading...' : `$${portfolioMetrics.totalBankBalance?.toLocaleString() || 0}`,
      change: portfolioMetrics.loading ? '...' : 'vs last month',
      changeType: 'neutral' as const,
      icon: CreditCard,
    },
    {
      title: 'Monthly Spending',
      value: portfolioMetrics.loading ? 'Loading...' : `$${portfolioMetrics.monthlySpending?.toLocaleString() || 0}`,
      change: portfolioMetrics.loading ? '...' : 'vs last month',
      changeType: 'neutral' as const,
      icon: TrendingDown,
    },
    {
      title: 'Active Accounts',
      value: accountsLoading ? 'Loading...' : `${accounts?.length || 0}`,
      change: portfolioMetrics.loading ? '...' : 'connected',
      changeType: 'positive' as const,
      icon: Users,
    }
  ], [portfolioMetrics, accounts, accountsLoading])

  const recentTransactions = useMemo(() => {
    if (transactionsLoading || !transactions) return []
    return transactions.slice(0, 5)
  }, [transactions, transactionsLoading])

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
            Welcome back, {session?.user?.name || 'User'}!
          </h1>
          <p className="text-white opacity-90 drop-shadow-md text-lg">
            Here's your financial overview for today.
          </p>
        </motion.div>

        {/* Metrics grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-4 mb-8"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              variants={itemVariants}
              className="metric-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white opacity-80 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {metric.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {metric.changeType === 'positive' && (
                      <ArrowUpRight className="h-4 w-4 text-green-400 mr-1" />
                    )}
                    {metric.changeType === 'negative' && (
                      <ArrowDownRight className="h-4 w-4 text-red-400 mr-1" />
                    )}
                    <span className={`text-sm ${
                      metric.changeType === 'positive' ? 'text-green-400' :
                      metric.changeType === 'negative' ? 'text-red-400' :
                      'text-white opacity-70'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts and data sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 mb-6 sm:mb-8">
          {/* Portfolio Performance Chart */}
          <div className="chart-container">
            <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Portfolio Performance</h3>
            <PortfolioChart />
          </div>

          {/* Bank Connection */}
          <div className="chart-container">
            <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Connect Bank Account</h3>
            <BankConnection />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="data-table mb-8">
          <div className="px-6 py-4 border-b border-white border-opacity-20">
            <h3 className="text-lg font-semibold text-white drop-shadow-md">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white border-opacity-10">
                  <th className="px-6 py-3 text-left text-xs font-medium text-white opacity-70 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white opacity-70 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white opacity-70 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white opacity-70 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white divide-opacity-10">
                {recentTransactions.map((transaction, index) => (
                  <tr key={transaction.id || index} className="hover:bg-white hover:bg-opacity-5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {transaction.name || 'Transaction'}
                      </div>
                      <div className="text-sm text-white opacity-60">
                        {transaction.category?.[0] || 'Other'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white opacity-80">
                      {transaction.account_name || 'Account'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        (transaction.amount || 0) > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${Math.abs(transaction.amount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white opacity-80">
                      {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status */}
        <div className="chart-container">
          <div className="px-6 py-4 border-b border-white border-opacity-20">
            <h3 className="text-lg font-semibold text-white drop-shadow-md">System Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-6 w-6 text-green-400" />
                </div>
                <h4 className="text-sm font-medium text-white mb-1">API Status</h4>
                <p className="text-xs text-green-400">Operational</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="text-sm font-medium text-white mb-1">Data Sync</h4>
                <p className="text-xs text-blue-400">Up to date</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PieChart className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="text-sm font-medium text-white mb-1">Analytics</h4>
                <p className="text-xs text-purple-400">Processing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}