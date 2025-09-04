import { NextResponse } from 'next/server'

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo'
const BASE_URL = 'https://www.alphavantage.co/query'

// Popular stocks to track
const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX']

// Market indices
const INDICES = {
  'SPY': 'S&P 500',
  'QQQ': 'NASDAQ',
  'DIA': 'DOW'
}

export async function GET() {
  try {
    // Check if we have a valid API key
    if (ALPHA_VANTAGE_API_KEY === 'demo') {
      // Return demo data if no API key
      return NextResponse.json({
        stocks: [
          { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: 2.15, changePercent: 1.45, volume: '45.2M' },
          { symbol: 'MSFT', name: 'Microsoft Corp.', price: 320.45, change: -1.20, changePercent: -0.37, volume: '32.1M' },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 128.90, change: 0.85, changePercent: 0.66, volume: '28.7M' },
          { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.80, change: 8.45, changePercent: 3.56, volume: '52.3M' },
          { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 138.75, change: -2.10, changePercent: -1.49, volume: '38.9M' },
          { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 445.60, change: 12.30, changePercent: 2.84, volume: '41.2M' },
        ],
        indices: {
          'SPY': { symbol: 'SPY', name: 'S&P 500', price: 4567.89, change: 12.34, changePercent: 0.27 },
          'QQQ': { symbol: 'QQQ', name: 'NASDAQ', price: 14234.56, change: 45.67, changePercent: 0.32 },
          'DIA': { symbol: 'DIA', name: 'DOW', price: 34567.89, change: -23.45, changePercent: -0.07 }
        },
        marketStatus: 'open',
        lastUpdated: new Date().toISOString()
      })
    }

    // Fetch real data from Alpha Vantage
    const [stocksData, indicesData] = await Promise.all([
      fetchStockData(),
      fetchIndicesData()
    ])

    return NextResponse.json({
      stocks: stocksData,
      indices: indicesData,
      marketStatus: getMarketStatus(),
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching market data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}

async function fetchStockData() {
  const stockPromises = STOCK_SYMBOLS.map(async (symbol) => {
    try {
      const response = await fetch(
        `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      )
      const data = await response.json()
      
      if (data['Global Quote']) {
        const quote = data['Global Quote']
        return {
          symbol: quote['01. symbol'],
          name: getCompanyName(symbol),
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: formatVolume(quote['06. volume'])
        }
      }
      return null
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error)
      return null
    }
  })

  const results = await Promise.all(stockPromises)
  return results.filter(Boolean)
}

async function fetchIndicesData() {
  const indexPromises = Object.keys(INDICES).map(async (symbol) => {
    try {
      const response = await fetch(
        `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      )
      const data = await response.json()
      
      if (data['Global Quote']) {
        const quote = data['Global Quote']
        return {
          symbol,
          name: INDICES[symbol as keyof typeof INDICES],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
        }
      }
      return null
    } catch (error) {
      console.error(`Error fetching index data for ${symbol}:`, error)
      return null
    }
  })

  const results = await Promise.all(indexPromises)
  return results.filter(Boolean)
}

function getCompanyName(symbol: string): string {
  const names: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corp.',
    'GOOGL': 'Alphabet Inc.',
    'TSLA': 'Tesla Inc.',
    'AMZN': 'Amazon.com Inc.',
    'NVDA': 'NVIDIA Corp.',
    'META': 'Meta Platforms Inc.',
    'NFLX': 'Netflix Inc.'
  }
  return names[symbol] || symbol
}

function formatVolume(volume: string): string {
  const num = parseInt(volume)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return volume
}

function getMarketStatus(): string {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()
  
  // Market is open Monday-Friday 9:30 AM - 4:00 PM ET
  if (day >= 1 && day <= 5 && hour >= 9 && hour < 16) {
    return 'open'
  }
  return 'closed'
}
