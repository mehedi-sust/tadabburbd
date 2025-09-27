'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authUtils } from '@/lib/auth'
import { motion } from 'framer-motion'

interface AuthGuardProps {
  children: React.ReactNode
  minimumRole?: string
}

export default function AuthGuard({ children, minimumRole = 'user' }: AuthGuardProps) {
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [minimumRole])

  const checkAuth = async () => {
    const isAuthenticated = authUtils.isAuthenticated()
    
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    const user = authUtils.getCurrentUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check role-based access
    const roleHierarchy = ['user', 'scholar', 'manager', 'admin']
    const userRoleLevel = roleHierarchy.indexOf(user.role)
    const minRoleLevel = roleHierarchy.indexOf(minimumRole)

    if (userRoleLevel >= minRoleLevel) {
      setIsAuthorized(true)
    } else {
      router.push('/dashboard?error=insufficient-permissions')
      return
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
