import { createContext, useContext, useState, useEffect } from 'react'
import { upwApi } from '../api/upwApi'

const SESSION_KEY = 'upw-session'

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadSession)
  const [users,       setUsers]       = useState([])
  const [loadingAuth, setLoadingAuth] = useState(false)

  // Load users list if admin
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      upwApi.getUsers().then(setUsers).catch(() => {})
    }
  }, [currentUser])

  const login = async (email, password) => {
    setLoadingAuth(true)
    try {
      const data = await upwApi.login(email, password)
      const user = data.user
      setCurrentUser(user)
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
      return { ok: true, user, hasData: data.hasData }
    } catch (err) {
      return { ok: false, error: err.message }
    } finally {
      setLoadingAuth(false)
    }
  }

  const logout = () => {
    upwApi.logout()
    setCurrentUser(null)
    setUsers([])
    localStorage.removeItem(SESSION_KEY)
  }

  const addUser = async ({ name, email, password }) => {
    try {
      const newUser = await upwApi.createUser({ name, email, password })
      const updated = [...users, newUser]
      setUsers(updated)
      return newUser
    } catch (err) {
      return { error: err.message }
    }
  }

  const deleteUser = async (id) => {
    try {
      await upwApi.deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {}
  }

  const refreshUsers = async () => {
    try {
      const list = await upwApi.getUsers()
      setUsers(list)
    } catch {}
  }

  return (
    <AuthContext.Provider value={{
      currentUser, users, loadingAuth,
      login, logout, addUser, deleteUser, refreshUsers,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
