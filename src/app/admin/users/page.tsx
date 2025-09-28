'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Crown, Shield, BookOpen, Search, Filter, ArrowLeft } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'
import UserDropdown from '@/components/user-dropdown'
import { authUtils } from '@/lib/auth'
import { usersAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'scholar' | 'user'
  is_active: boolean
  created_at: string
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const router = useRouter()

  const roleNames = {
    admin: 'Administrator',
    manager: 'Manager', 
    scholar: 'Scholar',
    user: 'User'
  }

  const roleColors = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    scholar: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    user: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const roleHierarchy = {
    admin: 4,
    manager: 3,
    scholar: 2,
    user: 1
  }

  useEffect(() => {
    const getCurrentUser = async () => {
      const currentUser = authUtils.getCurrentUser()
      if (!currentUser || (!authUtils.hasRole('admin') && !authUtils.hasRole('manager'))) {
        toast.error('Admin access required')
        router.push('/dashboard')
        return
      }
      setUser(currentUser)
      loadUsers()
    }
    getCurrentUser()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getUsers({ limit: 100 }) // Get all users for admin
      setUsers(response.data.users || [])
    } catch (error: any) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleUpdate = async (userId: string, newRole: string, userRole: string, currentUserId: string) => {
    // Prevent self-demotion
    if (userId === currentUserId && roleHierarchy[newRole as keyof typeof roleHierarchy] < roleHierarchy[userRole as keyof typeof roleHierarchy]) {
      toast.error('Cannot reduce your own role')
      return
    }

    // Check if current user can promote to this role
    const currentUserRole = user?.role
    if (currentUserRole === 'admin') {
      // Admin can promote to manager, scholar, user
      if (!['manager', 'scholar', 'user'].includes(newRole)) {
        toast.error('Admin can only promote to manager, scholar, or user')
        return
      }
    } else if (currentUserRole === 'manager') {
      // Manager can only promote to scholar, user
      if (!['scholar', 'user'].includes(newRole)) {
        toast.error('Manager can only promote to scholar or user')
        return
      }
    } else {
      toast.error('Only admin and manager can promote users')
      return
    }

    try {
      setUpdating(userId)
      await usersAPI.updateUserRole(userId, { role: newRole })
      toast.success(`User role updated to ${roleNames[newRole as keyof typeof roleNames]}`)
      loadUsers() // Reload users list
    } catch (error: any) {
      console.error('Error updating user role:', error)
      toast.error(error.response?.data?.error || 'Failed to update user role')
    } finally {
      setUpdating(null)
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === '' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <AuthGuard minimumRole="admin">
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
          <div className="spinner"></div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard minimumRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 arabic-pattern dark:arabic-pattern-dark">
        {/* Header */}
        <header className="bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-dark-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Link href="/dashboard">
                  <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </Link>
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">User Management</span>
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                  <p className="text-gray-600 dark:text-gray-300">Manage user roles and permissions</p>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-200">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    <div>
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-dark-200 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">All Roles</option>
                        <option value="admin">Administrator</option>
                        <option value="manager">Manager</option>
                        <option value="scholar">Scholar</option>
                        <option value="user">User</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div className="p-6">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No users found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-200">
                        <thead className="bg-gray-50 dark:bg-dark-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-dark-200">
                          {filteredUsers.map((managedUser) => (
                            <tr key={managedUser.id} className="hover:bg-gray-50 dark:hover:bg-dark-200">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                      <BookOpen className="w-5 h-5 text-primary-600" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{managedUser.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{managedUser.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColors[managedUser.role]}`}>
                                  {roleNames[managedUser.role]}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  managedUser.is_active 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                  {managedUser.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                  <select
                                    onChange={(e) => handleRoleUpdate(managedUser.id, e.target.value, managedUser.role, user?.id || '')}
                                    disabled={updating === managedUser.id || managedUser.id === user?.id}
                                    className={`text-sm border-0 rounded-lg px-2 py-1 ${
                                      managedUser.id === user?.id
                                        ? 'cursor-not-allowed bg-gray-100 text-gray-500' 
                                        : 'bg-white dark:bg-dark-100 border border-gray-300 dark:border-dark-200'
                                    }`}
                                    defaultValue={managedUser.role}
                                  >
                                    {Object.entries(roleNames).map(([key, name]) => (
                                      <option key={key} value={key}>
                                        {name}
                                      </option>
                                    ))}
                                  </select>
                                  {updating === managedUser.id && <div className="spinner w-4 h-4"></div>}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </main>

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
                <h3 className="text-lg font-semibold mb-4">Admin Panel</h3>
                <ul className="space-y-2">
                  <li><Link href="/admin/users" className="text-gray-400 hover:text-white transition-colors">User Management</Link></li>
                  <li><Link href="/admin/duas" className="text-gray-400 hover:text-white transition-colors">Content Management</Link></li>
                  <li><Link href="/approval" className="text-gray-400 hover:text-white transition-colors">Content Approval</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                  <li><Link href="/duas" className="text-gray-400 hover:text-white transition-colors">My Duas</Link></li>
                  <li><Link href="/blogs" className="text-gray-400 hover:text-white transition-colors">My Blogs</Link></li>
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
      </div>
    </AuthGuard>
  )
}
