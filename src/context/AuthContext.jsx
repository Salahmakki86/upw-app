import { createContext, useContext, useState } from 'react'

const ADMIN_EMAIL = 'salah.prana@gmail.com'
const USERS_KEY   = 'upw-users'
const SESSION_KEY = 'upw-session'

// Encode/decode invite link (handles Arabic text)
export function encodeInvite(user) {
  return btoa(encodeURIComponent(JSON.stringify({
    id: user.id, name: user.name, email: user.email, password: user.password, role: user.role,
  })))
}

function decodeInvite(str) {
  return JSON.parse(decodeURIComponent(atob(str)))
}

// Check if URL contains an invite hash and seed localStorage before state init
function loadUsers() {
  let users = null
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (raw) users = JSON.parse(raw)
  } catch {}

  if (!users) {
    const admin = {
      id: 'admin',
      email: ADMIN_EMAIL,
      name: 'صالح',
      password: 'salah1234',
      role: 'admin',
      createdAt: new Date().toISOString(),
    }
    users = [admin]
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  // Process invite link from URL hash: #invite/BASE64
  try {
    const hash = window.location.hash
    if (hash.startsWith('#invite/')) {
      const encoded = hash.slice(8)
      const inviteUser = decodeInvite(encoded)
      if (inviteUser?.email && inviteUser?.password) {
        // Add user if not already exists
        if (!users.find(u => u.email.toLowerCase() === inviteUser.email.toLowerCase())) {
          users = [...users, { ...inviteUser, createdAt: inviteUser.createdAt || new Date().toISOString() }]
          localStorage.setItem(USERS_KEY, JSON.stringify(users))
        }
        // Clear hash from URL
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  } catch {}

  return users
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [users, setUsers]             = useState(loadUsers)
  const [currentUser, setCurrentUser] = useState(loadSession)

  const login = (email, password) => {
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim()
        && u.password === password.trim()
    )
    if (!user) return false
    setCurrentUser(user)
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return true
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  const addUser = ({ name, email, password }) => {
    const cleanEmail = email.trim().toLowerCase()
    if (users.find(u => u.email.toLowerCase() === cleanEmail)) return null
    const newUser = {
      id: 'user-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      role: 'student',
      createdAt: new Date().toISOString(),
    }
    const updated = [...users, newUser]
    setUsers(updated)
    saveUsers(updated)
    return newUser
  }

  const deleteUser = (id) => {
    if (id === 'admin') return
    const updated = users.filter(u => u.id !== id)
    setUsers(updated)
    saveUsers(updated)
    localStorage.removeItem('upw-state-' + id)
  }

  const updateUserPassword = (id, newPassword) => {
    const updated = users.map(u => u.id === id ? { ...u, password: newPassword.trim() } : u)
    setUsers(updated)
    saveUsers(updated)
    if (currentUser?.id === id) {
      const u = updated.find(x => x.id === id)
      setCurrentUser(u)
      localStorage.setItem(SESSION_KEY, JSON.stringify(u))
    }
  }

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, addUser, deleteUser, updateUserPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
