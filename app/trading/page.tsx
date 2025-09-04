'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Search, Plus, Minus, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useMarketData } from '@/hooks/useMarketData'

// Mock chart data (keeping this as mock since intraday data requires premium API)
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
  const [quantity, setQuantity] = useState(1)
  const [orderType, setOrderType] = useState('buy')
  
  const { data: marketData, loading, error, refetch } = useMarketData()
  
  // Set default selected stock when data loads
  const [selectedStock, setSelectedStock] = useState<any>(null)
  
  useEffect(() => {
    if (marketData?.stocks && marketData.stocks.length > 0 && !selectedStock) {
      setSelectedStock(marketData.stocks[0])
    }
  }, [marketData, selectedStock])

  const filteredStocks = marketData?.stocks?.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleTrade = () => {
    if (!selectedStock) {
      alert('Please select a stock to trade')
      return
    }
    
    const action = orderType === 'buy' ? 'Buy' : 'Sell'
    const total = selectedStock.price * quantity
    alert(`${action} order: ${quantity} shares of ${selectedStock.symbol} at $${selectedStock.price} = $${total.toFixed(2)}`)
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Trading Dashboard</h1>
              <p className="mt-2 text-white opacity-90 drop-shadow-md">
                Real-time market data and trading interface
              </p>
            </div>
            <button
              onClick={refetch}
              disabled={loading}
              className="bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          {marketData?.lastUpdated && (
            <p className="text-xs text-white/50 mt-2">
              Last updated: {new Date(marketData.lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80 mb-1">Market Status</p>
                <p className={`text-lg font-bold ${marketData?.marketStatus === 'open' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {loading ? '...' : marketData?.marketStatus === 'open' ? 'Open' : 'Closed'}
                </p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {marketData?.indices?.SPY && (
            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">S&P 500</p>
                  <p className="text-lg font-bold text-white">{marketData.indices.SPY.price.toFixed(2)}</p>
                  <p className={`text-sm ${marketData.indices.SPY.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {marketData.indices.SPY.change >= 0 ? '+' : ''}{marketData.indices.SPY.change.toFixed(2)} ({marketData.indices.SPY.changePercent >= 0 ? '+' : ''}{marketData.indices.SPY.changePercent.toFixed(2)}%)
                  </p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  {marketData.indices.SPY.change >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          )}

          {marketData?.indices?.QQQ && (
            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">NASDAQ</p>
                  <p className="text-lg font-bold text-white">{marketData.indices.QQQ.price.toFixed(2)}</p>
                  <p className={`text-sm ${marketData.indices.QQQ.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {marketData.indices.QQQ.change >= 0 ? '+' : ''}{marketData.indices.QQQ.change.toFixed(2)} ({marketData.indices.QQQ.changePercent >= 0 ? '+' : ''}{marketData.indices.QQQ.changePercent.toFixed(2)}%)
                  </p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  {marketData.indices.QQQ.change >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          )}

          {marketData?.indices?.DIA && (
            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">DOW</p>
                  <p className="text-lg font-bold text-white">{marketData.indices.DIA.price.toFixed(2)}</p>
                  <p className={`text-sm ${marketData.indices.DIA.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {marketData.indices.DIA.change >= 0 ? '+' : ''}{marketData.indices.DIA.change.toFixed(2)} ({marketData.indices.DIA.changePercent >= 0 ? '+' : ''}{marketData.indices.DIA.changePercent.toFixed(2)}%)
                  </p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  {marketData.indices.DIA.change >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stock List */}
          <div className="lg:col-span-1">
            <div className="chart-container">
              <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Market Watch</h3>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white opacity-70" />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
              </div>

              {/* Stock List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-white/70">Loading market data...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-400 mb-2">Failed to load market data</p>
                    <button
                      onClick={refetch}
                      className="bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Retry</span>
                    </button>
                  </div>
                ) : filteredStocks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/70">No stocks found</p>
                  </div>
                ) : (
                  filteredStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedStock?.symbol === stock.symbol
                          ? 'bg-slate-700/50 border border-slate-600/50'
                          : 'bg-slate-700/30 hover:bg-slate-600/40 border border-slate-600/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{stock.symbol}</p>
                          <p className="text-sm text-white/70">{stock.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">${stock.price.toFixed(2)}</p>
                          <p className={`text-sm ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Trading Interface */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Price Chart */}
              <div className="chart-container">
                <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">
                  {selectedStock ? `${selectedStock.symbol} - ${selectedStock.name}` : 'Select a stock to view chart'}
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                    <XAxis 
                      dataKey="time" 
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
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#0ea5e9" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                {selectedStock && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/70">Current Price</p>
                      <p className="text-xl font-bold text-white">${selectedStock.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Change</p>
                      <p className={`text-xl font-bold ${selectedStock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Trading Panel */}
              <div className="chart-container">
                <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Place Order</h3>
                
                <div className="space-y-4">
                  {/* Order Type */}
                  <div>
                    <label className="block text-sm font-medium text-white opacity-90 mb-2">Order Type</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setOrderType('buy')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                          orderType === 'buy'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white bg-opacity-20 text-white border border-white border-opacity-30'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setOrderType('sell')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                          orderType === 'sell'
                            ? 'bg-red-500 text-white'
                            : 'bg-white bg-opacity-20 text-white border border-white border-opacity-30'
                        }`}
                      >
                        Sell
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-white opacity-90 mb-2">Quantity</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white hover:bg-opacity-30 transition-all duration-200"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 py-2 px-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white hover:bg-opacity-30 transition-all duration-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Order Summary */}
                  {selectedStock && (
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/90">Total Value</span>
                        <span className="text-white font-medium">
                          ${(selectedStock.price * quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/90">Commission</span>
                        <span className="text-white font-medium">$0.00</span>
                      </div>
                      <div className="border-t border-white/20 mt-2 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">Total Cost</span>
                          <span className="text-white font-bold">
                            ${(selectedStock.price * quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Place Order Button */}
                  <button
                    onClick={handleTrade}
                    disabled={!selectedStock}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      orderType === 'buy'
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {selectedStock 
                      ? `${orderType === 'buy' ? 'Buy' : 'Sell'} ${quantity} Share${quantity > 1 ? 's' : ''} of ${selectedStock.symbol}`
                      : 'Select a stock to trade'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}