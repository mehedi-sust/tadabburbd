'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCircle, XCircle, User, Trash2, CheckCheck } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { notificationsAPI } from '@/lib/api'
import { authUtils } from '@/lib/auth'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  content_type?: string
  content_id?: string
  content_title?: string
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const { theme } = useTheme()

  const currentUser = authUtils.getCurrentUser()

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [showUnreadOnly])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const params = showUnreadOnly ? { unread: 'true' } : {}
      const response = await notificationsAPI.getNotifications(params)
      setNotifications(response.data.notifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount()
      setUnreadCount(response.data.unreadCount)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      )
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await notificationsAPI.deleteNotification(id)
      setNotifications(prev => prev.filter(notif => notif.id !== id))
      toast.success('Notification deleted')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      case 'rejection':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      case 'role_change':
        return <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      default:
        return <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'approval':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'rejection':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'role_change':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 shadow-sm border-b border-gray-200 dark:border-dark-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  Notifications
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stay updated with your content status
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showUnreadOnly
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Unread Only
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark All Read</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {showUnreadOnly 
                ? 'You\'re all caught up!' 
                : 'You haven\'t received any notifications yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-lg p-4 border ${
                  notification.is_read 
                    ? 'bg-white dark:bg-dark-200 border-gray-200 dark:border-dark-300' 
                    : getNotificationColor(notification.type)
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium ${
                        notification.is_read 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-900 dark:text-white font-semibold'
                      }`}>
                        {notification.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(notification.created_at)}
                        </span>
                        
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className={`mt-1 text-sm ${
                      notification.is_read 
                        ? 'text-gray-600 dark:text-gray-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {notification.message}
                    </p>
                    
                    {notification.content_title && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Content: {notification.content_title}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
