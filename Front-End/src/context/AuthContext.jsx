"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

const API_BASE_URL = "http://localhost:3000"

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userAuth, setUserAuth] = useState(null)
  const [adminUser, setAdminUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  // Check localStorage for existing sessions
  const savedUserAuth = localStorage.getItem("userAuth")
  const savedAdminAuth = localStorage.getItem("adminAuth")
  const savedToken = localStorage.getItem("authToken")

  if (savedUserAuth && savedToken) {
    const auth = JSON.parse(savedUserAuth)
    setUserAuth(auth)
    setIsAuthenticated(true)
  }

  if (savedAdminAuth && savedToken) {
    const admin = JSON.parse(savedAdminAuth)
    setAdminUser(admin)
  }

  // 🧩 Development only — auto-login as admin if none found
  if (!savedAdminAuth) {
    const devAdmin = {
      id: "1",
      name: "Developer Admin",
      email: "admin@luxurystay.com",
      role: "admin",
    }

    localStorage.setItem("authToken", "dev-token")
    localStorage.setItem("adminAuth", JSON.stringify(devAdmin))

    setAdminUser(devAdmin)
  }

  setLoading(false)
}, [])


  const setUserFromAPI = (apiResponse) => {
  const userData = apiResponse.user || apiResponse // handle both cases
  const user = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    phone: userData.phone,
  }

  localStorage.setItem("authToken", apiResponse.token)
  localStorage.setItem("userAuth", JSON.stringify(user))

  setUserAuth(user)
  setIsAuthenticated(true)

  return user
}


  const registerUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          role: "user", // default role for new users
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      return { success: true, user: data.user }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: error.message }
    }
  }

 const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Login failed")
    }

    // 🧠 Safe way: handle both possible response shapes
    const formattedResponse = data.user
      ? { ...data.user, token: data.token }
      : data

    const user = setUserFromAPI(formattedResponse)

    return { success: true, user, token: data.token }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: error.message }
  }
}


  const logoutUser = () => {
    setUserAuth(null)
    setIsAuthenticated(false)
    localStorage.removeItem("userAuth")
    localStorage.removeItem("authToken")
  }

  const canAccessAdmin = () => {
    if (!userAuth) return false
    const adminRoles = ["admin", "manager", "receptionist", "housekeeping", "staff"]
    return adminRoles.includes(userAuth.role)
  }

  const isGuest = () => {
    return userAuth?.role === "guest"
  }

  const loginAdmin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed")
      }

      const adminRoles = ["admin", "manager", "receptionist", "housekeeping"]
      if (!adminRoles.includes(data.user.role)) {
        throw new Error("User does not have admin access")
      }

      const admin = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      }

      localStorage.setItem("authToken", data.token)
      localStorage.setItem("adminAuth", JSON.stringify(admin))

      setAdminUser(admin)

      return { success: true, admin, token: data.token }
    } catch (error) {
      console.error("Admin login error:", error)
      return { success: false, error: error.message }
    }
  }

  const logoutAdmin = () => {
    setAdminUser(null)
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("authToken")
  }

  return (
    <AuthContext.Provider
      value={{
        // User
        isAuthenticated,
        userAuth,
        setUserFromAPI,
        registerUser,
        loginUser,
        logoutUser,
        canAccessAdmin,
        isGuest,
        // Admin
        adminUser,
        loginAdmin,
        logoutAdmin,
        loading,
      }}
    >
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
