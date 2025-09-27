'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { authUtils } from '@/lib/auth'
import { useTheme } from 'next-themes'
import { Moon, Sun, Save, User, Shield, Bell } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'
import toast from 'react-hot-toast'
import { authAPI } from '@/lib/api'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    native_language: 'english'
  })
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'english',
    dua_view_mode: 'grid',
    notifications_enabled: true
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    const currentUser = authUtils.getCurrentUser()
    setUser(currentUser)
    
    if (currentUser) {
      setProfileData({
        name: currentUser.name,
        email: currentUser.email,
        native_language: currentUser.native_language || 'english'
      })
    }
    
    // Load saved preferences from localStorage
    const savedPreferences = localStorage.getItem('preferences')
    if (savedPreferences) {
      const prefs = JSON.parse(savedPreferences)
      setPreferences(prev => ({ ...prev, ...prefs }))
    }
    
    setLoading(false)
  }, [router])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setPreferences(prev => ({ ...prev, [name]: newValue }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await authAPI.updateProfile({
        name: profileData.name,
        native_language: profileData.native_language
      })
      toast.success('Profile updated successfully!')
      
      // Refresh user data
      const updatedUser = await authUtils.refreshProfile()
      setUser(updatedUser)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setSaving(true)
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handlePreferencesSave = (e: React.FormEvent) => {
    e.preventDefault()
    
    localStorage.setItem('preferences', JSON.stringify(preferences))
    
    // Apply theme change immediately
    if (preferences.theme !== theme) {
      setTheme(preferences.theme as any)
    }
    
    toast.success('Preferences saved!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
        {/* Header */}
        <header className="bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-dark-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 space-y-8">
            
            {/* Profile Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-100 shadow rounded-lg"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-200">
                <div className="flex items-center space-x-3">
                  <User className="w-6 h-6 text-primary-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-gray-50 dark:bg-dark-200 text-gray-500 dark:text-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Native Language
                    </label>
                    <select
                      name="native_language"
                      value={profileData.native_language}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="english">English</option>
                      <option value="arabic">Arabic</option>
                      <option value="bangla">Bangla</option>
                      <option value="hindi">Hindi</option>
                      <option value="urdu">Urdu</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Password Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-dark-100 shadow rounded-lg"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-200">
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-accent-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Change Password</h2>
                </div>
              </div>

              <form onSubmit={handlePasswordSave} className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password *
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Change Password'}</span>
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Preferences Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-100 shadow rounded-lg"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-200">
                <div className="flex items-center space-x-3">
                  <Bell className="w-6 h-6 text-primary-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Preferences</h2>
                </div>
              </div>

              <form onSubmit={handlePreferencesSave} className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      name="theme"
                      value={preferences.theme}
                      onChange={handlePreferencesChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      App Language
                    </label>
                    <select
                      name="language"
                      value={preferences.language}
                      onChange={handlePreferencesChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="english">English</option>
                      <option value="arabic">العربية</option>
                      <option value="bangla">বাংলা</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dua View Mode
                    </label>
                    <select
                      name="dua_view_mode"
                      value={preferences.dua_view_mode}
                      onChange={handlePreferencesChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="grid">Grid View</option>
                      <option value="list">List View</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="notifications_enabled"
                        checked={preferences.notifications_enabled}
                        onChange={handlePreferencesChange}
                        className="rounded border-gray-300 dark:border-dark-200 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Enable Notifications
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </form>
            </motion.div>

          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
