'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Search, 
  Filter,
  Eye,
  Edit
} from 'lucide-react'
import AuthGuard from '@/components/auth-guard'
import UserDropdown from '@/components/user-dropdown'
import { authUtils } from '@/lib/auth'
import { duasAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface AdminDua {
  id: string
  title: string
  purpose?: string
  arabic_text?: string
  english_meaning?: string
  native_meaning?: string
  is_public: boolean
  is_verified: boolean
  created_at: string
  author_name: string
  verified_by?: string
  verified_at?: string
  ai_summary?: string
  ai_corrections?: string
}

export default function AdminDuaApprovalPage() {
  const [duas, setDuas] = useState<AdminDua[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const initializeAdmin = async () => {
      const currentUser = authUtils.getCurrentUser()
      if (!currentUser || !authUtils.isScholarOrAbove()) {
        toast.error('Insufficient permissions')
        router.push('/dashboard')
        return
      }
      setUser(currentUser)
      await loadDuas()
    }
    initializeAdmin()
  }, [router])

  const loadDuas = async () => {
    try {
      setLoading(true)
      const response = await duasAPI.getDuas({ 
        limit: 100,
        all: true // Get all duas for admin
      })
      setDuas(response.data.duas || [])
    } catch (error: any) {
      console.error('Error loading duas:', error)
      toast.error('Failed to load duas')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyDua = async (duaId: string, verify: boolean) => {
    try {
      setProcessing(duaId)
      
      if (verify) {
        await duasAPI.verifyDua(duaId)
        toast.success('Dua verified successfully')
      } else {
        // For now we'll update via edit endpoint - backend needs explicit unverify.
        // Can call edit endpoint and set is_verified = false 
        await duasAPI.updateDua(duaId, { is_verified: false })
        toast.success('Dua unverified')
      }
      
      await loadDuas()
    } catch (error: any) {
      console.error('Error updating verification:', error)
      toast.error(error.response?.data?.error || 'Failed to update verification')
    } finally {
      setProcessing(null)
    }
  }

  const handleDeleteDua = async (duaId: string) => {
    if (!confirm('Are you sure you want to delete this dua? This action cannot be undone.')) {
      return
    }
    
    try {
      setProcessing(duaId)
      await duasAPI.deleteDua(duaId)
      toast.success('Dua deleted successfully')
      await loadDuas()
    } catch (error: any) {
      console.error('Error deleting dua:', error)
      toast.error('Failed to delete dua')
    } finally {
      setProcessing(null)
    }
  }

  const filteredDuas = duas.filter(dua => {
    const matchesSearch = dua.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dua.purpose && dua.purpose.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dua.author_name && dua.author_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === '' || (
      statusFilter === 'verified' && dua.is_verified
    ) || (
      statusFilter === 'pending' && !dua.is_verified
    ) || (
      statusFilter === 'public' && dua.is_public
    )
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <AuthGuard minimumRole="scholar">
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
          <div className="spinner"></div>
        </div>
      </AuthGuard>
    )
  }

  const canManage = authUtils.isScholarOrAbove()

  return (
    <AuthGuard minimumRole="scholar">
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
        {/* Header */}
        <header className="bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-dark-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Link href="/admin/users">
                  <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </Link>
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Dua Management</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Back to Dashboard
                </Link>
                {user && <UserDropdown user={user} />}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-white dark:bg-dark-100 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-200">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dua Approval & Management</h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    {canManage ? 'Review, verify, and manage Islamic duas' : 'View dua verification status'}
                  </p>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-200">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search duas by title, purpose, or author..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    <div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">All Duas</option>
                        <option value="verified">Verified</option>
                        <option value="pending">Pending Approval</option>
                        <option value="public">Public Duas</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Duas List */}
                <div className="p-6">
                  {filteredDuas.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No duas found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredDuas.map((dua) => (
                        <motion.div
                          key={dua.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4 border border-gray-200 dark:border-dark-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {dua.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                by {dua.author_name} • {new Date(dua.created_at).toLocaleDateString()}
                              </p>
                              {dua.purpose && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {dua.purpose}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {dua.is_verified ? (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">Verified</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 text-orange-500">
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">Pending</span>
                                </div>
                              )}
                              {dua.is_public && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                  Public
                                </span>
                              )}
                            </div>
                          </div>

                          {dua.arabic_text && (
                            <div className="mb-3">
                              <div className="text-lg text-gray-900 dark:text-white arabic-font text-right">
                                {dua.arabic_text}
                              </div>
                            </div>
                          )}

                          {(dua.native_meaning || dua.english_meaning) && (
                            <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                              {dua.native_meaning || dua.english_meaning}
                            </div>
                          )}

                          {dua.ai_summary && (
                            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                                AI Analysis:
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {dua.ai_summary}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex space-x-2">
                              <Link
                                href={`/duas/${dua.id}`}
                                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Details</span>
                              </Link>
                              {canManage && (
                                <Link
                                  href={`/duas/${dua.id}/edit`}
                                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm font-medium"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit</span>
                                </Link>
                              )}
                            </div>
                            
                            {canManage && (
                              <div className="flex items-center space-x-2">
                                {!dua.is_verified ? (
                                  <button
                                    onClick={() => handleVerifyDua(dua.id, true)}
                                    disabled={processing === dua.id}
                                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Verify</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleVerifyDua(dua.id, false)}
                                    disabled={processing === dua.id}
                                    className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>Unverify</span>
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleDeleteDua(dua.id)}
                                  disabled={processing === dua.id}
                                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                  <span>Delete</span>
                                </button>
                                
                                {processing === dua.id && <div className="spinner w-4 h-4"></div>}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
