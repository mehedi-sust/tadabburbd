'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import MobileNav from './MobileNav'

interface PublicNavbarProps {
  showBackButton?: boolean
  backHref?: string
  className?: string
}

export default function PublicNavbar({ 
  showBackButton = false, 
  backHref = '/',
  className = '' 
}: PublicNavbarProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className={`bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-dark-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            {showBackButton ? (
              <Link href={backHref}>
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            ) : null}
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo/taddabbur_logo.png" alt="Tadabbur" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold gradient-text">Tadabbur</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/public/duas" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
              Duas
            </Link>
            <Link href="/public/blogs" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
              Blogs
            </Link>
            <Link href="/auth/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
              Q&A
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden md:block p-2 rounded-lg bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors"
              disabled={!mounted}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-900 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-900 dark:text-gray-300" />
              )}
            </button>
            
            {/* Sign In Button */}
            <Link href="/auth/login" className="hidden md:block btn-primary">
              Sign In
            </Link>
            
            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}
