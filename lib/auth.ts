import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import validator from 'validator'
import { logger } from '@/lib/logger'

// Create a Supabase client with service role key for authentication
// This bypasses RLS policies which were blocking the anon key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Sanitize email input
          const sanitizedEmail = validator.normalizeEmail(credentials.email.trim().toLowerCase())
          
          if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
            return null
          }

          // Use admin client to bypass RLS policies
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, email, name, password_hash')
            .eq('email', sanitizedEmail)
            .single()

          if (error || !user) {
            logger.error('User not found or error:', error)
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)

          if (!isPasswordValid) {
            logger.error('Invalid password for user:', sanitizedEmail)
            return null
          }

          // Debug: Log the user data to see what we're getting
          logger.debug('User data from database:', { id: user.id, email: user.email, name: user.name })
          
          return {
            id: user.id,
            email: user.email,
            name: user.name || 'User', // Fallback to 'User' if name is null/undefined
          }
        } catch (error) {
          logger.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.iat = Math.floor(Date.now() / 1000)
      }
      
      // Update token if it's older than updateAge
      if (token.iat && typeof token.iat === 'number' && Date.now() / 1000 - token.iat > 24 * 60 * 60) {
        token.iat = Math.floor(Date.now() / 1000)
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
}