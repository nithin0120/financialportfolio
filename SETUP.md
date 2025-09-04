# 🚀 FinTech Dashboard Setup Guide

This guide will help you set up the FinTech Data Infrastructure Dashboard with all integrations including Plaid, Supabase, and authentication.

## 📋 Prerequisites

- Node.js 18+ and npm (already installed)
- Git
- A Plaid account (sandbox for testing)
- A Supabase project
- A Stripe account (optional, for payments)

## 🔧 Step 1: Install Dependencies

```bash
npm install
```

## 🔑 Step 2: Environment Configuration

1. **Copy the environment file:**
   ```bash
   cp env.example .env.local
   ```

2. **Fill in your API keys in `.env.local`:**

### Plaid Configuration
```bash
# Get these from https://dashboard.plaid.com/
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret_key
PLAID_ENV=sandbox  # Use 'sandbox' for testing, 'development' for live
```

### Supabase Configuration
```bash
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Authentication
```bash
# Generate a random secret: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### Stripe (Optional)
```bash
# Get these from https://dashboard.stripe.com/
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🗄️ Step 3: Set Up Supabase Database

1. **Go to [Supabase](https://supabase.com) and create a new project**

2. **Run this SQL in the Supabase SQL editor:**

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User tokens for Plaid
CREATE TABLE user_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plaid_access_token VARCHAR NOT NULL,
  plaid_item_id VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bank accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plaid_account_id VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  subtype VARCHAR NOT NULL,
  mask VARCHAR NOT NULL,
  institution_name VARCHAR NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plaid_transaction_id VARCHAR UNIQUE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  date DATE NOT NULL,
  name VARCHAR NOT NULL,
  category TEXT[] DEFAULT '{}',
  pending BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolios
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  total_value DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Holdings
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  shares INTEGER NOT NULL,
  avg_price DECIMAL(15,4) NOT NULL,
  current_price DECIMAL(15,4) NOT NULL,
  market_value DECIMAL(15,2) NOT NULL,
  pnl DECIMAL(15,2) NOT NULL,
  pnl_percent DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own tokens" ON user_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tokens" ON user_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tokens" ON user_tokens FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own portfolios" ON portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolios" ON portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolios" ON portfolios FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own holdings" ON holdings FOR SELECT USING (
  EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = holdings.portfolio_id AND portfolios.user_id = auth.uid())
);
CREATE POLICY "Users can insert own holdings" ON holdings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = holdings.portfolio_id AND portfolios.user_id = auth.uid())
);
CREATE POLICY "Users can update own holdings" ON holdings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = holdings.portfolio_id AND portfolios.user_id = auth.uid())
);
```

## 🔗 Step 4: Set Up Plaid

1. **Go to [Plaid Dashboard](https://dashboard.plaid.com/)**

2. **Create a new app:**
   - Name: "FinTech Dashboard"
   - Environment: Sandbox (for testing)
   - Products: Auth, Transactions

3. **Get your credentials:**
   - Client ID
   - Secret Key
   - Add them to `.env.local`

4. **Test with Plaid Sandbox:**
   - Use test credentials: `user_good` / `pass_good`
   - Test institutions: Chase, Bank of America, etc.

## 🚀 Step 5: Run the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Create your first account:**
   - Go to `/auth/signup`
   - Create a new user account
   - Sign in at `/auth/signin`

## 🧪 Step 6: Test the Integrations

### Test Bank Connection
1. Sign in to your account
2. Go to the dashboard
3. Click "Connect Bank Account"
4. Use Plaid sandbox credentials
5. Select a test bank (Chase, Bank of America, etc.)

### Test Portfolio Management
1. Navigate to `/portfolio`
2. View your portfolio overview
3. Check asset allocation charts

### Test Trading
1. Go to `/trading`
2. Browse market data
3. Try placing mock orders

### Test Analytics
1. Visit `/analytics`
2. View spending patterns
3. Check investment performance

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure session management
- **Row Level Security**: Database-level access control
- **Environment Variables**: Secure API key storage
- **HTTPS**: Secure communication (in production)

## 📱 Features Available

✅ **Authentication System**
- User registration and login
- Secure password handling
- Session management

✅ **Bank Integration**
- Connect multiple bank accounts
- Real-time transaction sync
- Account balance monitoring

✅ **Portfolio Management**
- Track investments
- Performance analytics
- Asset allocation

✅ **Trading Interface**
- Market data display
- Order placement (mock)
- Real-time charts

✅ **Financial Analytics**
- Spending analysis
- Income tracking
- Savings rate calculation

✅ **Infrastructure Monitoring**
- System health checks
- Performance metrics
- Service status

✅ **Report Generation**
- Financial statements
- Portfolio summaries
- Tax documents

## 🚨 Troubleshooting

### Common Issues

1. **Plaid Connection Fails**
   - Check your Plaid credentials
   - Verify environment variables
   - Ensure you're using sandbox for testing

2. **Database Connection Errors**
   - Verify Supabase URL and keys
   - Check if tables are created
   - Ensure RLS policies are active

3. **Authentication Issues**
   - Check NextAuth configuration
   - Verify environment variables
   - Clear browser cookies

4. **Build Errors**
   - Run `npm install` again
   - Clear `.next` folder
   - Check TypeScript errors

### Getting Help

- Check the console for error messages
- Review the network tab in browser dev tools
- Verify all environment variables are set
- Check Supabase logs for database errors

## 🚀 Next Steps

1. **Customize the UI** to match your brand
2. **Add real market data** APIs (Alpha Vantage, IEX Cloud)
3. **Implement real trading** with broker APIs
4. **Add notifications** for important events
5. **Set up monitoring** and alerting
6. **Deploy to production** (Vercel, AWS, etc.)

## 📚 Additional Resources

- [Plaid Documentation](https://plaid.com/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth Documentation](https://next-auth.js.org/)
- [Next.js Documentation](https://nextjs.org/docs)

---

**🎉 Congratulations!** Your FinTech dashboard is now fully functional with real bank integrations, secure authentication, and comprehensive financial management capabilities.

