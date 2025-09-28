'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Search, Eye, CheckCircle2, XCircle, ArrowLeft, Moon, Sun, Heart } from 'lucide-react'
import { useTheme } from 'next-themes'
import { duasAPI } from '@/lib/api'
import PublicNavbar from '@/components/PublicNavbar'

interface PublicDua {
  id: string
  title: string
  purpose?: string
  arabic_text?: string
  english_meaning?: string
  native_meaning?: string
  is_public: boolean
  is_verified: boolean
  created_at: string
  likes_count?: number
}

export default function PublicDuasPage() {
  const [duas, setDuas] = useState<PublicDua[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [likedDuas, setLikedDuas] = useState<Set<string>>(new Set())
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    loadPublicDuas()
  }, [])

  const loadPublicDuas = async () => {
    try {
      const response = await duasAPI.getDuas()
      setDuas(response.data.duas || [])
    } catch (error) {
      console.error('Error loading public duas:', error)
      setDuas([])
    } finally {
      setLoading(false)
    }
  }

  const handleLike = (duaId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    const isCurrentlyLiked = likedDuas.has(duaId)
    const newLikedDuas = new Set(likedDuas)
    
    if (isCurrentlyLiked) {
      newLikedDuas.delete(duaId)
    } else {
      newLikedDuas.add(duaId)
    }
    
    setLikedDuas(newLikedDuas)
    console.log(isCurrentlyLiked ? 'Unliked' : 'Liked', 'dua:', duaId)
  }

  const filteredDuas = duas.filter(dua =>
    dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dua.purpose && dua.purpose.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
      {/* Header */}
      <PublicNavbar showBackButton={true} backHref="/" />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Islamic Duas</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Explore authentic duas from our community
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search duas..."
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

          {/* Duas Grid */}
          {!loading && filteredDuas.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No duas found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to explore these duas</p>
            </div>
          )}

          {!loading && filteredDuas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDuas.map((dua) => (
                <motion.div
                  key={dua.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-dark-100 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 card flex flex-col h-full"
                >
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {dua.title}
                          </h3>
                          {/* Visible verification status */}
                          {dua.is_verified ? (
                            <div className="flex items-center space-x-1">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                Verified
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <XCircle className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Pending
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-green-500" />
                        </div>
                      </div>

                      {dua.purpose && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                          {dua.purpose}
                        </p>
                      )}

                      {dua.arabic_text && (
                        <div className="mb-4 relative overflow-hidden py-4 min-h-[3rem]">
                          {dua.arabic_text.length > 80 ? (
                            <div className="scrolling-text text-center text-3xl text-gray-900 dark:text-white arabic-font px-3">
                              {dua.arabic_text}
                            </div>
                          ) : (
                            <div className="text-center text-3xl text-gray-900 dark:text-white arabic-font py-2">
                              {dua.arabic_text}
                            </div>
                          )}
                        </div>
                      )}

                      {(dua.native_meaning || dua.english_meaning) && (
                        <div className="mb-4">
                          <p className="text-gray-600 dark:text-gray-300 text-base line-clamp-2">
                            {dua.native_meaning || dua.english_meaning}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Fixed Footer */}
                    <div className="mt-auto border-t border-gray-200 dark:border-dark-200 px-6 py-3 bg-gray-50 dark:bg-dark-200">
                      {/* Status and Author Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            dua.is_verified 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {dua.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => handleLike(dua.id, e)}
                            className="flex items-center space-x-1 hover:scale-105 transition-transform"
                          >
                            <Heart 
                              className={`w-4 h-4 ${
                                likedDuas.has(dua.id) 
                                  ? 'text-red-500 fill-current' 
                                  : 'text-gray-400 hover:text-red-500'
                              }`} 
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {dua.likes_count || '0'}
                            </span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(dua.created_at).toLocaleDateString()}
                        </span>
                        <Link 
                          href={`/public/duas/${dua.id}`}
                          className="text-primary-500 hover:text-primary-600 font-medium text-sm"
                        >
                          View Details
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
  )
}
