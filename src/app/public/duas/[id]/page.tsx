'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Share2, Heart } from 'lucide-react'
import { duasAPI } from '@/lib/api'
import { authUtils } from '@/lib/auth'
import toast from 'react-hot-toast'

interface PublicDua {
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
  likes_count?: number
}

export default function PublicDuaDetailPage() {
  const [dua, setDua] = useState<PublicDua | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const params = useParams()

  useEffect(() => {
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
      console.log('Loading public dua with ID:', duaId)
      const response = await duasAPI.getDua(duaId)
      console.log('Public dua response:', response.data)
      
      // Check for both possible response formats from backend
      const duaData = response.data?.dua || response.data;
      
      if (duaData && duaData.id) {
        setDua(duaData)
        setLikesCount(duaData.likes_count || 0)
        await loadLikeStatus(duaId)
      } else {
        toast.error('Dua not found or data is invalid')
      }
    } catch (error: any) {
      console.error('Error loading dua:', error)
      toast.error(error.response?.data?.message || 'Failed to load dua details')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!dua) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dua not found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The dua you are looking for doesn't exist or is not public</p>
          <Link href="/public/duas" className="btn-primary">Back to Duas</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
      {/* Header */}
      <header className="bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link href="/public/duas" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
              <img src="/logo/taddabbur_logo.png" alt="Tadabbur" className="w-8 h-8 ml-4" />
              <span className="text-xl font-bold gradient-text ml-2">Tadabbur</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <Link href="/auth/login" className="btn-primary">Sign In</Link>
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
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
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

              {/* Meaning */}
              {(dua.native_meaning || dua.english_meaning) && (
                <div className="mb-6 bg-gray-50 dark:bg-dark-200 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Meaning</h3>
                  {dua.native_meaning && (
                    <div className="mb-4">
                      <p className="text-gray-900 dark:text-white text-lg leading-relaxed">
                        {dua.native_meaning}
                      </p>
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
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Public
                    </span>
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
    </div>
  )
}
