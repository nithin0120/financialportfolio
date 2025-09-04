'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Search, Plus, Minus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock market data
const marketData = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: 2.15, changePercent: 1.45, volume: '45.2M' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 320.45, change: -1.20, changePercent: -0.37, volume: '32.1M' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 128.90, change: 0.85, changePercent: 0.66, volume: '28.7M' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.80, change: 8.45, changePercent: 3.56, volume: '52.3M' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 138.75, change: -2.10, changePercent: -1.49, volume: '38.9M' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 445.60, change: 12.30, changePercent: 2.84, volume: '41.2M' },
]

const chartData = [
  { time: '09:30', price: 148.50 },
  { time: '10:00', price: 149.20 },
  { time: '10:30', price: 150.10 },
  { time: '11:00', price: 149.80 },
  { time: '11:30', price: 150.25 },
  { time: '12:00', price: 150.75 },
  { time: '12:30', price: 151.20 },
  { time: '13:00', price: 150.90 },
  { time: '13:30', price: 150.25 },
]

export default function TradingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStock, setSelectedStock] = useState(marketData[0])
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [shares, setShares] = useState('')
  const [orderPrice, setOrderPrice] = useState('')

  const filteredStocks = marketData.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would integrate with your trading API
    console.log('Order submitted:', {
      symbol: selectedStock.symbol,
      type: orderType,
      shares: parseInt(shares),
      price: parseFloat(orderPrice)
    })
  }

  return (
    <div className="min-h-screen bg-dark-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-900">Trading Dashboard</h1>
          <p className="mt-2 text-dark-600">
            Market data and trading execution
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Overview */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-dark-900 mb-4">Market Overview</h3>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {/* Stock List */}
              <div className="space-y-2">
                {filteredStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedStock.symbol === stock.symbol
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-dark-200 hover:border-dark-300'
                    }`}
                    onClick={() => setSelectedStock(stock)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-dark-400" />
                          <div>
                            <p className="font-semibold text-dark-900">{stock.symbol}</p>
                            <p className="text-sm text-dark-600">{stock.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-dark-900">${stock.price}</p>
                        <div className={`flex items-center space-x-1 text-sm ${
                          stock.change >= 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {stock.change >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>
                            {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent}%)
                          </span>
                        </div>
                        <p className="text-xs text-dark-500">Vol: {stock.volume}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            {/* Stock Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold text-dark-900 mb-4">
                {selectedStock.symbol} Chart
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                    />
                    <Line type="monotone" dataKey="price" stroke="#0ea5e9" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trading Form */}
            <div className="card">
              <h3 className="text-lg font-semibold text-dark-900 mb-4">Place Order</h3>
              
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Stock
                  </label>
                  <div className="p-3 bg-dark-50 rounded-lg border border-dark-200">
                    <p className="font-semibold text-dark-900">{selectedStock.symbol}</p>
                    <p className="text-sm text-dark-600">{selectedStock.name}</p>
                    <p className="text-lg font-bold text-dark-900">${selectedStock.price}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Order Type
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('buy')}
                      className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors ${
                        orderType === 'buy'
                          ? 'border-success-300 bg-success-50 text-success-700'
                          : 'border-dark-300 text-dark-700 hover:bg-dark-50'
                      }`}
                    >
                      <Plus className="h-4 w-4 inline mr-2" />
                      Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('sell')}
                      className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors ${
                        orderType === 'sell'
                          ? 'border-danger-300 bg-danger-50 text-danger-700'
                          : 'border-dark-300 text-dark-700 hover:bg-dark-50'
                      }`}
                    >
                      <Minus className="h-4 w-4 inline mr-2" />
                      Sell
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="shares" className="block text-sm font-medium text-dark-700 mb-2">
                    Number of Shares
                  </label>
                  <input
                    id="shares"
                    type="number"
                    min="1"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="input-field"
                    placeholder="Enter number of shares"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-dark-700 mb-2">
                    Order Price
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(e.target.value)}
                    className="input-field"
                    placeholder="Enter order price"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                    orderType === 'buy'
                      ? 'bg-success-600 hover:bg-success-700'
                      : 'bg-danger-600 hover:bg-danger-700'
                  }`}
                >
                  {orderType === 'buy' ? 'Buy' : 'Sell'} {selectedStock.symbol}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

