'use client'

// Bank connection component using Plaid Link
// This component handles the secure connection of bank accounts through Plaid's API
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePlaidLink } from 'react-plaid-link'
import { Building2, Link, CheckCircle, AlertCircle } from 'lucide-react'

// Props interface for the BankConnection component
interface BankConnectionProps {
  onSuccess?: () => void  // Optional callback when bank connection is successful
}

export default function BankConnection({ onSuccess: onSuccessCallback }: BankConnectionProps) {
  // Authentication state - user must be logged in to connect banks
  const { data: session } = useSession()
  
  // Component state management
  const [isLoading, setIsLoading] = useState(false)      // Loading state for API calls
  const [error, setError] = useState('')                 // Error message display
  const [linkToken, setLinkToken] = useState<string | null>(null)  // Plaid link token

  const createLinkToken = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setLinkToken(data.linkToken)
      } else {
        setError(data.error || 'Failed to create link token')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicToken,
          userId: session.user.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setLinkToken(null)
        onSuccessCallback?.()
      } else {
        setError(data.error || 'Failed to connect bank account')
      }
    } catch (error) {
      setError('An error occurred while connecting your bank account.')
    }
  }

  const config = {
    token: linkToken!,
    onSuccess: handlePlaidSuccess,
    onExit: () => setLinkToken(null),
  }

  const { open, ready } = usePlaidLink(config)

  if (!session) {
    return (
      <div className="metric-card text-center">
        <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Sign in required
        </h3>
        <p className="text-white/80 mb-4">
          Please sign in to connect your bank accounts
        </p>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white mb-1">
                Secure Bank Connection
              </h4>
              <p className="text-sm text-white/80">
                Connect your bank accounts securely using Plaid. Your credentials are never stored and all connections are encrypted.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={createLinkToken}
            disabled={isLoading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Link className="h-4 w-4" />
            <span>{isLoading ? 'Preparing...' : 'Connect Bank'}</span>
          </button>

          {linkToken && ready && (
            <button
              onClick={() => open()}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Building2 className="h-4 w-4" />
              <span>Open Plaid</span>
            </button>
          )}
        </div>

        <div className="text-sm text-white/80">
          <p className="mb-2">Supported banks include:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Chase, Bank of America, Wells Fargo</li>
            <li>Citibank, Capital One, American Express</li>
            <li>And 11,000+ other financial institutions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
