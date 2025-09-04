'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
import Header from './Header'

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
      <Header onMenuToggle={toggleMenu} />

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation menu */}
      <motion.div 
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="lg:hidden fixed top-0 left-0 h-full w-64 bg-black/20 backdrop-blur-xl shadow-2xl border-r border-white/20 z-50">
        <div className="p-4 sm:p-6">
          {/* Logo/Title */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-xl sm:text-2xl 2xl:text-3xl 3xl:text-4xl font-bold text-white drop-shadow-lg">Financial Dashboard</h1>
            <p className="text-xs sm:text-sm 2xl:text-base 3xl:text-lg text-white/80 mt-1 drop-shadow-md">Financial Data Management</p>
          </motion.div>

          {/* Navigation items */}
          <nav className="space-y-2">
            {navigationItems.map((item, index) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                      ${isActive 
                        ? 'bg-white/20 text-white shadow-lg border border-white/30' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20'
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    
                    {/* Hover effect background */}
                    <motion.div
                      className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      whileHover={{ scale: 1.02 }}
                    />
                    
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className={`
                        h-5 w-5 transition-all duration-200 relative z-10
                        ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}
                      `} />
                    </motion.div>
                    
                    <div className="flex-1 relative z-10">
                      <motion.div 
                        className="font-medium"
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.div>
                      <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-200 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                    
                    {isActive && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full relative z-10"
                      />
                    )}
                  </Link>
                </motion.div>
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
      </motion.div>

      {/* Desktop Navigation menu */}
      <div className="hidden lg:block fixed top-0 left-0 h-full w-64 bg-black/20 backdrop-blur-xl shadow-2xl border-r border-white/20 z-50">
        <div className="p-4 sm:p-6">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-xl sm:text-2xl 2xl:text-3xl 3xl:text-4xl font-bold text-white drop-shadow-lg">Financial Dashboard</h1>
            <p className="text-xs sm:text-sm 2xl:text-base 3xl:text-lg text-white/80 mt-1 drop-shadow-md">Financial Data Management</p>
          </div>

          {/* Navigation items */}
          <nav className="space-y-2">
            {navigationItems.map((item, index) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-white/20 text-white shadow-lg border border-white/30' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`
                      p-2 rounded-lg transition-all duration-200
                      ${isActive ? 'bg-white/30' : 'bg-white/10 group-hover:bg-white/20'}
                    `}>
                      <Icon className={`
                        h-5 w-5 transition-colors duration-200
                        ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}
                      `} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`
                        font-medium transition-colors duration-200
                        ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}
                      `}>
                        {item.name}
                      </p>
                      <p className={`
                        text-xs transition-colors duration-200
                        ${isActive ? 'text-white/60' : 'text-white/60 group-hover:text-white/80'}
                      `}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full relative z-10" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="text-xs text-white/60">
              <p>© 2024 Financial Dashboard</p>
              <p className="mt-1">Financial monitoring system</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content offset for desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  )
}
