import { NextRequest, NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's connected accounts
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', session.user.id)

    if (accountsError || !accounts || accounts.length === 0) {
      return NextResponse.json(
        { error: 'No connected accounts found' },
        { status: 404 }
      )
    }

    let totalTransactions = 0
    const errors: string[] = []

    // Sync transactions for each account
    for (const account of accounts) {
      try {
        // Get transactions from Plaid
        const transactionsResponse = await plaidClient.transactionsGet({
          access_token: account.plaid_access_token || '', // We need to store this
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          end_date: new Date(),
        })

        const transactions = transactionsResponse.data.transactions

        // Store transactions in database
        for (const transaction of transactions) {
          // Check if transaction already exists
          const { data: existingTransaction } = await supabaseAdmin
            .from('transactions')
            .select('id')
            .eq('plaid_transaction_id', transaction.transaction_id)
            .single()

          if (!existingTransaction) {
            await supabaseAdmin.from('transactions').insert([
              {
                user_id: session.user.id,
                account_id: account.id,
                plaid_transaction_id: transaction.transaction_id,
                amount: transaction.amount,
                currency_code: transaction.iso_currency_code || 'USD',
                description: transaction.name,
                category: transaction.category || [],
                date: transaction.date,
                pending: transaction.pending,
              },
            ])
            totalTransactions++
          }
        }
      } catch (error) {
        console.error(`Error syncing transactions for account ${account.id}:`, error)
        errors.push(`Failed to sync account ${account.name}`)
      }
    }

    return NextResponse.json({
      message: 'Transactions synced successfully',
      totalTransactions,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error in sync transactions API:', error)
    return NextResponse.json(
      { error: 'Failed to sync transactions' },
      { status: 500 }
    )
  }
}
