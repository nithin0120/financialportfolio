import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import NavigationMenu from '@/components/NavigationMenu'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Financial Data Dashboard',
  description: 'Financial data dashboard for monitoring and portfolio management',
  keywords: ['financial', 'dashboard', 'portfolio', 'data', 'management'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <div className="min-h-screen">
            <NavigationMenu />
            <main className="lg:ml-64">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
