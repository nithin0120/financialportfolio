# Supabase Setup Guide

This guide will help you set up Supabase as the backend for your FinTech Data Infrastructure Dashboard.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `fintech-dashboard` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users
6. Click "Create new project"
7. Wait for the project to be created (this may take a few minutes)

## 2. Get Your Project Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## 3. Update Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 4. Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run the following SQL commands:

### Users Table
```sql
-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### Accounts Table
```sql
-- Create accounts table for bank account information
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plaid_account_id VARCHAR(255) UNIQUE NOT NULL,
  plaid_access_token TEXT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  subtype VARCHAR(100),
  balance DECIMAL(15,2) DEFAULT 0,
  currency_code VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_plaid_account_id ON accounts(plaid_account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_plaid_access_token ON accounts(plaid_access_token);
```

### Transactions Table
```sql
-- Create transactions table for bank transaction data
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  plaid_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency_code VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  category TEXT[],
  date DATE NOT NULL,
  pending BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_plaid_transaction_id ON transactions(plaid_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
```

### Portfolios Table (for future investment tracking)
```sql
-- Create portfolios table for investment portfolio data
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  total_value DECIMAL(15,2) DEFAULT 0,
  currency_code VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
```

### Holdings Table (for future investment holdings)
```sql
-- Create holdings table for individual investment holdings
CREATE TABLE IF NOT EXISTS holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  shares DECIMAL(15,6) NOT NULL,
  avg_price DECIMAL(15,2) NOT NULL,
  current_price DECIMAL(15,2),
  market_value DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_holdings_symbol ON holdings(symbol);
```

## 5. Set Up Row Level Security (RLS)

Enable RLS and create policies to secure your data:

### Enable RLS
```sql
-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policies

#### Users Table Policies
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);
```

#### Accounts Table Policies
```sql
-- Users can only see their own accounts
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE USING (auth.uid()::text = user_id::text);
```

#### Transactions Table Policies
```sql
-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid()::text = user_id::text);
```

#### Portfolios Table Policies
```sql
-- Users can only see their own portfolios
CREATE POLICY "Users can view own portfolios" ON portfolios
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own portfolios" ON portfolios
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own portfolios" ON portfolios
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own portfolios" ON portfolios
  FOR DELETE USING (auth.uid()::text = user_id::text);
```

#### Holdings Table Policies
```sql
-- Users can only see holdings from their own portfolios
CREATE POLICY "Users can view own holdings" ON holdings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = holdings.portfolio_id 
      AND portfolios.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own holdings" ON holdings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = holdings.portfolio_id 
      AND portfolios.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own holdings" ON holdings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = holdings.portfolio_id 
      AND portfolios.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own holdings" ON holdings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = holdings.portfolio_id 
      AND portfolios.user_id::text = auth.uid()::text
    )
  );
```

## 6. Create Functions for Timestamps

Create functions to automatically update timestamps:

```sql
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 7. Test Your Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see all the tables you created:
   - `users`
   - `accounts`
   - `transactions`
   - `portfolios`
   - `holdings`

3. Test the API by going to **Settings** → **API** and using the API documentation

## 8. Optional: Set Up Database Backups

1. Go to **Settings** → **Database**
2. Enable **Point-in-time Recovery** for automatic backups
3. Set up **Scheduled Backups** if needed

## 9. Environment Variables Summary

Make sure your `.env.local` file contains:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Plaid Configuration
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENV=sandbox
```

## 10. Troubleshooting

### Common Issues:

1. **RLS Policies Not Working**: Make sure you've enabled RLS and created the correct policies
2. **Connection Issues**: Verify your environment variables are correct
3. **Permission Errors**: Check that your service role key has the right permissions
4. **Table Not Found**: Ensure you've run all the SQL commands in the correct order

### Getting Help:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the [Supabase Community](https://github.com/supabase/supabase/discussions)
- Check the [Next.js Supabase Integration Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## Next Steps

Once your Supabase setup is complete:

1. Test the authentication flow
2. Connect your first bank account via Plaid
3. Verify that transactions are being stored correctly
4. Check that the dashboard displays real data

Your FinTech dashboard backend is now ready! 

