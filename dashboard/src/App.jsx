import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const emptyRule = { attribute: '', value: '' }

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('ff_token') || '')
  const [flags, setFlags] = useState([])
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [loading, setLoading] = useState(false)
  const [login, setLogin] = useState({ username: '', password: '' })
  const [form, setForm] = useState({
    name: '',
    type: 'boolean',
    enabled: false,
    rolloutPercentage: 0,
    rules: [emptyRule]
  })
  const [editingName, setEditingName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [apiKeyLoading, setApiKeyLoading] = useState(false)
  const [apiKeyError, setApiKeyError] = useState('')

  const isAuthed = Boolean(token)

  const sortedFlags = useMemo(() => {
    return [...flags].sort((a, b) => a.name.localeCompare(b.name))
  }, [flags])

  useEffect(() => {
    if (isAuthed) {
      fetchFlags()
    }
  }, [isAuthed])

  function setNotice(type, message) {
    setStatus({ type, message })
  }

  function resetForm() {
    setEditingName('')
    setForm({
      name: '',
      type: 'boolean',
      enabled: false,
      rolloutPercentage: 0,
      rules: [emptyRule]
    })
  }

  async function fetchFlags() {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/flags`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to load flags')
      }
      const data = await response.json()
      setFlags(data)
    } catch (err) {
      setNotice('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loginSubmit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: login.username,
          password: login.password
        })
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      const data = await response.json()
      localStorage.setItem('ff_token', data.token)
      setToken(data.token)
      setNotice('success', 'Welcome back')
      setLogin({ username: '', password: '' })
    } catch (err) {
      setNotice('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('ff_token')
    setToken('')
    setFlags([])
    resetForm()
    setApiKey('')
    setApiKeyVisible(false)
    setApiKeyError('')
  }

  async function toggleApiKey() {
    if (apiKeyVisible) {
      setApiKeyVisible(false)
      return
    }

    if (apiKey) {
      setApiKeyVisible(true)
      return
    }

    setApiKeyLoading(true)
    setApiKeyError('')
    try {
      const response = await fetch(`${API_BASE}/auth/api-keys/rotate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to rotate API key')
      }

      const data = await response.json()
      setApiKey(data.apiKey || '')
      setApiKeyVisible(true)
    } catch (err) {
      setApiKeyError(err.message)
    } finally {
      setApiKeyLoading(false)
    }
  }

  async function saveFlag(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        enabled: Boolean(form.enabled),
        rolloutPercentage: Number(form.rolloutPercentage) || 0,
        rules: form.rules
      }

      if (!payload.name) {
        throw new Error('Flag name is required')
      }

      const url = editingName
        ? `${API_BASE}/flags/${encodeURIComponent(editingName)}`
        : `${API_BASE}/flags`

      const response = await fetch(url, {
        method: editingName ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Save failed')
      }

      await fetchFlags()
      resetForm()
      setNotice('success', editingName ? 'Flag updated' : 'Flag created')
    } catch (err) {
      setNotice('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  function startEdit(flag) {
    setEditingName(flag.name)
    setForm({
      name: flag.name,
      type: flag.type,
      enabled: flag.enabled,
      rolloutPercentage: flag.rolloutPercentage || 0,
      rules: flag.rules && flag.rules.length ? flag.rules : [emptyRule]
    })
  }

  async function toggleFlag(flagName) {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/flags/${encodeURIComponent(flagName)}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Toggle failed')
      }

      await fetchFlags()
    } catch (err) {
      setNotice('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteFlag(flagName) {
    const confirmed = window.confirm(`Delete ${flagName}?`)
    if (!confirmed) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/flags/${encodeURIComponent(flagName)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Delete failed')
      }

      await fetchFlags()
      if (editingName === flagName) {
        resetForm()
      }
    } catch (err) {
      setNotice('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  function updateFormField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function updateRule(index, field, value) {
    const nextRules = form.rules.map((rule, idx) => {
      if (idx !== index) return rule
      return { ...rule, [field]: value }
    })
    setForm((prev) => ({ ...prev, rules: nextRules }))
  }

  function addRule() {
    setForm((prev) => ({ ...prev, rules: [...prev.rules, emptyRule] }))
  }

  function removeRule(index) {
    const nextRules = form.rules.filter((_, idx) => idx !== index)
    setForm((prev) => ({ ...prev, rules: nextRules.length ? nextRules : [emptyRule] }))
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Feature Flag Studio</p>
          <h1>Ship safer. Toggle faster.</h1>
          <p className="subtitle">Manage flags, rollouts, and segments in one bold control room.</p>
        </div>
        <div className="status">
          <span className={`pill ${isAuthed ? 'ok' : 'idle'}`}>
            {isAuthed ? 'Authenticated' : 'Not signed in'}
          </span>
          {isAuthed && (
            <button type="button" className="ghost" onClick={logout}>
              Sign out
            </button>
          )}
        </div>
      </header>

      {!isAuthed ? (
        <section className="login">
          <div className="panel glow">
            <h2>Admin access</h2>
            <p>Use your dashboard credentials to get a secure token.</p>
            <form onSubmit={loginSubmit} className="form">
              <label>
                Username
                <input
                  type="text"
                  value={login.username}
                  onChange={(event) => setLogin({ ...login, username: event.target.value })}
                  placeholder="admin"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={login.password}
                  onChange={(event) => setLogin({ ...login, password: event.target.value })}
                  placeholder="********"
                  required
                />
              </label>
              <button type="submit" className="primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            {status.message && (
              <div className={`notice ${status.type}`}>{status.message}</div>
            )}
          </div>
          <div className="panel light">
            <h3>Server setup</h3>
            <ul>
              <li>Set ADMIN_USERNAME and ADMIN_PASSWORD in the server .env</li>
              <li>Set JWT_SECRET to enable token signing</li>
              <li>Use the same API base as the server (default :3001)</li>
            </ul>
          </div>
        </section>
      ) : (
        <section className="workspace">
          <div className="panel form-panel">
            <div className="panel-header">
              <div>
                <h2>{editingName ? 'Edit flag' : 'Create flag'}</h2>
                <p>Define behavior with types, rollouts, or segments.</p>
              </div>
              {editingName && (
                <button type="button" className="ghost" onClick={resetForm}>
                  New flag
                </button>
              )}
            </div>
            <form onSubmit={saveFlag} className="form">
              <label>
                Flag name
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateFormField('name', event.target.value)}
                  placeholder="new-checkout"
                  required
                />
              </label>
              <div className="grid">
                <label>
                  Type
                  <select
                    value={form.type}
                    onChange={(event) => updateFormField('type', event.target.value)}
                  >
                    <option value="boolean">Boolean</option>
                    <option value="percentage">Percentage</option>
                    <option value="segment">Segment</option>
                  </select>
                </label>
                <label>
                  Rollout %
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.rolloutPercentage}
                    onChange={(event) => updateFormField('rolloutPercentage', event.target.value)}
                    disabled={form.type !== 'percentage'}
                  />
                </label>
              </div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(event) => updateFormField('enabled', event.target.checked)}
                />
                Enable flag
              </label>

              <div className="rules">
                <div className="rules-header">
                  <div>
                    <h3>Segment rules</h3>
                    <p>Match user attributes when type is segment.</p>
                  </div>
                  <button type="button" className="ghost" onClick={addRule}>
                    Add rule
                  </button>
                </div>
                {form.rules.map((rule, index) => (
                  <div className="rule-row" key={`${rule.attribute}-${index}`}>
                    <input
                      type="text"
                      placeholder="attribute (plan)"
                      value={rule.attribute}
                      onChange={(event) => updateRule(index, 'attribute', event.target.value)}
                      disabled={form.type !== 'segment'}
                    />
                    <input
                      type="text"
                      placeholder="value (pro)"
                      value={rule.value}
                      onChange={(event) => updateRule(index, 'value', event.target.value)}
                      disabled={form.type !== 'segment'}
                    />
                    <button
                      type="button"
                      className="ghost danger"
                      onClick={() => removeRule(index)}
                      disabled={form.rules.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button type="submit" className="primary" disabled={loading}>
                {loading ? 'Saving...' : editingName ? 'Update flag' : 'Create flag'}
              </button>
              {status.message && (
                <div className={`notice ${status.type}`}>{status.message}</div>
              )}
            </form>
          </div>

          <div className="panel api-panel">
            <div className="panel-header">
              <div>
                <h2>API key</h2>
                <p>Rotate and reveal the current key.</p>
              </div>
              <button
                type="button"
                className="ghost"
                onClick={toggleApiKey}
                disabled={apiKeyLoading}
              >
                {apiKeyLoading ? 'Working...' : apiKeyVisible ? 'Hide' : apiKey ? 'Show' : 'Generate'}
              </button>
            </div>
            <div className="api-key-box">
              {apiKeyVisible ? (
                <code>{apiKey || 'No key yet.'}</code>
              ) : (
                <span className="muted">Key hidden</span>
              )}
            </div>
            {apiKeyError && <div className="notice error">{apiKeyError}</div>}
            <p className="muted api-hint">Rotating the key invalidates the previous one.</p>
          </div>

          <div className="panel list-panel">
            <div className="panel-header">
              <div>
                <h2>Flags</h2>
                <p>{loading ? 'Refreshing...' : `${sortedFlags.length} total flags`}</p>
              </div>
              <button type="button" className="ghost" onClick={fetchFlags}>
                Refresh
              </button>
            </div>

            <div className="flag-grid">
              {sortedFlags.map((flag) => (
                <article className="flag-card" key={flag._id || flag.name}>
                  <div className="card-head">
                    <div>
                      <h3>{flag.name}</h3>
                      <p className="muted">{flag.type} flag</p>
                    </div>
                    <span className={`pill ${flag.enabled ? 'ok' : 'idle'}`}>
                      {flag.enabled ? 'Live' : 'Off'}
                    </span>
                  </div>

                  <div className="card-body">
                    {flag.type === 'percentage' && (
                      <div className="meter">
                        <span>Rollout</span>
                        <div className="bar">
                          <div style={{ width: `${flag.rolloutPercentage || 0}%` }}></div>
                        </div>
                        <span>{flag.rolloutPercentage || 0}%</span>
                      </div>
                    )}

                    {flag.type === 'segment' && (
                      <div className="rules-list">
                        {(flag.rules || []).length ? (
                          (flag.rules || []).map((rule, idx) => (
                            <span key={`${rule.attribute}-${idx}`}>
                              {rule.attribute}:{rule.value}
                            </span>
                          ))
                        ) : (
                          <span className="muted">No rules set</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    <button type="button" className="ghost" onClick={() => startEdit(flag)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => toggleFlag(flag.name)}
                    >
                      {flag.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      className="ghost danger"
                      onClick={() => deleteFlag(flag.name)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default App
