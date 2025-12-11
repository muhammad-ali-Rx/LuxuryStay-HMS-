"use client"

import { motion } from "framer-motion"
import { Save, User, Globe, Bell, Shield, Mail, Phone, MapPin, Calendar, Eye, EyeOff, User as UserIcon } from "lucide-react"
import { useState, useEffect } from "react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    preferences: "",
    role: "",
    shift: "",
    profileImage: "",
    password: "" // For password change
  })

  const [originalSettings, setOriginalSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        // Get user ID from localStorage or token
        const token = localStorage.getItem('token')
        const userData = JSON.parse(localStorage.getItem('userData'))
        
        if (!token || !userData) {
          setMessage({ type: 'error', text: 'Please login to access settings' })
          setLoading(false)
          return
        }

        const response = await fetch(`http://localhost:3000/users/${userData._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const result = await response.json()
        
        if (result.success) {
          const user = result.data[0] || result.data
          const userSettings = {
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            preferences: user.preferences || "",
            role: user.role || "",
            shift: user.shift || "",
            profileImage: user.profileImage || "",
            password: "" // Don't pre-fill password for security
          }
          setSettings(userSettings)
          setOriginalSettings(userSettings)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setMessage({ type: 'error', text: 'Failed to load user data' })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Check for changes
  useEffect(() => {
    const changes = JSON.stringify(settings) !== JSON.stringify(originalSettings)
    setHasChanges(changes)
  }, [settings, originalSettings])

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })

      const token = localStorage.getItem('token')
      const userData = JSON.parse(localStorage.getItem('userData'))
      
      if (!token || !userData) {
        setMessage({ type: 'error', text: 'Please login to save settings' })
        return
      }

      // Prepare data for API - remove empty password and don't send role/email if not changed
      const updateData = { ...settings }
      if (!updateData.password) {
        delete updateData.password
      }
      
      // Don't send these fields if they haven't changed or shouldn't be updated
      if (updateData.role === originalSettings.role) {
        delete updateData.role
      }
      if (updateData.email === originalSettings.email) {
        delete updateData.email
      }

      const response = await fetch(`http://localhost:3000/users/update/${userData._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
        setOriginalSettings(settings)
        
        // Update localStorage with new user data
        const updatedUserData = { ...userData, ...settings }
        localStorage.setItem('userData', JSON.stringify(updatedUserData))
        
        // Clear password field after successful save
        setSettings(prev => ({ ...prev, password: "" }))
      } else {
        throw new Error(result.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleReset = () => {
    setSettings(originalSettings)
    setMessage({ type: '', text: '' })
  }

  const settingsSections = [
    {
      title: "Profile Settings",
      icon: User,
      fields: [
        {
          key: "name",
          label: "Username",
          type: "text",
          icon: UserIcon,
          placeholder: "Enter your username"
        },
        {
          key: "email",
          label: "Email Address",
          type: "email",
          icon: Mail,
          placeholder: "Enter your email address"
        },
        {
          key: "phone",
          label: "Phone Number",
          type: "tel",
          icon: Phone,
          placeholder: "Enter your phone number"
        }
      ]
    },
    {
      title: "Personal Information",
      icon: MapPin,
      fields: [
        {
          key: "address",
          label: "Address",
          type: "text",
          icon: MapPin,
          placeholder: "Enter your address"
        },
        {
          key: "preferences",
          label: "Preferences",
          type: "textarea",
          icon: Bell,
          placeholder: "Enter your preferences and special requirements..."
        }
      ]
    },
    {
      title: "Account Security",
      icon: Shield,
      fields: [
        {
          key: "password",
          label: "Change Password",
          type: "password",
          icon: Shield,
          placeholder: "Enter new password (min 6 characters)",
          info: "Leave blank to keep current password"
        }
      ]
    },
    {
      title: "Work Information",
      icon: Calendar,
      fields: [
        {
          key: "role",
          label: "Role",
          type: "text",
          icon: User,
          disabled: true,
          info: "Contact admin to change role"
        },
        {
          key: "shift",
          label: "Shift",
          type: "select",
          icon: Calendar,
          options: ["morning", "afternoon", "night", "flexible"],
          disabled: settings.role === "user" || settings.role === "guest",
          info: settings.role === "user" || settings.role === "guest" ? "Only for staff members" : "Select your preferred shift"
        }
      ]
    }
  ]

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#0A1F44]">User Settings</h2>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-4 py-2 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </div>

      {/* Current User Info Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
      >
        <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">Current Profile</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Username:</span>
            <p className="text-[#0A1F44] font-medium">{originalSettings.name}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Email:</span>
            <p className="text-[#0A1F44]">{originalSettings.email}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Role:</span>
            <p className="text-[#0A1F44] capitalize">{originalSettings.role}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Shift:</span>
            <p className="text-[#0A1F44] capitalize">{originalSettings.shift || 'Not set'}</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {settingsSections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <section.icon size={24} className="text-[#D4AF37]" />
              <h3 className="text-xl font-bold text-[#0A1F44]">{section.title}</h3>
            </div>

            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    {field.info && (
                      <span className="text-xs text-gray-500">{field.info}</span>
                    )}
                  </div>
                  <div className="relative">
                    {field.icon && (
                      <field.icon 
                        size={20} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                      />
                    )}
                    {field.type === 'select' ? (
                      <select
                        value={settings[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        disabled={field.disabled}
                        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] ${
                          field.disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white text-[#0A1F44]'
                        }`}
                      >
                        <option value="">Select {field.label.toLowerCase()}</option>
                        {field.options.map(option => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={settings[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        disabled={field.disabled}
                        rows={3}
                        placeholder={field.placeholder}
                        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] ${
                          field.disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white text-[#0A1F44]'
                        }`}
                      />
                    ) : field.type === 'password' ? (
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={settings[field.key] || ""}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] bg-white text-[#0A1F44]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        value={settings[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        disabled={field.disabled}
                        placeholder={field.placeholder}
                        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] ${
                          field.disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white text-[#0A1F44]'
                        }`}
                      />
                    )}
                  </div>
                  {/* Show current value for reference */}
                  {field.key !== 'password' && settings[field.key] && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {settings[field.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveSettings}
          disabled={saving || !hasChanges}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold ${
            saving || !hasChanges
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#D4AF37] text-[#0A1F44] hover:shadow-lg'
          }`}
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Settings'}
        </motion.button>

        {hasChanges && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Reset Changes
          </motion.button>
        )}
      </div>
    </div>
  )
}