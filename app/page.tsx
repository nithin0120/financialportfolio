'use client'

// Main dashboard component - the heart of our FinTech application
// This page displays financial data, portfolio metrics, and system status
import React, { useState, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity, 
  Shield, 
  Database, 
  Cpu,
  Menu,
  X,
  Bell,
  User,
  Search,
  LogOut,
  CreditCard
} from 'lucide-react'
import { motion } from 'framer-motion'
import PortfolioChart from '@/components/PortfolioChart'
import BankConnection from '@/components/BankConnection'
import { useAccounts } from '@/hooks/useAccounts'
import { usePortfolioMetrics } from '@/hooks/usePortfolioMetrics'
import { useTransactions } from '@/hooks/useTransactions'

export default function Dashboard() {
  // State management for mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Authentication and user session data
  const { data: session } = useSession()
  
  // Data hooks - these fetch data from our APIs
  const { accounts, loading: accountsLoading } = useAccounts()
  const portfolioMetrics = usePortfolioMetrics()
  const { transactions } = useTransactions()
  
  // Navigation utilities
  const router = useRouter()
  const pathname = usePathname()

  // Dashboard metrics configuration - these display real financial data
  // Each metric shows data from connected bank accounts and transactions
  // Using useMemo to prevent initialization issues
  const metrics = useMemo(() => [
    {
      title: 'Total Portfolio Value',
      value: portfolioMetrics.loading ? 'Loading...' : `$${portfolioMetrics.totalPortfolioValue.toLocaleString()}`,
      change: portfolioMetrics.dailyPnLPercent >= 0 ? `+${portfolioMetrics.dailyPnLPercent.toFixed(1)}%` : `${portfolioMetrics.dailyPnLPercent.toFixed(1)}%`,
      changeType: portfolioMetrics.dailyPnLPercent >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: portfolioMetrics.dailyPnLPercent >= 0 ? 'text-success-600' : 'text-danger-600'
    },
    {
      title: 'Bank Account Balance',
      value: portfolioMetrics.loading ? 'Loading...' : `$${portfolioMetrics.totalBankBalance.toLocaleString()}`,
      change: `${portfolioMetrics.accountCount} accounts`,
      changeType: 'positive',
      icon: CreditCard,
      color: 'text-primary-600'
    },
    {
      title: 'Daily P&L',
      value: portfolioMetrics.loading ? 'Loading...' : `${portfolioMetrics.dailyPnL >= 0 ? '+' : ''}$${portfolioMetrics.dailyPnL.toLocaleString()}`,
      change: `${portfolioMetrics.transactionCount} transactions`,
      changeType: portfolioMetrics.dailyPnL >= 0 ? 'positive' : 'negative',
      icon: TrendingUp,
      color: portfolioMetrics.dailyPnL >= 0 ? 'text-success-600' : 'text-danger-600'
    },
    {
      title: 'Risk Score',
      value: portfolioMetrics.riskScore,
      change: portfolioMetrics.accountCount > 0 ? 'Diversified' : 'No accounts',
      changeType: portfolioMetrics.riskScore === 'Low' ? 'positive' : portfolioMetrics.riskScore === 'Medium' ? 'warning' : 'negative',
      icon: Shield,
      color: portfolioMetrics.riskScore === 'Low' ? 'text-success-600' : portfolioMetrics.riskScore === 'Medium' ? 'text-warning-600' : 'text-danger-600'
    }
  ], [portfolioMetrics])

  // Navigation menu configuration - defines all available pages
  // The 'current' property highlights the active page based on the current URL
  const navigation = [
    { name: 'Dashboard', href: '/', current: pathname === '/', icon: BarChart3 },
    { name: 'Portfolio', href: '/portfolio', current: pathname === '/portfolio', icon: TrendingUp },
    { name: 'Trading', href: '/trading', current: pathname === '/trading', icon: Activity },
    { name: 'Analytics', href: '/analytics', current: pathname === '/analytics', icon: BarChart3 },
    { name: 'Infrastructure', href: '/infrastructure', current: pathname === '/infrastructure', icon: Database },
    { name: 'Reports', href: '/reports', current: pathname === '/reports', icon: Cpu },
  ]

  // Navigation handler - uses Next.js router for client-side navigation
  // Also closes mobile sidebar after navigation for better UX
  const handleNavigation = (href: string) => {
    router.push(href)
    setSidebarOpen(false) // Close mobile sidebar after navigation
  }

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-dark-900 bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-xl font-bold text-gradient">FinTech Dashboard</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-dark-500" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                  item.current
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-dark-200">
          <div className="flex h-16 items-center px-6">
            <h1 className="text-xl font-bold text-gradient">FinTech Dashboard</h1>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                  item.current
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-dark-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-dark-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-dark-400 ml-3" />
              <input
                type="text"
                placeholder="Search..."
                className="block h-full w-full border-0 py-0 pl-10 pr-0 text-dark-900 placeholder:text-dark-400 focus:ring-0 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <button className="-m-2.5 p-2.5 text-dark-400 hover:text-dark-500">
              <Bell className="h-6 w-6" />
            </button>
            {session ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-dark-400" />
                  <span className="text-sm text-dark-600">{session.user?.name || session.user?.email}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-sm text-dark-600 hover:text-dark-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a href="/auth/signin" className="text-sm text-dark-600 hover:text-dark-900">
                  Sign In
                </a>
                <span className="text-dark-400">|</span>
                <a href="/auth/signup" className="text-sm text-dark-600 hover:text-dark-900">
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-dark-900">Dashboard Overview</h1>
              <p className="mt-2 text-dark-600">
                Financial data and infrastructure monitoring
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card card-hover"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-dark-900">{metric.value}</p>
                      <p className={`text-sm font-medium ${metric.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'}`}>
                        {metric.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-dark-100 ${metric.color}`}>
                      <metric.icon className="h-6 w-6" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bank Connection Section */}
            <div className="mb-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-dark-900 mb-4">Connect Your Bank</h3>
                <p className="text-dark-600 mb-4">
                  Link your bank accounts to get real-time financial data and insights
                </p>
                <div className="flex items-center space-x-4">
                  <BankConnection />
                  <span className="text-sm text-dark-500">
                    Powered by Plaid • Secure & Encrypted
                  </span>
                </div>
              </div>
            </div>

            {/* Charts and Data Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Portfolio Performance Chart */}
              <div className="card">
                <h3 className="text-lg font-semibold text-dark-900 mb-4">Portfolio Performance</h3>
                <div className="h-64">
                  <PortfolioChart />
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="card">
                <h3 className="text-lg font-semibold text-dark-900 mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {transactions.length > 0 ? (
                    transactions.slice(0, 5).map((transaction, index) => (
                      <div key={transaction.id || index} className="flex items-center justify-between p-3 bg-dark-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${transaction.amount >= 0 ? 'bg-success-500' : 'bg-danger-500'}`} />
                          <div>
                            <p className="font-medium text-dark-900">{transaction.description || 'Transaction'}</p>
                            <p className="text-sm text-dark-600">{transaction.category?.join(', ') || 'Bank Transaction'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.amount >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                            {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <p className="text-sm text-dark-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-dark-500">
                      <p>No transactions found</p>
                      <p className="text-sm">Connect your bank account to see transactions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Infrastructure Status */}
            <div className="mt-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-dark-900 mb-4">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Authentication', status: session ? 'Connected' : 'Disconnected', color: session ? 'status-success' : 'status-warning' },
                    { name: 'Bank Connection', status: accounts.length > 0 ? `${accounts.length} accounts` : 'No accounts', color: accounts.length > 0 ? 'status-success' : 'status-warning' },
                    { name: 'Database', status: 'Connected', color: 'status-success' },
                    { name: 'Plaid API', status: 'Connected', color: 'status-success' },
                    { name: 'Transaction Sync', status: transactions.length > 0 ? `${transactions.length} transactions` : 'No data', color: transactions.length > 0 ? 'status-success' : 'status-warning' },
                    { name: 'Real-time Updates', status: 'Active', color: 'status-success' },
                  ].map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-3 bg-dark-50 rounded-lg">
                      <span className="font-medium text-dark-900">{service.name}</span>
                      <span className={`status-indicator ${service.color}`}>{service.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
