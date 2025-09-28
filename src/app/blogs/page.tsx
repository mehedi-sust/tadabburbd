'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Plus, Search, Heart, Eye, Calendar } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'
import UserDropdown from '@/components/user-dropdown'
import MobileNav from '@/components/MobileNav'
import { authUtils } from '@/lib/auth'
import { blogsAPI } from '@/lib/api'

interface Blog {
  id: string
  title: string
  excerpt?: string
  author_name: string
  created_at: string
  view_count: number
  is_published: boolean
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadBlogs()
    const currentUser = authUtils.getCurrentUser()
    setUser(currentUser)
  }, [])

  const loadBlogs = async () => {
    try {
      const response = await blogsAPI.getBlogs()
      setBlogs(response.data.blogs || [])
    } catch (error) {
      console.error('Error loading blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
        {/* Header */}
        <header className="bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-dark-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <img src="/logo/taddabbur_logo.png" alt="Tadabbur" className="w-8 h-8 object-contain" />
                  <span className="text-xl font-bold gradient-text">Tadabbur</span>
                </Link>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  Dashboard
                </Link>
                <Link href="/duas" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  Duas
                </Link>
                <Link href="/blogs" className="text-primary-500 font-medium">
                  Blogs
                </Link>
                <Link href="/questions" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  Q&A
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <button className="hidden md:block p-2 rounded-lg bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                {user && <UserDropdown user={user} />}
                <MobileNav />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Islamic Blogs</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Read inspiring articles and insights from the Islamic community
                </p>
              </div>
              <Link href="/blogs/new" className="btn-primary flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Write Blog</span>
              </Link>
            </div>

            {/* Search */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
              </div>
            )}

            {/* Blogs Grid */}
            {!loading && filteredBlogs.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No blogs found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to share your insights with the community</p>
                <Link href="/blogs/new" className="btn-primary">
                  Write First Blog
                </Link>
              </div>
            )}

            {!loading && filteredBlogs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-100 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 card"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {blog.title}
                        </h3>
                        {!blog.is_published && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Draft
                          </span>
                        )}
                      </div>

                      {blog.excerpt && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                          {blog.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {blog.author_name}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(blog.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{blog.view_count}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-dark-200 px-6 py-3 bg-gray-50 dark:bg-dark-200">
                      <div className="flex items-center justify-between">
                        <Link 
                          href={`/blogs/${blog.id}`} 
                          className="text-primary-500 hover:text-primary-600 font-medium text-sm"
                        >
                          Read Full Article
                        </Link>
                        <div className="flex space-x-2">
                          <Link 
                            href={`/blogs/${blog.id}/edit`}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
    </AuthGuard>
  )
}
