'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  ChevronDown,
  Shield,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { authUtils } from '@/lib/auth'

interface UserDropdownProps {
  user: {
    name: string
    role: string
  }
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    authUtils.logout()
    router.push('/')
    setIsOpen(false)
  }

  const toggleTheme = () => {
    if (mounted) {
      const newTheme = theme === 'dark' ? 'light' : 'dark'
      setTheme(newTheme)
    }
    setIsOpen(false)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-300 rounded-lg px-3 py-2 transition-colors duration-200"
      >
        <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {user.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-100 rounded-lg shadow-lg border border-gray-200 dark:border-dark-200 z-50"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              {/* Settings */}
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>

              {/* Admin Panel - only for admins and managers */}
              {authUtils.isAdminOrManager() && (
                <Link
                  href="/admin/users"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Expert Panel - for scholars and above */}
              {authUtils.isScholarOrAbove() && (
                <Link
                  href="/admin/duas"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Dua Approval Panel</span>
                </Link>
              )}

              {/* Profile */}
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>

              {/* Divider */}
              <div className="my-1 border-t border-gray-200 dark:border-dark-200"></div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
