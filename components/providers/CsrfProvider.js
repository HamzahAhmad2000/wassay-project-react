'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { csrfApi } from '@/lib/api'

const CsrfContext = createContext()

export const useCsrfContext = () => {
  const context = useContext(CsrfContext)
  if (!context) {
    console.error('CsrfContext not found. Make sure CsrfProvider is wrapping your component.')
    throw new Error('useCsrfContext must be used within a CsrfProvider')
  }
  return context
}

export const CsrfProvider = ({ children }) => {
  const [csrfToken, setCsrfToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  console.log('CsrfProvider mounted')

  // Fetch CSRF token from backend
  const fetchCsrfToken = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching CSRF token from backend...')

      // Use the API client instead of direct fetch
      const data = await csrfApi.getToken()
      
      if (data.csrf_token) {
        setCsrfToken(data.csrf_token)
        
        // Update meta tag
        let metaTag = document.querySelector('meta[name="csrf-token"]')
        if (!metaTag) {
          metaTag = document.createElement('meta')
          metaTag.name = 'csrf-token'
          document.head.appendChild(metaTag)
        }
        metaTag.content = data.csrf_token
        
        // Update window object
        window.csrfToken = data.csrf_token
        
        console.log('CSRF token fetched and stored:', data.csrf_token.substring(0, 10) + '...')
        return data.csrf_token
      } else {
        throw new Error('No CSRF token in response')
      }
    } catch (err) {
      console.error('Failed to fetch CSRF token:', err)
      setError(err.message)
      
      // In development, create a dummy token
      if (process.env.NODE_ENV === 'development') {
        const dummyToken = 'dev-csrf-token-' + Date.now()
        setCsrfToken(dummyToken)
        console.warn('Using dummy CSRF token for development')
        return dummyToken
      }
      
      return null
    } finally {
      setLoading(false)
    }
  }

  // Refresh CSRF token
  const refreshToken = async () => {
    return await fetchCsrfToken()
  }

  // Initialize CSRF token on mount
  useEffect(() => {
    console.log('CsrfProvider useEffect running')
    const initializeToken = async () => {
      // Try to get stored token first
      const metaTag = document.querySelector('meta[name="csrf-token"]')
      const storedToken = metaTag?.getAttribute('content') || window.csrfToken
      
      if (storedToken) {
        console.log('Using stored CSRF token')
        setCsrfToken(storedToken)
        setLoading(false)
        return
      }

      // Fetch new token if none stored
      console.log('No stored token, fetching new CSRF token')
      await fetchCsrfToken()
    }

    initializeToken()
  }, [])

  const value = {
    csrfToken,
    loading,
    error,
    refreshToken,
    clearError: () => setError(null)
  }

  console.log('CsrfProvider rendering with value:', { csrfToken: csrfToken ? 'present' : 'null', loading, error })

  return (
    <CsrfContext.Provider value={value}>
      {children}
    </CsrfContext.Provider>
  )
} 