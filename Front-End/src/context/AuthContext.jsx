"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing session
    const savedAuth = localStorage.getItem("adminAuth")
    if (savedAuth) {
      const auth = JSON.parse(savedAuth)
      setAdminUser(auth)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Demo authentication
    const user = {
      id: "1",
      email,
      name: "Admin User",
      role: "Administrator",
    }
    setAdminUser(user)
    setIsAuthenticated(true)
    localStorage.setItem("adminAuth", JSON.stringify(user))
    return true
  }

  const logout = () => {
    setAdminUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("adminAuth")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
