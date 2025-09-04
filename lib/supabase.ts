import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  plaid_account_id: string
  name: string
  type: string
  subtype: string
  mask: string
  institution_name: string
  balance: number
  currency: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  plaid_transaction_id: string
  account_id: string
  amount: number
  currency: string
  date: string
  name: string
  category: string[]
  pending: boolean
  created_at: string
}

export interface Portfolio {
  id: string
  user_id: string
  name: string
  total_value: number
  currency: string
  created_at: string
  updated_at: string
}

export interface Holding {
  id: string
  portfolio_id: string
  symbol: string
  name: string
  shares: number
  avg_price: number
  current_price: number
  market_value: number
  pnl: number
  pnl_percent: number
  created_at: string
  updated_at: string
}

