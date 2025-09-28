'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Heart, Users, Star, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import PublicNavbar from '@/components/PublicNavbar'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Personal Dua Collection',
      description: 'Create and manage your personal collection of duas with Arabic text, transliteration, English and native language meanings.',
      color: 'text-primary-500'
    },
    {
      icon: Heart,
      title: 'AI-Powered Analysis',
      description: 'Get intelligent suggestions and corrections for your dua content using advanced AI to ensure accuracy and authenticity.',
      color: 'text-accent-500'
    },
    {
      icon: Users,
      title: 'Community Features',
      description: 'Share your duas publicly, like and favorite content from others, and build a community around authentic Islamic content.',
      color: 'text-primary-600'
    },
    {
      icon: Star,
      title: 'Blog & Q&A Platform',
      description: 'Write Islamic blogs, ask questions, and get answers from the community. Share knowledge and learn together.',
      color: 'text-accent-600'
    }
  ]

  const stats = [
    { number: '✓', label: 'AI-Powered Analysis' },
    { number: '✓', label: 'Expert Verification' },
    { number: '✓', label: 'Community Sharing' },
    { number: '✓', label: 'Secure & Private' }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <PublicNavbar className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-100/80 backdrop-blur-md" />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Your Personal{' '}
              <span className="gradient-text">Islamic</span>{' '}
              Companion
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Create your personal dua collection, get AI-powered content analysis, and connect with a community of believers. 
              Share knowledge, ask questions, and grow in your Islamic journey.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/auth/register" className="btn-primary text-lg px-8 py-4">
              Start Your Journey
            </Link>
            <Link href="/duas" className="btn-secondary text-lg px-8 py-4">
              Explore Duas
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-500 mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-dark-100/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Tadabbur?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover the features that make Tadabbur your trusted Islamic companion
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gray-100 dark:bg-dark-200 flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="card"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Begin Your Spiritual Journey?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Start building your personal Islamic knowledge base today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn-primary text-lg px-8 py-4">
                Create Free Account
              </Link>
              <Link href="/blogs" className="btn-accent text-lg px-8 py-4">
                Read Islamic Blogs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-gray-900 dark:bg-dark-50 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo/taddabbur_logo.png" alt="Tadabbur" className="w-12 h-12 object-contain" />
                <span className="text-xl font-bold">Tadabbur</span>
              </div>
              <p className="text-gray-400">
                A modern platform for Islamic learning, dua collection, and community building.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/duas" className="hover:text-white transition-colors">Dua Collection</Link></li>
                <li><Link href="/blogs" className="hover:text-white transition-colors">Islamic Blogs</Link></li>
                <li><Link href="/questions" className="hover:text-white transition-colors">Q&A Section</Link></li>
                <li><Link href="/ai" className="hover:text-white transition-colors">AI Guidance</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/public/duas" className="hover:text-white transition-colors">Public Duas</Link></li>
                <li><Link href="/public/blogs" className="hover:text-white transition-colors">Public Blogs</Link></li>
                <li><Link href="/questions" className="hover:text-white transition-colors">Q&A Forum</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
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
  )
}
