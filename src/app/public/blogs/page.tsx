'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Search, User, Calendar, ArrowLeft, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { blogsAPI } from '@/lib/api'

interface PublicBlog {
  id: string
  title: string
  content: string
  excerpt?: string
  author_name: string
  created_at: string
  view_count: number
  is_published: boolean
}

export default function PublicBlogsPage() {
  const [blogs, setBlogs] = useState<PublicBlog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    loadPublicBlogs()
  }, [])

  const loadPublicBlogs = async () => {
    try {
      const response = await blogsAPI.getBlogs()
      setBlogs(response.data.blogs || [])
    } catch (error) {
      console.error('Error loading public blogs:', error)
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
      {/* Header */}
      <header className="bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link href="/">
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </Link>
              <img src="/logo/taddabbur_logo.png" alt="Tadabbur" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold gradient-text">Tadabbur</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/public/duas" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                Duas
              </Link>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors"
                disabled={!mounted}
              >
                {mounted && theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-900 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-900 dark:text-gray-300" />
                )}
              </button>
              <Link href="/auth/login" className="btn-primary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Islamic Blog</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Read inspiring Islamic articles and reflections
              </p>
            </div>
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
              <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to explore these blogs</p>
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
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {blog.title}
                      </h3>
                    </div>

                    {blog.excerpt && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {blog.author_name}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="flex items-center">
                        {blog.view_count} views
                      </span>
                    </div>

                    <Link 
                      href={`/public/blogs/${blog.id}`}
                      className="text-primary-500 hover:text-primary-600 font-medium text-sm"
                    >
                      Read More
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
