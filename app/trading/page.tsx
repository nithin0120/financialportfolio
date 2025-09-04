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
  const [quantity, setQuantity] = useState(1)
  const [orderType, setOrderType] = useState('buy')

  const filteredStocks = marketData.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleTrade = () => {
    const action = orderType === 'buy' ? 'Buy' : 'Sell'
    const total = selectedStock.price * quantity
    alert(`${action} order: ${quantity} shares of ${selectedStock.symbol} at $${selectedStock.price} = $${total.toFixed(2)}`)
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Trading Dashboard</h1>
          <p className="mt-2 text-white opacity-90 drop-shadow-md">
            Real-time market data and trading interface
          </p>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white opacity-90 mb-1">Market Status</p>
                <p className="text-lg font-bold text-emerald-400">Open</p>
              </div>
              <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white opacity-90 mb-1">S&P 500</p>
                <p className="text-lg font-bold text-white">4,567.89</p>
                <p className="text-sm text-emerald-400">+12.34 (+0.27%)</p>
              </div>
              <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white opacity-90 mb-1">NASDAQ</p>
                <p className="text-lg font-bold text-white">14,234.56</p>
                <p className="text-sm text-emerald-400">+45.67 (+0.32%)</p>
              </div>
              <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white opacity-90 mb-1">DOW</p>
                <p className="text-lg font-bold text-white">34,567.89</p>
                <p className="text-sm text-red-400">-23.45 (-0.07%)</p>
              </div>
              <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stock List */}
          <div className="lg:col-span-1">
            <div className="bg-white bg-opacity-30 backdrop-blur-md border border-white border-opacity-40 rounded-lg p-6">
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
                {filteredStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => setSelectedStock(stock)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedStock.symbol === stock.symbol
                        ? 'bg-white bg-opacity-30 border border-white border-opacity-50'
                        : 'bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{stock.symbol}</p>
                        <p className="text-sm text-white opacity-70">{stock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">${stock.price.toFixed(2)}</p>
                        <p className={`text-sm ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trading Interface */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Price Chart */}
              <div className="bg-white bg-opacity-30 backdrop-blur-md border border-white border-opacity-40 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">
                  {selectedStock.symbol} - {selectedStock.name}
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
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white opacity-70">Current Price</p>
                    <p className="text-xl font-bold text-white">${selectedStock.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white opacity-70">Change</p>
                    <p className={`text-xl font-bold ${selectedStock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Trading Panel */}
              <div className="bg-white bg-opacity-30 backdrop-blur-md border border-white border-opacity-40 rounded-lg p-6">
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
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white opacity-90">Total Value</span>
                      <span className="text-white font-medium">
                        ${(selectedStock.price * quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white opacity-90">Commission</span>
                      <span className="text-white font-medium">$0.00</span>
                    </div>
                    <div className="border-t border-white border-opacity-20 mt-2 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Total Cost</span>
                        <span className="text-white font-bold">
                          ${(selectedStock.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={handleTrade}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                      orderType === 'buy'
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {orderType === 'buy' ? 'Buy' : 'Sell'} {quantity} Share{quantity > 1 ? 's' : ''} of {selectedStock.symbol}
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