import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useParams } from 'react-router-dom'
import './App.css'

const API_BASE = import.meta.env.VITE_PUBLIC_API_BASE || 'http://localhost:3000/profile'

// Host shown in the sidebar badge, derived from the configured API base.
const API_HOST = (() => {
  try {
    return new URL(API_BASE).host
  } catch {
    return API_BASE
  }
})()

// ─── Reusable Components ──────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`toast toast-${type}`}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  )
}

function Spinner() {
  return <div className="spinner" />
}

// ─── Page: All Users (GET /profile/all) ──────────────────────────────────────

function AllUsersPage({ showToast }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/all`)
      const json = await res.json()
      setUsers(json.data || [])
    } catch {
      showToast('Failed to fetch users', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        showToast('User deleted successfully', 'success')
        fetchUsers()
      } else {
        showToast(json.message, 'error')
      }
    } catch {
      showToast('Failed to delete user', 'error')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Users</h1>
          <p className="page-subtitle">
            <span className="badge">{users.length} records</span>
            &nbsp;fetched via <code>GET /profile/all</code>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/create')}>
          + New User
        </button>
      </div>

      {loading ? (
        <div className="center-box"><Spinner /></div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p>No users found. Create one!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><span className="id-chip">{String(u.id).slice(0, 8)}…</span></td>
                  <td>{u.name || '—'}</td>
                  <td>{u.email || '—'}</td>
                  <td>
                    <div className="action-group">
                      <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/user/${u.id}`)}>View</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/edit/${u.id}`)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Page: View User (GET /profile/:id) ──────────────────────────────────────

function ViewUserPage({ showToast }) {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_BASE}/${id}`)
        const json = await res.json()
        if (json.success) setUser(json.data)
        else showToast(json.message, 'error')
      } catch {
        showToast('Failed to fetch user', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [id])

  if (loading) return <div className="page center-box"><Spinner /></div>

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Profile</h1>
          <p className="page-subtitle"><code>GET /profile/{id}</code></p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(`/edit/${id}`)}>Edit User</button>
      </div>

      {user ? (
        <div className="card detail-card">
          <div className="avatar">{(user.name || 'U').charAt(0).toUpperCase()}</div>
          <div className="detail-grid">
            {Object.entries(user).map(([key, val]) => (
              <div className="detail-row" key={key}>
                <span className="detail-label">{key}</span>
                <span className="detail-value">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state"><p>User not found.</p></div>
      )}
    </div>
  )
}

// ─── Page: Create User (POST /profile/all) ────────────────────────────────────

function CreateUserPage({ showToast }) {
  const [form, setForm] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        showToast('User created successfully!', 'success')
        navigate('/')
      } else {
        showToast(json.message, 'error')
      }
    } catch {
      showToast('Failed to create user', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create User</h1>
          <p className="page-subtitle"><code>POST /profile/all</code></p>
        </div>
      </div>
      <div className="card form-card">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <><Spinner /> Creating…</> : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Page: Edit User (PUT /profile/:id) ──────────────────────────────────────

function EditUserPage({ showToast }) {
  const { id } = useParams()
  const [form, setForm] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_BASE}/${id}`)
        const json = await res.json()
        if (json.success) setForm({ name: json.data.name || '', email: json.data.email || '' })
        else showToast(json.message, 'error')
      } catch {
        showToast('Failed to load user', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        showToast('User updated successfully!', 'success')
        navigate('/')
      } else {
        showToast(json.message, 'error')
      }
    } catch {
      showToast('Failed to update user', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page center-box"><Spinner /></div>

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit User</h1>
          <p className="page-subtitle"><code>PUT /profile/{id}</code></p>
        </div>
      </div>
      <div className="card form-card">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
            {saving ? <><Spinner /> Saving…</> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── 404 Page ─────────────────────────────────────────────────────────────────

function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="page center-box">
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h2>404 — Page Not Found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
      </div>
    </div>
  )
}

// ─── Layout & Nav ─────────────────────────────────────────────────────────────

function Layout({ children, toast, clearToast }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">UserHub</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span>👥</span> All Users
          </NavLink>
          <NavLink to="/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span>➕</span> Create User
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="api-badge">
            <span className="api-dot" />
            <span>API: {API_HOST}</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
        {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      </main>
    </div>
  )
}

// ─── App Root ─────────────────────────────────────────────────────────────────

function App() {
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })
  const clearToast = () => setToast(null)

  return (
    <BrowserRouter>
      <Layout toast={toast} clearToast={clearToast}>
        <Routes>
          <Route path="/"          element={<AllUsersPage  showToast={showToast} />} />
          <Route path="/user/:id"  element={<ViewUserPage  showToast={showToast} />} />
          <Route path="/create"    element={<CreateUserPage showToast={showToast} />} />
          <Route path="/edit/:id"  element={<EditUserPage  showToast={showToast} />} />
          <Route path="*"          element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

console.log("ANGITH")