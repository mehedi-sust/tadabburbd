'use client'

import { useState } from 'react'
import { Flag, X } from 'lucide-react'
import { reportsAPI } from '@/lib/reportsAPI'
import toast from 'react-hot-toast'

interface ReportContentProps {
  contentType: 'dua' | 'blog'
  contentId: string
  contentTitle: string
}

export default function ReportContent({ contentType, contentId, contentTitle }: ReportContentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState<'inaccurate' | 'inappropriate' | 'spam' | 'copyright' | 'other'>('inaccurate')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await reportsAPI.reportContent({
        contentType,
        contentId,
        reason,
        description: description.trim() || undefined
      })
      
      toast.success('Content reported successfully. Thank you for helping maintain quality.')
      setIsOpen(false)
      setDescription('')
    } catch (error: any) {
      console.error('Error reporting content:', error)
      toast.error(error.response?.data?.error || 'Failed to report content')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reasonLabels = {
    inaccurate: 'Inaccurate Information',
    inappropriate: 'Inappropriate Content',
    spam: 'Spam or Irrelevant',
    copyright: 'Copyright Violation',
    other: 'Other'
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
        title="Report this content"
      >
        <Flag className="w-4 h-4" />
        <span>Report</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-100 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Report Content
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Reporting: <span className="font-medium">{contentTitle}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Help us maintain quality by reporting content that violates our guidelines.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for reporting
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                {Object.entries(reasonLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide specific details about the issue..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/1000 characters
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Reporting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
