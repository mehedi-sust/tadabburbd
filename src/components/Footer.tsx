'use client'

import Link from 'next/link'

interface FooterProps {
  variant?: 'default' | 'dark' | 'light'
  className?: string
}

export default function Footer({ variant = 'default', className = '' }: FooterProps) {
  const isDark = variant === 'dark'
  const isLight = variant === 'light'
  
  const bgClass = isDark 
    ? 'bg-gray-900 dark:bg-dark-50' 
    : isLight 
    ? 'bg-white dark:bg-dark-200' 
    : 'bg-white dark:bg-dark-200'
    
  const textClass = isDark 
    ? 'text-white' 
    : 'text-gray-900 dark:text-white'
    
  const borderClass = isDark 
    ? 'border-gray-800' 
    : 'border-gray-200 dark:border-dark-300'

  return (
    <footer className={`${bgClass} border-t ${borderClass} mt-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/logo/taddabbur_logo.png" 
              alt="Tadabbur" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h3 className={`text-xl font-bold ${textClass}`}>Tadabbur</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                Islamic Content Platform
              </p>
            </div>
          </div>
          
          <div className={`border-t ${borderClass} pt-6`}>
            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
              Developed with ❤️ for the Muslim community
            </p>
            <a 
              href="mailto:mehedialhasan@gmail.com"
              className={`text-sm font-medium ${isDark ? 'text-gray-300 hover:text-gray-200' : 'text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-300'} transition-colors`}
              style={{ fontFamily: 'Amiri, serif' }}
            >
              Developed by Mehedi Al Hasan
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
