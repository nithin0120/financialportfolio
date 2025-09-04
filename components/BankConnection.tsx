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
      <div className="card text-center">
        <AlertCircle className="h-12 w-12 text-warning-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-dark-900 mb-2">
          Sign in required
        </h3>
        <p className="text-dark-600 mb-4">
          Please sign in to connect your bank accounts
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <Building2 className="h-6 w-6 text-primary-600" />
        <h3 className="text-lg font-semibold text-dark-900">
          Connect Bank Account
        </h3>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-primary-900">
                Secure Bank Connection
              </h4>
              <p className="text-sm text-primary-700 mt-1">
                Connect your bank accounts securely using Plaid. Your credentials are never stored and all connections are encrypted.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={createLinkToken}
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            <Link className="h-4 w-4" />
            <span>{isLoading ? 'Preparing...' : 'Connect Bank'}</span>
          </button>

          {linkToken && ready && (
            <button
              onClick={() => open()}
              className="btn-secondary flex items-center space-x-2"
            >
              <Building2 className="h-4 w-4" />
              <span>Open Plaid</span>
            </button>
          )}
        </div>

        <div className="text-sm text-dark-600">
          <p>Supported banks include:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Chase, Bank of America, Wells Fargo</li>
            <li>Citibank, Capital One, American Express</li>
            <li>And 11,000+ other financial institutions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
