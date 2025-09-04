import { useState, useEffect, useCallback } from 'react'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
}

interface IndexData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface MarketData {
  stocks: StockData[]
  indices: Record<string, IndexData>
  marketStatus: string
  lastUpdated: string
}

export function useMarketData() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMarketData = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch('/api/market-data')
      
      if (!response.ok) {
        throw new Error('Failed to fetch market data')
      }
      
      const marketData = await response.json()
      setData(marketData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching market data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMarketData()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchMarketData, 30000)
    
    return () => clearInterval(interval)
  }, [fetchMarketData])

  return {
    data,
    loading,
    error,
    refetch: fetchMarketData
  }
}
