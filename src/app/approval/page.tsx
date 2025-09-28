'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Eye, Clock, Users, FileText, BookOpen } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { approvalAPI, notificationsAPI } from '@/lib/api'
import { authUtils } from '@/lib/auth'
import NotificationDropdown from '@/components/NotificationDropdown'

interface ContentItem {
  id: string
  title: string
  author_name: string
  created_at: string
  approval_status: string
  rejection_reason?: string
  content_type?: string
  categories?: string[]
}

interface ApprovalStats {
  dua: {
    pending: number
    approved: number
    rejected: number
  }
  blog: {
    pending: number
    approved: number
    rejected: number
  }
}

export default function ContentApprovalPage() {
  const [activeTab, setActiveTab] = useState<'dua' | 'blog' | 'all'>('all')
  const [content, setContent] = useState<ContentItem[]>([])
  const [stats, setStats] = useState<ApprovalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const { theme } = useTheme()

  const currentUser = authUtils.getCurrentUser()
  const canAccessApproval = authUtils.hasAnyRole(['scholar', 'manager', 'admin'])
  const canAccessAdmin = authUtils.hasAnyRole(['manager', 'admin'])

  useEffect(() => {
    if (!canAccessApproval) {
      toast.error('You do not have permission to access this page')
      return
    }
    
    fetchContent()
    fetchStats()
  }, [activeTab])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const params = activeTab !== 'all' ? { type: activeTab } : {}
      const response = await approvalAPI.getPendingContent(params)
      setContent(response.data.content)
    } catch (error) {
      console.error('Error fetching content:', error)
      toast.error('Failed to fetch pending content')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      if (canAccessAdmin) {
        const response = await approvalAPI.getApprovalStats()
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleApprove = async (item: ContentItem) => {
    try {
      const contentType = item.content_type || activeTab
      await approvalAPI.approveContent(contentType, item.id)
      toast.success(`${contentType === 'dua' ? 'Dua' : 'Blog'} approved successfully`)
      fetchContent()
      fetchStats()
    } catch (error) {
      console.error('Error approving content:', error)
      toast.error('Failed to approve content')
    }
  }

  const handleReject = async () => {
    if (!selectedContent || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      const contentType = selectedContent.content_type || activeTab
      await approvalAPI.rejectContent(contentType, selectedContent.id, {
        reason: rejectionReason
      })
      toast.success(`${contentType === 'dua' ? 'Dua' : 'Blog'} rejected successfully`)
      setShowRejectForm(false)
      setRejectionReason('')
      setSelectedContent(null)
      fetchContent()
      fetchStats()
    } catch (error) {
      console.error('Error rejecting content:', error)
      toast.error('Failed to reject content')
    }
  }

  const openRejectForm = (item: ContentItem) => {
    setSelectedContent(item)
    setShowRejectForm(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'approved':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'rejected':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  if (!canAccessApproval) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 shadow-sm border-b border-gray-200 dark:border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <img 
                  src="/logo/taddabbur_logo.png" 
                  alt="Tadabbur" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xl font-bold gradient-text">Tadabbur</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Content Approval Panel
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review and approve user-submitted content
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              
              {canAccessAdmin && (
                <Link 
                  href="/admin" 
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && canAccessAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-200 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-300"
            >
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Duas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.dua.pending}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-dark-200 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-300"
            >
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Blogs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.blog.pending}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-200 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-300"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.dua.approved + stats.blog.approved}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-dark-200 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-300"
            >
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.dua.rejected + stats.blog.rejected}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300 mb-6">
          <div className="border-b border-gray-200 dark:border-dark-300">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Content', icon: Users },
                { key: 'dua', label: 'Duas', icon: BookOpen },
                { key: 'blog', label: 'Blogs', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content List */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : content.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No pending content
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All content has been reviewed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {content.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 dark:bg-dark-100 rounded-lg p-4 border border-gray-200 dark:border-dark-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.approval_status)}`}>
                            {item.approval_status}
                          </span>
                          {item.content_type && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                              {item.content_type}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>By: {item.author_name}</span>
                          <span>•</span>
                          <span>{formatDate(item.created_at)}</span>
                          {item.categories && item.categories.length > 0 && (
                            <>
                              <span>•</span>
                              <span>Categories: {item.categories.join(', ')}</span>
                            </>
                          )}
                        </div>
                        
                        {item.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                            <p className="text-sm text-red-600 dark:text-red-400">
                              <strong>Rejection Reason:</strong> {item.rejection_reason}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleApprove(item)}
                          className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        
                        <button
                          onClick={() => openRejectForm(item)}
                          className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Reject Modal */}
      {showRejectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-200 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Reject Content
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Content:</strong> {selectedContent?.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Author:</strong> {selectedContent?.author_name}
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-100 dark:text-white"
                rows={4}
                placeholder="Please provide a detailed reason for rejection..."
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectForm(false)
                  setRejectionReason('')
                  setSelectedContent(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject Content
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
