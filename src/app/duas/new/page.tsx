'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowLeft, Save, Sparkles, X } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'
import { duasAPI, aiAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function NewDuaPage() {
  const [formData, setFormData] = useState({
    title: '',
    purpose: '',
    arabic_text: '',
    english_meaning: '',
    transliteration: '',
    native_meaning: '',
    source_reference: '',
    categories: [] as string[],
    is_public: false
  })
  const [loading, setLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'bangla'>('english')
  const router = useRouter()


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const handleGetAISuggestions = async () => {
    if (!formData.title || !formData.arabic_text) {
      toast.error('Please fill in at least the title and Arabic text to get AI suggestions')
      return
    }

    setAiLoading(true)
    try {
      // Use direct draft analysis
      const response = await aiAPI.analyzeDraft('dua', formData)
      
      console.log('🔍 Frontend received response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.status === 'completed') {
        console.log('✅ Analysis completed, setting suggestions:', JSON.stringify(response.data.analysis, null, 2));
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
    setLoading(true)

    try {
      await duasAPI.createDua(formData)
      toast.success('Dua created successfully!')
      router.push('/duas')
    } catch (error: any) {
      console.error('Error creating dua:', error)
      toast.error(error.response?.data?.error || 'Failed to create dua')
    } finally {
      setLoading(false)
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
                <Link href="/duas">
                  <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </Link>
                <img src="/logo/taddabbur_logo.png" alt="Tadabbur" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold gradient-text">Tadabbur</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link href="/duas" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-100 shadow rounded-lg"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Dua</h1>
                    <p className="text-gray-600 dark:text-gray-300">Share a meaningful dua with the community</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetAISuggestions}
                    disabled={aiLoading || !formData.title || !formData.arabic_text}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {aiLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>{aiLoading ? 'Analyzing...' : 'Get AI Suggestions'}</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title of Dua *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Dua for Peace and Tranquility"
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Purpose or When to Recite
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe when and why this dua should be recited..."
                  />
                </div>

                {/* Arabic Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Arabic Text *
                  </label>
                  <textarea
                    name="arabic_text"
                    value={formData.arabic_text}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent arabic-font text-right text-lg"
                    placeholder="بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"
                    dir="rtl"
                  />
                </div>

                {/* Native Language Meaning (Required) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Translation in Your Native Language *
                  </label>
                  <textarea
                    name="native_meaning"
                    value={formData.native_meaning}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Meaning in your native language (e.g., Bangla, Urdu, Hindi, etc.)"
                  />
                </div>

                {/* Transliteration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transliteration
                  </label>
                  <textarea
                    name="transliteration"
                    value={formData.transliteration}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Bismillahi ir-rahman ir-raheem"
                  />
                </div>

                {/* English Meaning (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    English Meaning (Optional)
                  </label>
                  <textarea
                    name="english_meaning"
                    value={formData.english_meaning}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="English translation (optional)"
                  />
                </div>

                {/* Source Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Source Reference *
                  </label>
                  <input
                    type="text"
                    name="source_reference"
                    value={formData.source_reference}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Quran 1:1, Sahih Bukhari 12:34, etc."
                  />
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categories
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Morning Duas',
                      'Evening Duas', 
                      'Prayer Duas',
                      'Supplications',
                      'Zikr',
                      'Protection Duas',
                      'Healing Duas',
                      'Forgiveness Duas'
                    ].map(category => (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="rounded border-gray-300 dark:border-dark-200 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Privacy Settings
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_public"
                      checked={formData.is_public}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 dark:border-dark-200 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Make this dua public for everyone to see
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-dark-200">
                  <Link
                    href="/duas"
                    className="px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Creating...' : 'Create Dua'}</span>
                  </button>
                </div>
              </form>
            </motion.div>

            {/* AI Suggestions Panel */}
            {showSuggestions && aiSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>AI Suggestions & Analysis</span>
                    {aiSuggestions.source === 'local_fallback' && (
                      <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                        Local Validation
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>


                {/* Language Tabs */}
                <div className="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedLanguage('english')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedLanguage === 'english'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('bangla')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedLanguage === 'bangla'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    বাংলা
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-white dark:bg-dark-100 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {selectedLanguage === 'english' ? 'Summary' : 'সারাংশ'}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {selectedLanguage === 'english' 
                        ? (aiSuggestions.summary?.english || aiSuggestions.summary)
                        : (aiSuggestions.summary?.bangla || aiSuggestions.summary)
                      }
                    </p>
                  </div>

                  {/* Corrections */}
                  <div className="bg-white dark:bg-dark-100 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {selectedLanguage === 'english' ? 'Suggestions & Corrections' : 'পরামর্শ ও সংশোধন'}
                    </h4>
                    <div className="text-gray-700 dark:text-gray-300 text-sm">
                      {Array.isArray(aiSuggestions.corrections) ? (
                        <ul className="list-disc list-inside space-y-1">
                          {aiSuggestions.corrections.map((correction: any, index: number) => (
                            <li key={index} className="text-gray-700 dark:text-gray-300">
                              {selectedLanguage === 'english' ? (
                                correction.issue_english || correction.suggestion_english || correction
                              ) : (
                                correction.issue_bangla || correction.suggestion_bangla || correction
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>{aiSuggestions.corrections}</p>
                      )}
                    </div>
                  </div>

                  {/* Authenticity */}
                  <div className="bg-white dark:bg-dark-100 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {selectedLanguage === 'english' ? 'Authenticity Assessment' : 'সত্যতা মূল্যায়ন'}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {selectedLanguage === 'english' 
                        ? (aiSuggestions.authenticity?.english || aiSuggestions.authenticity)
                        : (aiSuggestions.authenticity?.bangla || aiSuggestions.authenticity)
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> These are AI-generated suggestions to help improve your dua. 
                    They are not mandatory and should be considered as guidance. 
                    Always verify Islamic authenticity with qualified scholars.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
