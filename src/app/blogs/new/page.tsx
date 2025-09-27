'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, ArrowLeft, Save, Sparkles, X } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'
import UserDropdown from '@/components/user-dropdown'
import { authUtils } from '@/lib/auth'
import { blogsAPI, aiAPI } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface AISuggestions {
  summary: string
  corrections: string[]
  authenticity: string
  confidence?: number
  source?: string
}

export default function NewBlogPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    is_published: false
  })

  useState(() => {
    const currentUser = authUtils.getCurrentUser()
    setUser(currentUser)
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleGetAISuggestions = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Please fill in at least the title and content to get AI suggestions')
      return
    }

    setAiLoading(true)
    try {
      // Use direct draft analysis
      const response = await aiAPI.analyzeDraft('blog', formData)
      
      if (response.data.status === 'completed') {
        setAiSuggestions(response.data.analysis)
        setShowSuggestions(true)
        
        // Show different message based on analysis source
        if (response.data.analysis.source === 'local_fallback') {
          toast.success('Basic suggestions ready! (Using local validation - AI services unavailable)')
        } else {
          toast.success('AI suggestions ready!')
        }
      } else {
        toast.error('AI analysis failed. Please try again.')
      }
      
    } catch (error: any) {
      console.error('Error getting AI suggestions:', error)
      if (error.response?.status === 403) {
        toast.error('You need to be logged in to get AI suggestions')
      } else if (error.response?.status === 400) {
        toast.error('Please fill in the required fields to get AI suggestions')
      } else if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.error || 'AI service is temporarily unavailable'
        toast.error(errorMessage)
      } else {
        toast.error('Failed to get AI suggestions. Please try again later.')
      }
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await blogsAPI.createBlog(formData)
      toast.success('Blog created successfully!')
      router.push('/blogs')
    } catch (error: any) {
      console.error('Error creating blog:', error)
      if (error.response?.status === 401) {
        toast.error('You need to be logged in to create a blog')
        router.push('/auth/login')
      } else {
        toast.error('Failed to create blog. Please try again.')
      }
    } finally {
      setSaving(false)
    }
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
                <a href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  Dashboard
                </a>
                <a href="/duas" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  Duas
                </a>
                <a href="/blogs" className="text-primary-500 font-medium">
                  Blogs
                </a>
                <a href="/questions" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  Q&A
                </a>
              </nav>

              <div className="flex items-center space-x-4">
                {user && <UserDropdown user={user} />}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Blogs</span>
            </button>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Write New Blog</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Share your Islamic insights and knowledge with the community
              </p>
            </div>

            {/* AI Suggestions Panel */}
            {showSuggestions && aiSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>AI Suggestions</span>
                    {aiSuggestions.source === 'local_fallback' && (
                      <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        Local Validation
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Summary:</h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">{aiSuggestions.summary}</p>
                  </div>
                  
                  {aiSuggestions.corrections && aiSuggestions.corrections.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Suggestions:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {aiSuggestions.corrections.map((correction, index) => (
                          <li key={index} className="text-blue-800 dark:text-blue-200 text-sm">
                            {correction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Content Quality:</h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">{aiSuggestions.authenticity}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-100 rounded-lg shadow-lg p-6"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter blog title..."
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Brief description of your blog..."
                  />
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Write your blog content here..."
                  />
                </div>

                {/* Published Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Publish immediately
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-dark-200">
                  <button
                    type="button"
                    onClick={handleGetAISuggestions}
                    disabled={aiLoading || !formData.title || !formData.content}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{aiLoading ? 'Analyzing...' : 'Get AI Suggestions'}</span>
                  </button>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-6 py-2 border border-gray-300 dark:border-dark-200 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !formData.title || !formData.content}
                      className="flex items-center space-x-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Creating...' : 'Create Blog'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
