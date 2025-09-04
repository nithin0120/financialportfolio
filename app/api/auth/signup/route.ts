import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import validator from 'validator'
import { logger } from '@/lib/logger'

// Inline security functions
function validateRequestSize(request: Request): boolean {
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
    return false
  }
  return true
}

function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Validate request size
    if (!validateRequestSize(request)) {
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      )
    }

    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedName = validator.escape(name.trim())
    const sanitizedEmail = validator.normalizeEmail(email.trim().toLowerCase())

    // Validate email format
    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate name length
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', sanitizedEmail)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user using admin client (bypasses RLS)
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          name: sanitizedName,
          email: sanitizedEmail,
          password_hash: passwordHash,
        },
      ])
      .select('id, name, email, created_at')
      .single()

    // Debug: Log the created user data
    logger.debug('Created user data:', { id: newUser?.id, name: newUser?.name, email: newUser?.email })

    if (createError) {
      logger.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'An error occurred. Please try again.' },
        { status: 500 }
      )
    }

    // Return success response with user data for auto sign-in
    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
        autoSignIn: true, // Flag to indicate auto sign-in should happen
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
