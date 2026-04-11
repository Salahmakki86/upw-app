const API = import.meta.env.DEV ? 'http://localhost:3001' : 'https://salahmakki.app'

function getToken() { return localStorage.getItem('upw-token') }
function setToken(token) {
  if (token) localStorage.setItem('upw-token', token)
  else localStorage.removeItem('upw-token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${API}/api/upw${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const upwApi = {
  // Auth
  login:  async (email, password) => {
    const data = await request('/auth/login', { method: 'POST', body: { email, password } })
    setToken(data.token)
    return data // { token, user, hasData }
  },
  logout: () => setToken(null),

  // Sync
  getState:  ()      => request('/sync'),
  saveState: (state) => request('/sync', { method: 'POST', body: { state } }),

  // Admin — users
  getUsers:       ()       => request('/admin/users'),
  createUser:     (data)   => request('/admin/users',               { method: 'POST',   body: data }),
  deleteUser:     (id)     => request(`/admin/users/${id}`,         { method: 'DELETE' }),
  updatePassword: (id, pw) => request(`/admin/users/${id}/password`,{ method: 'PATCH',  body: { password: pw } }),

  // Admin — progress dashboard
  getProgress: () => request('/admin/progress'),

  // Admin — messages
  sendMessage: (toUserId, body) => request('/admin/messages', { method: 'POST', body: { toUserId, body } }),

  // Push notifications
  getVapidKey:    ()    => request('/push/vapid'),
  subscribePush:  (sub) => request('/push/subscribe',   { method: 'POST',   body: { subscription: sub } }),
  unsubscribePush:()    => request('/push/unsubscribe',  { method: 'DELETE' }),

  // Messages (student)
  getMessages:     ()   => request('/messages'),
  markMessageRead: (id) => request(`/messages/${id}/read`, { method: 'PATCH' }),
}
