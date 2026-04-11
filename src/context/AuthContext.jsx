import { createContext, useContext, useState } from 'react'

const ADMIN_EMAIL = 'salah.prana@gmail.com'
const USERS_KEY   = 'upw-users'
const SESSION_KEY = 'upw-session'

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const admin = {
    id: 'admin',
    email: ADMIN_EMAIL,
    name: 'صالح',
    password: 'salah1234',
    role: 'admin',
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(USERS_KEY, JSON.stringify([admin]))
  return [admin]
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
  const [users, setUsers]           = useState(loadUsers)
  const [currentUser, setCurrentUser] = useState(loadSession)

  const login = (email, password) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
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
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return null
    const newUser = {
      id: 'user-' + Date.now(),
      name,
      email,
      password,
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
    const updated = users.map(u => u.id === id ? { ...u, password: newPassword } : u)
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
