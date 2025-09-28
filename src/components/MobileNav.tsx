'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Moon, Sun, Bell, User, Settings, LogOut, Shield, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { authUtils } from '@/lib/auth'
import NotificationDropdown from './NotificationDropdown'

interface MobileNavProps {
  className?: string
}

export default function MobileNav({ className = '' }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { theme, setTheme } = useTheme()
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const currentUser = authUtils.getCurrentUser()
    setUser(currentUser)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const handleLogout = () => {
    authUtils.logout()
    closeMenu()
    window.location.href = '/'
  }

  const isAuthenticated = authUtils.isAuthenticated()

  return (
    <div className={`relative z-[90] ${className}`} ref={navRef}>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors relative z-[90]"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-[70] md:hidden"
              onClick={closeMenu}
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-dark-100 shadow-2xl z-[80] md:hidden border-l border-gray-200 dark:border-dark-200"
              style={{ 
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                opacity: 1
              }}
            >
              <div className="flex flex-col h-full bg-white dark:bg-dark-100 relative" style={{ 
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                opacity: 1
              }}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-200">
                  <div className="flex items-center space-x-2">
                    <img src="/logo/taddabbur_logo.png" alt="Tadabbur" className="w-8 h-8 object-contain" />
                    <span className="text-xl font-bold gradient-text">Tadabbur</span>
                  </div>
                  <button
                    onClick={closeMenu}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                {/* User Info (if authenticated) */}
                {isAuthenticated && user && (
                  <div className="px-4 py-4 border-b border-gray-200 dark:border-dark-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6">
                  <div className="space-y-4">
                    {isAuthenticated ? (
                      // Logged-in user navigation
                      <>
                        <Link
                          href="/dashboard"
                          onClick={closeMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
                        >
                          <span className="text-lg font-medium">Dashboard</span>
                        </Link>
                        <Link
                          href="/duas"
                          onClick={closeMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
                        >
                          <span className="text-lg font-medium">Duas</span>
                        </Link>
                        <Link
                          href="/blogs"
                          onClick={closeMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
                        >
                          <span className="text-lg font-medium">Blogs</span>
                        </Link>
                        <Link
                          href="/questions"
                          onClick={closeMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
                        >
                          <span className="text-lg font-medium">Q&A</span>
                        </Link>
                        <Link
                          href="/notifications"
                          onClick={closeMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
                        >
                          <Bell className="w-5 h-5" />
                          <span className="text-lg font-medium">Notifications</span>
                        </Link>
                        {authUtils.isScholarOrAbove() && (
                          <Link
                            href="/approval"
                            onClick={closeMenu}
                            className="flex items-center space-x-3 px-4 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <BookOpen className="w-5 h-5" />
                            <span className="text-lg font-medium">Approval Panel</span>
                          </Link>
                        )}
                        {authUtils.isAdminOrManager() && (
                          <Link
                            href="/admin/users"
                            onClick={closeMenu}
                            className="flex items-center space-x-3 px-4 py-3 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          >
                            <Shield className="w-5 h-5" />
                            <span className="text-lg font-medium">Admin Panel</span>
                          </Link>
                        )}
                      </>
                    ) : (
                      // Public navigation
                      <>
                        <Link
                          href="/public/duas"
                          onClick={closeMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
                        >
                          <span className="text-lg font-medium">Duas</span>
                        </Link>
                        <Link
                          href="/public/blogs"
                          onClick={closeMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
                        >
                          <span className="text-lg font-medium">Blogs</span>
                        </Link>
                        <Link
                          href="/auth/login"
                          onClick={closeMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
                        >
                          <span className="text-lg font-medium">Q&A</span>
                        </Link>
                      </>
                    )}
                  </div>
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-dark-200 space-y-4">
                  {/* Theme Toggle */}
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
                    disabled={!mounted}
                  >
                    {mounted && theme === 'dark' ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                    <span className="text-lg font-medium">
                      {mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </button>

                  {/* Auth Actions */}
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/settings"
                        onClick={closeMenu}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                        <span className="text-lg font-medium">Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-lg font-medium">Logout</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={closeMenu}
                      className="w-full btn-primary text-center block"
                    >
                      Get Started
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
