'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { authUtils } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/auth-guard'
import UserDropdown from '@/components/user-dropdown'
import NotificationDropdown from '@/components/NotificationDropdown'
import MobileNav from '@/components/MobileNav'
import { 
  BookOpen, 
  Plus, 
  TrendingUp, 
  Users, 
  Heart, 
  Moon,
  Search,
  User,
  Star,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { duasAPI } from '@/lib/api'

interface DuaItem {
  id: string
  title: string
  purpose?: string
  is_public: boolean
  is_verified: boolean
  created_at: string
}

interface DashboardStats {
  totalDuas: number
  publicDuas: number
  privateDuas: number
  recentDuas: DuaItem[]
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalDuas: 0,
    publicDuas: 0,
    privateDuas: 0,
    recentDuas: []
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    const currentUser = authUtils.getCurrentUser()
    setUser(currentUser)
    loadDashboardData()
  }, [router])

  const loadDashboardData = async () => {
    try {
      const response = await duasAPI.getMyDuas({ limit: 4, sortBy: 'created_at', order: 'desc' })
      const duas: DuaItem[] = response.data.duas || []
      
      setStats({
        totalDuas: duas.length * 3, // Mock multiplier for demo
        publicDuas: duas.filter((d: DuaItem) => d.is_public).length * 2,
        privateDuas: duas.filter((d: DuaItem) => !d.is_public).length * 2,
        recentDuas: duas
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AuthGuard minimumRole="user">
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
        {/* Header */}
        <header className="bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-dark-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <img src="/logo/taddabbur_logo.png" alt="Tadabbur" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold gradient-text">Tadabbur</span>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-primary-500 font-medium">
                  Dashboard
                </Link>
                <Link href="/duas" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  Duas
                </Link>
                <Link href="/blogs" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  Blogs
                </Link>
                <Link href="/questions" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  Q&A
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <NotificationDropdown />
                <UserDropdown user={user} />
                <MobileNav />
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              Welcome back, {user.name}! 🌿
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-lg text-gray-600 dark:text-gray-300"
            >
              Ready to continue your spiritual journey?
            </motion.p>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-primary-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Duas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDuas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-accent-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Public Duas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publicDuas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Private Duas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.privateDuas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Verified</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDuas > 0 ? Math.floor(stats.totalDuas * 0.3) : 0}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          >
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Duas
                </h3>
                {stats.recentDuas.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentDuas.map((dua, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{dua.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{dua.purpose || 'No description'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {dua.is_verified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Verified
                            </span>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(dua.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No duas yet</p>
                    <Link href="/duas/new" className="btn-primary">
                      Create Your First Dua
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link href="/duas/new" className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors">
                    <Plus className="w-5 h-5 text-primary-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Add New Dua</span>
                  </Link>
                  <Link href="/blogs/new" className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors">
                    <Plus className="w-5 h-5 text-accent-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Write Blog</span>
                  </Link>
                  <Link href="/questions/new" className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors">
                    <Plus className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Ask Question</span>
                  </Link>
                  <Link href="/collections" className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">My Collections</span>
                  </Link>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Today's Tip
                </h3>
                <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900 dark:to-accent-900 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Start your day with morning duas for blessed beginnings, and end it with evening duas for protection and gratitude. Each dua is a connection to Allah SWT.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-dark-50 text-white py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo/taddabbur_logo.png" alt="Tadabbur" className="w-12 h-12 object-contain" />
                <span className="text-xl font-bold">Tadabbur</span>
              </div>
              <p className="text-gray-400">
                Your trusted companion for Islamic spiritual growth and authentic religious content.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/duas" className="text-gray-400 hover:text-white transition-colors">My Duas</Link></li>
                <li><Link href="/blogs" className="text-gray-400 hover:text-white transition-colors">My Blogs</Link></li>
                <li><Link href="/questions" className="text-gray-400 hover:text-white transition-colors">Q&A</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Public Content</h3>
              <ul className="space-y-2">
                <li><Link href="/public/duas" className="text-gray-400 hover:text-white transition-colors">Public Duas</Link></li>
                <li><Link href="/public/blogs" className="text-gray-400 hover:text-white transition-colors">Public Blogs</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tadabbur. All rights reserved. Made with ❤️ for the Muslim community.</p>
            <div className="mt-4">
              <a 
                href="mailto:mehedialhasan@gmail.com"
                className="text-sm font-medium text-gray-300 hover:text-gray-200 transition-colors"
                style={{ fontFamily: 'Amiri, serif' }}
              >
                Developed by Mehedi Al Hasan
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </AuthGuard>
  )
}
