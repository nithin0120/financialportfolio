import { NextRequest, NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    const { userId } = await request.json()

    // Verify the userId matches the session
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create link token
    const linkTokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'FinTech Dashboard',
      products: ['transactions'] as any,
      country_codes: ['US'] as any,
      language: 'en',
      webhook: `${process.env.NEXTAUTH_URL}/api/plaid/webhook`,
    })

    return NextResponse.json({
      linkToken: linkTokenResponse.data.link_token,
    })
  } catch (error) {
    console.error('Error creating link token:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
