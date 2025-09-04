import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const accountId = searchParams.get('account_id')

    // Build query
    let query = supabaseAdmin
      .from('transactions')
      .select(`
        *,
        accounts!inner(
          id,
          name,
          type,
          subtype,
          mask
        )
      `)
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by account if specified
    if (accountId) {
      query = query.eq('account_id', accountId)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)

    if (accountId) {
      countQuery = countQuery.eq('account_id', accountId)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error fetching transaction count:', countError)
    }

    return NextResponse.json({
      transactions: transactions || [],
      count: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error in transactions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
