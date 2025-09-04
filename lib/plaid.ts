import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
})

export const plaidClient = new PlaidApi(configuration)

export interface PlaidAccount {
  account_id: string
  balances: {
    available: number
    current: number
    iso_currency_code: string
    limit?: number
    unofficial_currency_code?: string
  }
  mask: string
  name: string
  official_name?: string
  subtype: string
  type: string
}

export interface PlaidTransaction {
  account_id: string
  amount: number
  iso_currency_code: string
  unofficial_currency_code?: string
  category: string[]
  category_id: string
  check_number?: string
  counterparties?: any[]
  date: string
  datetime?: string
  authorized_date?: string
  authorized_datetime?: string
  location: {
    address?: string
    city?: string
    region?: string
    lat?: number
    lon?: number
    store_number?: string
    postal_code?: string
    country?: string
  }
  name: string
  merchant_name?: string
  merchant_entity_id?: string
  logo_url?: string
  website?: string
  payment_channel: string
  pending: boolean
  pending_transaction_id?: string
  personal_finance_category?: {
    primary: string
    detailed: string
    confidence_level: string
  }
  personal_finance_category_icon_url?: string
  transaction_id: string
  transaction_code?: string
  transaction_type?: string
}

