'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut, signIn } from 'next-auth/react'
import { Search, Bell, User, Menu, Settings, Shield, LogOut, Key, CreditCard, HelpCircle, ChevronDown, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HeaderProps {
  onMenuToggle: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { data: session, status } = useSession()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  const handleSignIn = () => {
    signIn('credentials', { callbackUrl: '/' })
  }

  const profileMenuItems = [
    {
      icon: User,
      label: 'Profile',
      description: 'View and edit your profile',
      onClick: () => {
        setIsProfileOpen(false)
        // TODO: Navigate to profile page
        alert('Profile page coming soon!')
      }
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Account preferences',
      onClick: () => {
        setIsProfileOpen(false)
        // TODO: Navigate to settings page
        alert('Settings page coming soon!')
      }
    },
    {
      icon: Shield,
      label: 'Security',
      description: 'Password and security settings',
      onClick: () => {
        setIsProfileOpen(false)
        // TODO: Navigate to security page
        alert('Security settings coming soon!')
      }
    },
    {
      icon: Key,
      label: 'API Keys',
      description: 'Manage your API access',
      onClick: () => {
        setIsProfileOpen(false)
        // TODO: Navigate to API keys page
        alert('API Keys management coming soon!')
      }
    },
    {
      icon: CreditCard,
      label: 'Billing',
      description: 'Subscription and payments',
      onClick: () => {
        setIsProfileOpen(false)
        // TODO: Navigate to billing page
        alert('Billing page coming soon!')
      }
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help and contact support',
      onClick: () => {
        setIsProfileOpen(false)
        // TODO: Navigate to help page
        alert('Help & Support coming soon!')
      }
    }
  ]

  const notifications = [
    {
      id: 1,
      title: 'New transaction detected',
      message: 'A new transaction of $150.00 was added to your checking account',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      title: 'Account balance low',
      message: 'Your savings account balance is below $100',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      title: 'Monthly report ready',
      message: 'Your monthly financial report is now available',
      time: '3 hours ago',
      unread: false
    }
  ]

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-black/20 backdrop-blur-xl border-b border-white/20 z-40">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left side - Menu button for mobile */}
        <div className="flex items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5 text-white" />
          </motion.button>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white/60" />
            </div>
            <input
              type="text"
              placeholder="Search transactions, accounts..."
              className="block w-full pl-10 pr-3 py-2 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center space-x-3">
          {status === 'authenticated' ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-white" />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-lg shadow-2xl z-50"
                    >
                      <div className="p-4 border-b border-slate-600/30">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-slate-600/20 hover:bg-slate-700/30 transition-colors duration-200 ${
                              notification.unread ? 'bg-slate-700/20' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.unread ? 'bg-blue-400' : 'bg-transparent'
                              }`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white">{notification.title}</p>
                                <p className="text-xs text-white/70 mt-1">{notification.message}</p>
                                <p className="text-xs text-white/50 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-slate-600/30">
                        <button className="w-full text-xs text-white/70 hover:text-white transition-colors duration-200">
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                  aria-label="User profile"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-white/60">Dashboard</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-white/60 transition-transform duration-200 ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`} />
                </motion.button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-lg shadow-2xl z-50"
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-slate-600/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-700/60 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {session?.user?.name || 'User'}
                            </p>
                            <p className="text-xs text-white/60">
                              {session?.user?.email || 'user@example.com'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {profileMenuItems.map((item, index) => (
                          <motion.button
                            key={item.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                                                    onClick={item.onClick}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-700/40 transition-colors duration-200"
                          >
                            <item.icon className="h-4 w-4 text-white/70" />
                            <div>
                              <p className="text-sm font-medium text-white">{item.label}</p>
                              <p className="text-xs text-white/60">{item.description}</p>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                                        {/* Sign Out */}
                  <div className="border-t border-slate-600/30 p-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-500/20 transition-colors duration-200 rounded-lg"
                        >
                          <LogOut className="h-4 w-4 text-red-400" />
                          <div>
                            <p className="text-sm font-medium text-red-400">Sign Out</p>
                            <p className="text-xs text-red-400/60">Log out of your account</p>
                          </div>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Sign In Button */
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignIn}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              <LogIn className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Sign In</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  )
}