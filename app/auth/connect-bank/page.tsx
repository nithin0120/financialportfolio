'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, CheckCircle, ArrowRight, Shield, Lock, CreditCard } from 'lucide-react'
import { usePlaidLink } from 'react-plaid-link'

function ConnectBankContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [step, setStep] = useState(1) // 1: Welcome, 2: Connect Bank, 3: Success

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

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
        setStep(2)
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
        setIsConnected(true)
        setStep(3)
        setLinkToken(null)
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
    onExit: () => {
      setLinkToken(null)
      setStep(1)
    },
  }

  const { open, ready } = usePlaidLink(config)

  const handleSkip = () => {
    router.push('/')
  }

  const handleContinue = () => {
    router.push('/')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome to Your Dashboard, {session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}!
          </h2>
          <p className="text-slate-300 text-lg">
            Let's connect your bank account to get started
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-8 shadow-2xl"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Connect Your Bank Account
                </h3>
                <p className="text-slate-300 mb-6">
                  Securely connect your bank account to start tracking your finances and transactions.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
                  <Shield className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Bank-Level Security</h4>
                    <p className="text-sm text-slate-300">
                      Your credentials are encrypted and never stored. We use Plaid, trusted by thousands of financial apps.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                  <Lock className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Read-Only Access</h4>
                    <p className="text-sm text-slate-300">
                      We can only view your account information. We cannot make transactions or changes to your accounts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Real-Time Data</h4>
                    <p className="text-sm text-slate-300">
                      Get up-to-date account balances, transactions, and financial insights automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={createLinkToken}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Building2 className="h-5 w-5" />
                      <span>Connect Bank Account</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSkip}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Skip for Now
                </motion.button>
              </div>
            </div>
          )}

          {step === 2 && linkToken && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Ready to Connect
                </h3>
                <p className="text-slate-300 mb-6">
                  Click the button below to securely connect your bank account through Plaid.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => open()}
                disabled={!ready}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Building2 className="h-5 w-5" />
                <span>{ready ? 'Open Plaid Link' : 'Loading...'}</span>
              </motion.button>

              <button
                onClick={() => setStep(1)}
                className="w-full text-slate-400 hover:text-white transition-colors duration-200"
              >
                ← Back
              </button>
            </div>
          )}

          {step === 3 && isConnected && (
            <div className="space-y-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Bank Account Connected!
                </h3>
                <p className="text-slate-300 mb-6">
                  Your bank account has been successfully connected. You can now view your transactions and account balances.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function ConnectBankPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ConnectBankContent />
    </Suspense>
  )
}
