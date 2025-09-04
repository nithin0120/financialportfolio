'use client'

import { useState, useMemo, useEffect } from 'react'
import { Download, FileText, BarChart3, Calendar, Filter, Eye, Printer, Share2, Loader2 } from 'lucide-react'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { usePortfolioMetrics } from '@/hooks/usePortfolioMetrics'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const reportTypes = [
  {
    id: 'monthly-statement',
    name: 'Monthly Statement',
    description: 'Complete overview of your financial activity for the month',
    icon: FileText,
    format: 'PDF',
    lastGenerated: '2024-01-15',
    status: 'ready'
  },
  {
    id: 'portfolio-summary',
    name: 'Portfolio Summary',
    description: 'Detailed breakdown of your investment portfolio and performance',
    icon: BarChart3,
    format: 'PDF',
    lastGenerated: '2024-01-14',
    status: 'ready'
  },
  {
    id: 'tax-summary',
    name: 'Tax Summary',
    description: 'Year-end tax summary for investment gains and losses',
    icon: FileText,
    format: 'PDF',
    lastGenerated: '2023-12-31',
    status: 'ready'
  },
  {
    id: 'spending-analysis',
    name: 'Spending Analysis',
    description: 'Detailed breakdown of your spending patterns and categories',
    icon: BarChart3,
    format: 'Excel',
    lastGenerated: '2024-01-10',
    status: 'ready'
  },
  {
    id: 'net-worth',
    name: 'Net Worth Report',
    description: 'Comprehensive net worth calculation and asset breakdown',
    icon: BarChart3,
    format: 'PDF',
    lastGenerated: '2024-01-12',
    status: 'ready'
  },
  {
    id: 'budget-variance',
    name: 'Budget Variance Report',
    description: 'Analysis of actual spending vs. budgeted amounts',
    icon: BarChart3,
    format: 'Excel',
    lastGenerated: '2024-01-08',
    status: 'ready'
  }
]

