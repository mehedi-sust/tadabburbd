'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Plus, Search, MessageCircle, CheckCircle2, Clock, Star } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'
import UserDropdown from '@/components/user-dropdown'
import { authUtils } from '@/lib/auth'
import { questionsAPI } from '@/lib/api'

interface Question {
  id: string
  title: string
  content: string
  author_name: string
  created_at: string
  is_answered: boolean
  tags: string[]
  answer_count: number
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadQuestions()
    const currentUser = authUtils.getCurrentUser()
    setUser(currentUser)
  }, [])

  const loadQuestions = async () => {
    try {
      const response = await questionsAPI.getQuestions()
      setQuestions(response.data.questions || [])
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
                <Link href="/duas" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  Duas
                </Link>
                <Link href="/blogs" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  Blogs
                </Link>
                <Link href="/questions" className="text-primary-500 font-medium">
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Q&A Section</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Ask questions and get answers from Islamic scholars and community
                </p>
              </div>
              <Link href="/questions/new" className="btn-primary flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Ask Question</span>
              </Link>
            </div>

            {/* Search */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search questions..."
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

            {/* Questions List */}
            {!loading && filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No questions found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to ask a question</p>
                <Link href="/questions/new" className="btn-primary">
                  Ask First Question
                </Link>
              </div>
            )}

            {!loading && filteredQuestions.length > 0 && (
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-100 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 card"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex flex-col items-center space-y-1 min-w-0">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">0</span>
                            </div>
                            {question.is_answered ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : (
                              <Clock className="w-6 h-6 text-orange-500" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400">
                              <Link href={`/questions/${question.id}`}>
                                {question.title}
                              </Link>
                            </h3>
                            
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                              {question.content}
                            </p>

                            {question.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {question.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>
                                  Asked by {question.author_name}
                                </span>
                                <span>
                                  {new Date(question.created_at).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="flex items-center space-x-4">
                                {question.answer_count > 0 && (
                                  <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-sm">{question.answer_count} answers</span>
                                  </div>
                                )}
                                
                                <Link 
                                  href={`/questions/${question.id}`}
                                  className="text-primary-500 hover:text-primary-600 font-medium text-sm"
                                >
                                  View Details
                                </Link>
                              </div>
                            </div>
                          </div>
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
