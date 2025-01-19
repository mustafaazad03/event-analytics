"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as jwt from 'jsonwebtoken'

interface AuthContextType {
  user: { token: string } | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ token: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Decode token from jwt
      const decoded = jwt.decode(token) as { exp: number } 
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        setUser(null)
      } else {
        const user = jwt.decode(token) as any;
        setUser({ token })
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (response.ok) {
      localStorage.setItem('token', data.token)
      setUser({ token: data.token })
      router.push('/dashboard')
    } else {
      throw new Error(data.message || 'Login failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/login')
  }

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await response.json()
    if (response.ok) {
      localStorage.setItem('token', data.token)
      setUser({ token: data.token })
      router.push('/dashboard')
    } else {
      throw new Error(data.message || 'Registration failed')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}