const recentReports = [
  {
    id: 1,
    name: 'January 2024 Statement',
    type: 'Monthly Statement',
    generated: '2024-01-15 14:30',
    size: '2.4 MB',
    downloads: 3
  },
  {
    id: 2,
    name: 'Q4 2023 Portfolio Summary',
    type: 'Portfolio Summary',
    generated: '2024-01-01 09:15',
    size: '1.8 MB',
    downloads: 5
  },
  {
    id: 3,
    name: 'December 2023 Spending Analysis',
    type: 'Spending Analysis',
    generated: '2023-12-31 23:45',
    size: '856 KB',
    downloads: 2
  }
]

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set())
  const [recentReports, setRecentReports] = useState<any[]>([])

  // Fetch real financial data
  const { accounts, loading: accountsLoading } = useAccounts()
  const { transactions, loading: transactionsLoading } = useTransactions()
  const portfolioMetrics = usePortfolioMetrics()
  const portfolioLoading = portfolioMetrics.loading

  // Client-side rendering check
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Generate dynamic report data based on real financial data
  const dynamicReportTypes = useMemo(() => {
    if (!isClient || accountsLoading || transactionsLoading || portfolioLoading) {
      return reportTypes
    }

    const currentDate = new Date()
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const lastMonthStr = lastMonth.toISOString().split('T')[0]

    // Calculate dynamic data for reports
    const totalAccounts = accounts.length
    const totalBalance = portfolioMetrics?.totalPortfolioValue || 0
    const monthlyTransactions = transactions.filter(t => 
      new Date(t.date) >= lastMonth
    ).length

    return reportTypes.map(report => {
      let lastGenerated = report.lastGenerated
      let status = report.status

      // Update last generated dates based on data availability
      if (accounts.length > 0 && transactions.length > 0) {
        switch (report.id) {
          case 'monthly-statement':
            lastGenerated = lastMonthStr
            status = 'ready'
            break
          case 'portfolio-summary':
            lastGenerated = currentDate.toISOString().split('T')[0]
            status = totalBalance > 0 ? 'ready' : 'pending'
            break
          case 'spending-analysis':
            lastGenerated = lastMonthStr
            status = monthlyTransactions > 0 ? 'ready' : 'pending'
            break
          case 'net-worth':
            lastGenerated = currentDate.toISOString().split('T')[0]
            status = totalAccounts > 0 ? 'ready' : 'pending'
            break
        }
      } else {
        status = 'pending'
      }

      return {
        ...report,
        lastGenerated,
        status,
        // Add dynamic metadata
        metadata: {
          totalAccounts,
          totalBalance,
          monthlyTransactions,
          hasData: accounts.length > 0 && transactions.length > 0
        }
      }
    })
  }, [isClient, accounts, transactions, portfolioMetrics, accountsLoading, transactionsLoading, portfolioLoading])

  // Generate recent reports based on actual data
  const generateRecentReports = useMemo(() => {
    if (!isClient || accountsLoading || transactionsLoading) {
      return recentReports
    }

    const currentDate = new Date()
    const reports = []

    if (accounts.length > 0) {
      reports.push({
        id: 1,
        name: `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Statement`,
        type: 'Monthly Statement',
        generated: `${currentDate.toISOString().split('T')[0]} 14:30`,
        size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
        downloads: Math.floor(Math.random() * 5) + 1
      })
    }

    if (portfolioMetrics?.totalPortfolioValue > 0) {
      reports.push({
        id: 2,
        name: `Q${Math.ceil((currentDate.getMonth() + 1) / 3)} ${currentDate.getFullYear()} Portfolio Summary`,
        type: 'Portfolio Summary',
        generated: `${currentDate.toISOString().split('T')[0]} 09:15`,
        size: `${(Math.random() * 1.5 + 0.5).toFixed(1)} MB`,
        downloads: Math.floor(Math.random() * 3) + 1
      })
    }

    if (transactions.length > 0) {
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      reports.push({
        id: 3,
        name: `${lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Spending Analysis`,
        type: 'Spending Analysis',
        generated: `${lastMonth.toISOString().split('T')[0]} 23:45`,
        size: `${(Math.random() * 1 + 0.5).toFixed(1)} MB`,
        downloads: Math.floor(Math.random() * 2) + 1
      })
    }

    return reports
  }, [isClient, accounts, transactions, portfolioMetrics, accountsLoading, transactionsLoading])

  const filteredReports = dynamicReportTypes.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || report.id === selectedType
    return matchesSearch && matchesType
  })

  const handleGenerateReport = async (reportId: string) => {
    setGeneratingReports(prev => new Set(prev).add(reportId))
    
    try {
      // Simulate report generation with real data
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add to recent reports
      const report = dynamicReportTypes.find(r => r.id === reportId)
      if (report) {
        const newReport = {
          id: Date.now(),
          name: `${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} ${report.name}`,
          type: report.name,
          generated: new Date().toISOString().replace('T', ' ').substring(0, 16),
          size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
          downloads: 0
        }
        setRecentReports(prev => [newReport, ...prev.slice(0, 4)])
      }
      
      console.log('Report generated successfully:', reportId)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setGeneratingReports(prev => {
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    }
  }

  const handleDownloadReport = (reportId: string) => {
    // Simulate download
    console.log('Downloading report:', reportId)
    
    // Update download count
    setRecentReports(prev => prev.map(report => 
      report.id.toString() === reportId 
        ? { ...report, downloads: report.downloads + 1 }
        : report
    ))
  }

  // Show loading state until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-dark-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-900">Financial Reports</h1>
            <p className="mt-2 text-dark-600">
              Generate, view, and download financial reports
            </p>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-dark-600">Loading reports...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Financial Reports</h1>
              <p className="mt-2 text-white opacity-90 drop-shadow-md">
                Generate, view, and download financial reports
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Schedule Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="chart-container mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/90 mb-2">
                Search Reports
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Search by report name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-white/90 mb-2">
                Report Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="all">All Types</option>
                <option value="monthly-statement">Monthly Statement</option>
                <option value="portfolio-summary">Portfolio Summary</option>
                <option value="tax-summary">Tax Summary</option>
                <option value="spending-analysis">Spending Analysis</option>
                <option value="net-worth">Net Worth Report</option>
                <option value="budget-variance">Budget Variance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Summary */}
        <div className="mb-8">
          <div className="chart-container">
            <h2 className="text-xl font-semibold text-white drop-shadow-lg mb-4">Financial Data Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                <div className="text-2xl font-bold text-blue-400">
                  {accountsLoading ? '...' : accounts.length}
                </div>
                <div className="text-sm text-white/80">Connected Accounts</div>
              </div>
              <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                <div className="text-2xl font-bold text-green-400">
                  {portfolioLoading ? '...' : `$${portfolioMetrics?.totalPortfolioValue?.toLocaleString() || '0'}`}
                </div>
                <div className="text-sm text-white/80">Total Portfolio Value</div>
              </div>
              <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                <div className="text-2xl font-bold text-yellow-400">
                  {transactionsLoading ? '...' : transactions.length}
                </div>
                <div className="text-sm text-white/80">Total Transactions</div>
              </div>
              <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                <div className="text-2xl font-bold text-purple-400">
                  {accountsLoading || transactionsLoading ? '...' : 
                   accounts.length > 0 && transactions.length > 0 ? 'Ready' : 'Pending'}
                </div>
                <div className="text-sm text-white/80">Report Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Reports */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white drop-shadow-lg mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div key={report.id} className="chart-container hover:shadow-3xl transition-all duration-300 hover:transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-slate-700/50 text-white">
                    <report.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-700/50 text-white rounded-full">
                    {report.format}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-md">{report.name}</h3>
                <p className="text-white/80 text-sm mb-4">{report.description}</p>
                
                <div className="text-xs text-white/60 mb-4">
                  Last generated: {report.lastGenerated}
                </div>
                
                {/* Dynamic status indicator */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.status === 'ready' 
                      ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                  }`}>
                    {report.status === 'ready' ? 'Ready to Generate' : 'Pending Data'}
                  </span>
                  {(report as any).metadata && (
                    <div className="text-xs text-white/60 mt-1">
                      {(report as any).metadata.totalAccounts} accounts • ${(report as any).metadata.totalBalance.toLocaleString()} balance
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={generatingReports.has(report.id) || report.status === 'pending'}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm ${
                      generatingReports.has(report.id) || report.status === 'pending'
                        ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10'
                        : 'bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold'
                    }`}
                  >
                    {generatingReports.has(report.id) ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDownloadReport(report.id)}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold p-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card">
          <h2 className="text-xl font-semibold text-dark-900 mb-4">Recent Reports</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-200">
              <thead className="bg-dark-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Report Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Downloads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-dark-200">
                {generateRecentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-dark-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-dark-900">{report.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-dark-600">{report.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-dark-600">{report.generated}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-dark-600">{report.size}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-dark-600">{report.downloads}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownloadReport(report.id.toString())}
                          className="text-primary-600 hover:text-primary-900"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="text-dark-600 hover:text-dark-900"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-dark-600 hover:text-dark-900"
                          title="Print"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button
                          className="text-dark-600 hover:text-dark-900"
                          title="Share"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
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

