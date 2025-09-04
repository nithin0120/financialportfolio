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

    const { publicToken, userId } = await request.json()

    // Verify the userId matches the session
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    })

    const accessToken = exchangeResponse.data.access_token

    // Get account information
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    })

    // Store access token and account information in database
    for (const account of accountsResponse.data.accounts) {
      // Check if account already exists
      const { data: existingAccount } = await supabaseAdmin
        .from('accounts')
        .select('id')
        .eq('plaid_account_id', account.account_id)
        .eq('user_id', userId)
        .single()

      if (!existingAccount) {
        // Insert new account with access token
        await supabaseAdmin.from('accounts').insert([
          {
            user_id: userId,
            plaid_account_id: account.account_id,
            plaid_access_token: accessToken, // Store the access token for future API calls
            name: account.name,
            type: account.type,
            subtype: account.subtype,
            mask: account.mask,
            institution_name: 'Connected Bank', // You might want to get this from institution info
            balance: account.balances.current || 0,
            currency_code: account.balances.iso_currency_code || 'USD',
          },
        ])
      }
    }

    return NextResponse.json({
      message: 'Bank account connected successfully',
      accounts: accountsResponse.data.accounts.length,
    })
  } catch (error) {
    console.error('Error exchanging token:', error)
    return NextResponse.json(
      { error: 'Failed to connect bank account' },
      { status: 500 }
    )
  }
}
