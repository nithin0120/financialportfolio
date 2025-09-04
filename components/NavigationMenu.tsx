'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Activity, 
  FileText,
  Menu,
  X
} from 'lucide-react'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview and key metrics'
  },
  {
    name: 'Portfolio',
    href: '/portfolio',
    icon: PieChart,
    description: 'Investment portfolio tracking'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Financial insights and trends'
  },
  {
    name: 'Trading',
    href: '/trading',
    icon: TrendingUp,
    description: 'Trading interface and tools'
  },
  {
    name: 'Infrastructure',
    href: '/infrastructure',
    icon: Activity,
    description: 'System monitoring and health'
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    description: 'Financial reports and documents'
  }
]

export default function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg bg-white shadow-lg border border-dark-200 hover:bg-dark-50 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-dark-600" />
          ) : (
            <Menu className="h-6 w-6 text-dark-600" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Navigation menu */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-xl border-r border-dark-200 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none lg:border-r-0
      `}>
        <div className="p-6">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dark-900">Financial Dashboard</h1>
            <p className="text-sm text-dark-600 mt-1">Financial Data Management</p>
          </div>

          {/* Navigation items */}
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                      : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                    }
                  `}
                >
                  <Icon className={`
                    h-5 w-5 transition-colors
                    ${isActive ? 'text-primary-600' : 'text-dark-500 group-hover:text-dark-700'}
                  `} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-dark-500 mt-0.5">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-dark-200">
            <div className="text-xs text-dark-500">
              <p>© 2024 Financial Dashboard</p>
              <p className="mt-1">Financial monitoring system</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content offset for desktop */}
      <div className="hidden lg:block w-80 flex-shrink-0" />
    </>
  )
}
