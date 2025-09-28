'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Share2, Edit3, Heart } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'
import UserDropdown from '@/components/user-dropdown'
import { authUtils } from '@/lib/auth'
import { duasAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface Dua {
  id: string
  title: string
  purpose?: string
  arabic_text?: string
  english_meaning?: string
  native_meaning?: string
  transliteration?: string
  source_reference?: string
  is_public: boolean
  is_verified: boolean
  created_at: string
  user_id?: string
  native_language?: string
  likes_count?: number
}

export default function DuaDetailPage() {
  const [dua, setDua] = useState<Dua | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const currentUser = authUtils.getCurrentUser()
    setUser(currentUser)
    
    if (params.id) {
      loadDua(params.id as string)
    }
  }, [params.id])

  const loadLikeStatus = async (duaId: string) => {
    if (!authUtils.isAuthenticated()) {
      setIsLiked(false)
      return
    }

    try {
      const response = await duasAPI.getDuaLikeStatus(duaId)
      setIsLiked(response.data.is_liked)
      setLikesCount(response.data.likes_count)
    } catch (error) {
      console.warn('Failed to load like status:', error)
      setIsLiked(false)
    }
  }

  const handleLike = async (duaId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (!authUtils.isAuthenticated()) {
      toast.error('Please sign in to like duas')
      return
    }
    
    try {
      if (isLiked) {
        const response = await duasAPI.unlikeDua(duaId)
        setIsLiked(false)
        setLikesCount(response.data.likes_count)
        toast.success('Removed from favorites')
      } else {
        const response = await duasAPI.likeDua(duaId)
        setIsLiked(true)
        setLikesCount(response.data.likes_count)
        toast.success('Added to favorites')
      }
    } catch (error: any) {
      console.error('Error updating like status:', error)
      toast.error(error.response?.data?.error || 'Failed to update like status')
    }
  }

  const loadDua = async (duaId: string) => {
    try {
      console.log('🔍 Debug Info:')
      console.log('- Loading dua with ID:', duaId)
      console.log('- User:', authUtils.getCurrentUser())
      console.log('- Auth Token:', authUtils.getToken() ? 'Present' : 'Missing')
      
      const response = await duasAPI.getDua(duaId)
      console.log('✅ Full response:', response)
      console.log('📊 Response data:', response.data)
      
      // Check for both possible response formats from backend
      const duaData = response.data?.dua || response.data;
      
      if (duaData && duaData.id) {
        console.log('✅ Found dua:', duaData)
        setDua(duaData)
        setLikesCount(duaData.likes_count || 0)
        
        // Load existing like status
        await loadLikeStatus(duaId)
      } else {
        console.error('❌ No valid dua data found in response:', response.data)
        toast.error('Dua not found or invalid data received')
      }
    } catch (error: any) {
      console.error('❌ Error loading dua:', error)
      console.error('❌ Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method
      })
      
      if (error.response?.status === 404) {
        toast.error('Dua not found. Please check the link and try again.')
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else if (error.response?.status === 401) {
        toast.error('You need to be logged in to view this dua.')
      } else {
        toast.error('Failed to load dua details. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
          <div className="spinner"></div>
        </div>
      </AuthGuard>
    )
  }

  if (!dua) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dua not found</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">The dua you are looking for doesn't exist</p>
            <Link href="/duas" className="btn-primary">Back to Duas</Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
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
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  Dashboard
                </Link>
                <Link href="/duas" className="text-primary-500 font-medium">
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
                <button className="p-2 rounded-lg bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                {user && <UserDropdown user={user} />}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Link href="/duas" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors mb-4">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Duas
              </Link>

              <div className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-8">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {dua.title}
                    </h1>
                    {dua.is_verified && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                        Verified
                      </span>
                    )}
                    {dua.user_id === user?.id && (
                      <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                        My Dua
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    {dua.user_id === user?.id && (
                      <Link
                        href={`/duas/${dua.id}/edit`}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors"
                      >
                        <Edit3 className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Purpose */}
                {dua.purpose && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Context</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {dua.purpose}
                    </p>
                  </div>
                )}

                {/* Arabic Text */}
                {dua.arabic_text && (
                  <div className="mb-6 bg-gray-50 dark:bg-dark-200 p-6 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Arabic Text</h3>
                    <div className="text-center text-2xl text-gray-900 dark:text-white arabic-font leading-loose">
                      {dua.arabic_text}
                    </div>
                  </div>
                )}

                {/* Transliteration */}
                {dua.transliteration && (
                  <div className="mb-6 bg-gray-50 dark:bg-dark-200 p-6 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Transliteration</h3>
                    <p className="text-gray-900 dark:text-white text-lg leading-relaxed font-mono">
                      {dua.transliteration}
                    </p>
                  </div>
                )}

                {/* Meaning (Native Language First) */}
                {(dua.native_meaning || dua.english_meaning) && (
                  <div className="mb-6 bg-gray-50 dark:bg-dark-200 p-6 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Meaning</h3>
                    {dua.native_meaning && (
                      <div className="mb-4">
                        <p className="text-gray-900 dark:text-white text-lg leading-relaxed">
                          {dua.native_meaning}
                        </p>
                        {user?.native_language && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            In {user.native_language}
                          </p>
                        )}
                      </div>
                    )}
                    {dua.english_meaning && (
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {dua.english_meaning}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">English translation</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Source Reference */}
                {dua.source_reference && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Source Reference</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {dua.source_reference}
                    </p>
                  </div>
                )}

                {/* Footer Info */}
                <div className="border-t border-gray-200 dark:border-dark-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Created {new Date(dua.created_at).toLocaleDateString()}</span>
                      {dua.is_public ? (
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Public
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                          Private
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={(e) => handleLike(dua.id, e)}
                        className="flex items-center space-x-1 hover:scale-105 transition-transform"
                        title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            isLiked 
                              ? 'text-red-500 fill-current' 
                              : 'text-gray-400 hover:text-red-500'
                          }`} 
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {likesCount}
                        </span>
                      </button>
                    </div>
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
