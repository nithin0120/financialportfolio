# Financial Dashboard

A comprehensive financial data dashboard built with Next.js, featuring portfolio monitoring, bank account integration via Plaid, and dynamic analytics.

## Features

- **Authentication**: Secure user registration and login with NextAuth.js
- **Bank Integration**: Connect bank accounts using Plaid API
- **Portfolio Tracking**: Portfolio performance and asset allocation
- **Financial Analytics**: Spending analysis, income tracking, and investment insights
- **Infrastructure Monitoring**: System health and performance metrics
- **Dynamic Reports**: Generate and download financial reports
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with JWT
- **Database**: Supabase (PostgreSQL)
- **Bank Integration**: Plaid API
- **Charts**: Recharts
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Plaid account (for bank integration)

### Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/financial-dashboard.git
cd financial-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
   - Supabase URL and service role key
   - Plaid client ID and secret
   - NextAuth configuration

5. Set up the database (see SUPABASE_SETUP.md)

6. Run the development server
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── analytics/         # Analytics dashboard
│   ├── portfolio/         # Portfolio tracking
│   ├── trading/           # Trading interface
│   ├── infrastructure/    # System monitoring
│   └── reports/           # Financial reports
├── components/            # Reusable React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
└── public/                # Static assets
```

## Documentation

- [Authentication Setup](AUTH_SETUP.md)
- [Supabase Setup](SUPABASE_SETUP.md)
- [General Setup](SETUP.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.