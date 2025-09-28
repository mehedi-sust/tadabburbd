'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowLeft, Calendar, User, Eye, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { blogsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import PublicNavbar from '@/components/PublicNavbar'

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

export default function PublicBlogDetailPage() {
  const [blog, setBlog] = useState<PublicBlog | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const params = useParams()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (params.id) {
      loadBlog(params.id as string)
    }
  }, [params.id])

  const loadBlog = async (blogId: string) => {
    try {
      setLoading(true)
      const response = await blogsAPI.getBlog(blogId)
      setBlog(response.data.blog)
    } catch (error) {
      console.error('Error loading blog:', error)
      toast.error('Failed to load blog')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading blog...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <BookOpen className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Blog Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The blog you're looking for doesn't exist or has been removed.</p>
            <Link href="/public/blogs" className="btn-primary">
              Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
      {/* Header */}
      <PublicNavbar showBackButton={true} backHref="/public/blogs" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-100 rounded-lg shadow-lg overflow-hidden"
        >
          {/* Blog Header */}
          <div className="px-6 py-8 border-b border-gray-200 dark:border-dark-200">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {blog.title}
            </h1>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{blog.author_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{blog.view_count} views</span>
              </div>
            </div>
          </div>

          {/* Blog Content */}
          <div className="px-6 py-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div 
                className="text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
          </div>

          {/* Blog Footer */}
          <div className="px-6 py-6 bg-gray-50 dark:bg-dark-200 border-t border-gray-200 dark:border-dark-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/public/blogs" 
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  ← Back to Blogs
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/public/duas" 
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  Explore Duas →
                </Link>
              </div>
            </div>
          </div>
        </motion.article>
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
                <li><Link href="/public/duas" className="text-gray-400 hover:text-white transition-colors">Public Duas</Link></li>
                <li><Link href="/public/blogs" className="text-gray-400 hover:text-white transition-colors">Islamic Blogs</Link></li>
                <li><Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Authentic Duas</li>
                <li className="text-gray-400">Islamic Articles</li>
                <li className="text-gray-400">Community Sharing</li>
                <li className="text-gray-400">Expert Verification</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Help Center</li>
                <li className="text-gray-400">Contact Us</li>
                <li className="text-gray-400">Privacy Policy</li>
                <li className="text-gray-400">Terms of Service</li>
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
  )
}
