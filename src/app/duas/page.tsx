'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Plus, Search, Heart, Eye, Lock, CheckCircle, CheckCircle2, XCircle } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'
import UserDropdown from '@/components/user-dropdown'
import { authUtils } from '@/lib/auth'
import { duasAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import ReportContent from '@/components/ReportContent'

interface Dua {
  id: string
  title: string
  purpose?: string
  arabic_text?: string
  english_meaning?: string
  native_meaning?: string  // Add native language meaning
  is_public: boolean
  is_verified: boolean
  created_at: string
  user_id?: string
  native_language?: string  // User's native language
  likes_count?: number
  author_name?: string
  user_name?: string
}

export default function DuasPage() {
  const [duas, setDuas] = useState<Dua[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'favorites'>('all')
  const [likedDuas, setLikedDuas] = useState<Set<string>>(new Set())
  const [likesCount, setLikesCount] = useState<{[duaId: string]: number}>({})
  const [favoriteDuas, setFavoriteDuas] = useState<Dua[]>([])

  useEffect(() => {
    loadDuas()
    const currentUser = authUtils.getCurrentUser()
    setUser(currentUser)
  }, [])



  const loadFavorites = (duasForFavorites?: Dua[], myDuasForFavorites?: Dua[]) => {
    // Use provided data or current state
    const allDuasToCheck = duasForFavorites || allDuas
    const myDuasToCheck = myDuasForFavorites || myDuas
    
    // Combine all available duas to search through
    const combinedAllDuas = [...allDuasToCheck, ...myDuasToCheck]
    const favorites = combinedAllDuas.filter((dua, index, self) => 
      likedDuas.has(dua.id) && 
      self.findIndex(d => d.id === dua.id) === index // Remove duplicates
    )
    
    setFavoriteDuas(favorites)
  }

  const [allDuas, setAllDuas] = useState<Dua[]>([])
  const [myDuas, setMyDuas] = useState<Dua[]>([])

  const loadDuas = async () => {
    try {
      // Get all public duas
      let publicDuas: Dua[] = []
      let myDuasData: Dua[] = []
      
      try {
        const publicResponse = await duasAPI.getDuas()
        publicDuas = publicResponse.data.duas || []
        console.log('Loaded public duas:', publicDuas.length)
      } catch (publicError) {
        console.warn('Error loading public duas:', publicError)
      }
      
      try {
        const myDuasResponse = await duasAPI.getMyDuas()
        myDuasData = myDuasResponse.data.duas || []
        console.log('Loaded my duas:', myDuasData.length)
        setMyDuas(myDuasData)
      } catch (privateError) {
        console.warn('Error loading my duas:', privateError)
      }
      
      // Combine all duas (avoiding duplicates)
      const combinedAllDuas = [...myDuasData]
      publicDuas.forEach((publicDua: Dua) => {
        if (!myDuasData.find((myDua: Dua) => myDua.id === publicDua.id)) {
          combinedAllDuas.push(publicDua)
        }
      })
      
      setAllDuas(combinedAllDuas)
      
      // Initialize likes counts and load like status
      const likesCountData: {[duaId: string]: number} = {}
      const likedStatus = new Set<string>()
      
      combinedAllDuas.forEach(dua => {
        likesCountData[dua.id] = dua.likes_count || 0
        // Note: we don't load personal like status here as we need to 
        // check each dua individually from backend.
      })
      
      setLikesCount(likesCountData)
      
      // Load like status for authenticated users
      if (authUtils.isAuthenticated()) {
        await loadUserLikeStatus(combinedAllDuas)
      } else {
        setLikedDuas(likedStatus)
      }
      
      // Set initial duas based on current tab
      setDuas(combinedAllDuas)
      
      // Load favorites immediately with the fresh data
      loadFavorites(combinedAllDuas, myDuasData)
    } catch (error) {
      console.error('Error loading duas:', error)
      setDuas([])
      setAllDuas([])
      setMyDuas([])
    } finally {
      setLoading(false)
    }
  }

  const loadUserLikeStatus = async (duas: Dua[]) => {
    if (!authUtils.isAuthenticated()) return
    
    try {
      const likePromises = duas.map(async (dua) => {
        try {
          const response = await duasAPI.getDuaLikeStatus(dua.id)
          return {
            duaId: dua.id,
            isLiked: response.data.is_liked,
            likesCount: response.data.likes_count
          }
        } catch (error) {
          console.warn(`Failed to get like status for dua ${dua.id}:`, error)
          return {
            duaId: dua.id,
            isLiked: false,
            likesCount: dua.likes_count || 0
          }
        }
      })
      
      const likeStatuses = await Promise.all(likePromises)
      const newLikedDuas = new Set<string>()
      const newLikesCounts: {[duaId: string]: number} = {}
      
      likeStatuses.forEach(status => {
        if (status.isLiked) {
          newLikedDuas.add(status.duaId)
        }
        newLikesCounts[status.duaId] = status.likesCount
      })
      
      setLikedDuas(newLikedDuas)
      setLikesCount(newLikesCounts)
    } catch (error) {
      console.error('Error loading user like status:', error)
    }
  }

  // Handle tab switching
  const handleTabChange = (tab: 'all' | 'my' | 'favorites') => {
    setActiveTab(tab)
    setSearchQuery('') // Clear search when switching tabs
    
    if (tab === 'favorites') {
      loadFavorites()
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
      const isCurrentlyLiked = likedDuas.has(duaId)
      
      let response;
      if (isCurrentlyLiked) {
        response = await duasAPI.unlikeDua(duaId)
      } else {
        response = await duasAPI.likeDua(duaId)
      }
      
      // Update the like status and count
      const newLikedDuas = new Set(likedDuas)
      if (isCurrentlyLiked) {
        newLikedDuas.delete(duaId)
      } else {
        newLikedDuas.add(duaId)
      }
      
      setLikedDuas(newLikedDuas)
      setLikesCount(prev => ({
        ...prev,
        [duaId]: response.data.likes_count
      }))
      
      toast.success(isCurrentlyLiked ? 'Removed from favorites' : 'Added to favorites')
      
      // Refresh favorites tab if it's active
      if (activeTab === 'favorites') {
        loadFavorites()
      }
    } catch (error: any) {
      console.error('Error liking/unliking dua:', error)
      toast.error(error.response?.data?.error || 'Failed to update like status')
    }
  }

  // Use the current tab to determine advertised data source:
  const allDisplayedDuas = (activeTab === 'all') ? allDuas : 
                          (activeTab === 'my') ? myDuas :
                          (activeTab === 'favorites') ? favoriteDuas : []

  const filteredDuas = allDisplayedDuas.filter(dua =>
    dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dua.purpose && dua.purpose.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
                  <Search className="w-5 h-5" />
                </button>
                {user && <UserDropdown user={user} />}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Islamic Duas</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Explore authentic duas and supplications from the Quran and Sunnah
                </p>
              </div>
              <Link href="/duas/new" className="btn-primary flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add New Dua</span>
              </Link>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200 dark:border-dark-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => handleTabChange('all')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'all'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    All Duas ({allDuas.length})
                  </button>
                  <button
                    onClick={() => handleTabChange('my')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'my'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    My Contributions ({myDuas.length})
                  </button>
                  <button
                    onClick={() => handleTabChange('favorites')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'favorites'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    My Favorites ({favoriteDuas.length})
                  </button>
                </nav>
              </div>
            </div>

            {/* Search */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'all' ? 'all duas' : activeTab === 'my' ? 'my duas' : 'favorites'}...`}
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
                <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to add a dua to our collection</p>
                <Link href="/duas/new" className="btn-primary">
                  Add Your First Dua
                </Link>
              </div>
            )}

            {!loading && filteredDuas.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDuas.map((dua) => (
                <motion.div
                  key={dua.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-dark-100 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 card max-w-none min-w-0 flex flex-col h-full"
                >
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {dua.title}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          {dua.is_public ? (
                            <Eye className="w-4 h-4 text-green-500" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
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
                            <div className="w-full text-center">
                              <div className="scrolling-text text-3xl text-gray-900 dark:text-white arabic-font">
                                {dua.arabic_text}
                              </div>
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
                  </div>

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
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          by {dua.author_name || dua.user_name || 'Unknown'}
                        </span>
                        {dua.user_id === user?.id && (
                          <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full dark:bg-primary-900 dark:text-primary-400">
                            My Dua
                          </span>
                        )}
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
                            {likesCount[dua.id] !== undefined ? likesCount[dua.id] : (dua.likes_count || 0)}
                          </span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/duas/${dua.id}`} 
                        className="text-primary-500 hover:text-primary-600 font-medium text-sm transition-colors"
                      >
                        View Details
                      </Link>
                      <div className="flex space-x-2">
                        {dua.user_id === user?.id && (
                          <Link 
                            href={`/duas/${dua.id}/edit`}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm transition-colors"
                          >
                            Edit
                          </Link>
                        )}
                        <ReportContent 
                          contentType="dua" 
                          contentId={dua.id} 
                          contentTitle={dua.title}
                        />
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
