import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Copy, Eye, EyeOff, Trash2, Edit2, Plus, RefreshCw, LogOut, Flag, Key, Zap, ExternalLink } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const emptyRule = { attribute: '', value: '' }

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('ff_token') || '')
  const [flags, setFlags] = useState([])
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [loading, setLoading] = useState(false)
  const [login, setLogin] = useState({ email: '', password: '' })
  const [authMode, setAuthMode] = useState('login')
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
  const [registerStatus, setRegisterStatus] = useState({ type: 'idle', message: '' })
  const [verifyToken, setVerifyToken] = useState('')
  const [verifyStatus, setVerifyStatus] = useState({ type: 'idle', message: '' })
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [apiKeyCopied, setApiKeyCopied] = useState(false)
  const [activeMenu, setActiveMenu] = useState('flags')

  const isAuthed = Boolean(token)

  const sortedFlags = useMemo(() => {
    return [...flags].sort((a, b) => a.name.localeCompare(b.name))
  }, [flags])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const onVerifyRoute = window.location.pathname.includes('/verify-email')
    if (onVerifyRoute) {
      if (!token) {
        setVerifyStatus({ type: 'error', message: 'Verification token is missing.' })
      } else {
        setVerifyToken(token)
        verifyEmail(token)
      }
    }
  }, [])

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
          email: login.email,
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
      setLogin({ email: '', password: '' })
    } catch (err) {
      setNotice('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  async function registerSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setRegisterStatus({ type: 'idle', message: '' })
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: login.email,
          password: login.password
        })
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Registration failed')
      }

      const data = await response.json()
      if (data.apiKey) {
        setApiKey(data.apiKey)
        setApiKeyVisible(true)
      }
      setRegisterStatus({ type: 'success', message: 'Registered. Verify your email, then sign in.' })
    } catch (err) {
      setRegisterStatus({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function verifyEmail(token) {
    setVerifyLoading(true)
    setVerifyStatus({ type: 'idle', message: '' })
    try {
      const response = await fetch(`${API_BASE}/auth/verify-email?token=${encodeURIComponent(token)}`)
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Verification failed')
      }
      setVerifyStatus({ type: 'success', message: 'Email verified. You can sign in.' })
    } catch (err) {
      setVerifyStatus({ type: 'error', message: err.message })
    } finally {
      setVerifyLoading(false)
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
    setRegisterStatus({ type: 'idle', message: '' })
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

  const onVerifyRoute = window.location.pathname.includes('/verify-email')

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    setApiKeyCopied(true)
    setTimeout(() => setApiKeyCopied(false), 2000)
  }

  if (onVerifyRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
            <p className="text-muted-foreground mt-2">We're confirming your account setup</p>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <Button
                type="button"
                onClick={() => verifyEmail(verifyToken)}
                disabled={verifyLoading || !verifyToken}
                className="w-full h-11"
              >
                {verifyLoading ? 'Verifying...' : 'Confirm'}
              </Button>
              {verifyStatus.message && (
                <div className={`rounded-lg px-4 py-3 text-sm font-medium ${verifyStatus.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  {verifyStatus.message}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => {
                  window.location.href = '/'
                }}
              >
                Back to login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-16 flex items-center justify-between gap-8">
            {/* Left: Logo & Branding */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-4 rounded-md bg-primary/60"></div>
              </div>
              <div className="flex flex-col gap-0.5">
                <h1 className="text-sm font-bold text-foreground leading-tight">Feature Flag</h1>
                <p className="text-xs text-muted-foreground">Control Releases</p>
              </div>
            </div>

            {/* Right: Status & Actions */}
            {isAuthed && (
              <div className="flex items-center gap-3 ml-auto">
                {/* Status Indicator */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-700">Live</span>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-6 bg-border"></div>

                {/* Sign Out Button */}
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {!isAuthed ? (
        /* Auth View */
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {authMode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-muted-foreground">
                {authMode === 'login'
                  ? 'Sign in to manage your feature flags'
                  : 'Get started with your own workspace'}
              </p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-5">
                <form onSubmit={authMode === 'login' ? loginSubmit : registerSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email address</label>
                    <input
                      type="email"
                      value={login.email}
                      onChange={(event) => setLogin({ ...login, email: event.target.value })}
                      placeholder="you@company.com"
                      required
                      className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <input
                      type="password"
                      value={login.password}
                      onChange={(event) => setLogin({ ...login, password: event.target.value })}
                      placeholder="••••••••"
                      required
                      className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 mt-6" disabled={loading}>
                    {loading
                      ? authMode === 'login' ? 'Signing in...' : 'Creating account...'
                      : authMode === 'login' ? 'Sign in' : 'Create account'}
                  </Button>
                </form>

                {status.message && authMode === 'login' && (
                  <div className={`rounded-lg px-4 py-3 text-sm font-medium border ${status.type === 'error'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {status.message}
                  </div>
                )}

                {registerStatus.message && authMode === 'register' && (
                  <div className={`rounded-lg px-4 py-3 text-sm font-medium border ${registerStatus.type === 'error'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {registerStatus.message}
                  </div>
                )}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-background text-muted-foreground">or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                >
                  {authMode === 'login' ? 'Create a new account' : 'Sign in instead'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Dashboard View */
        <div className="flex h-[calc(100vh-64px)]">
          {/* Left Sidebar */}
          <aside className="w-64 border-r border-border bg-muted/30 overflow-y-auto">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => setActiveMenu('create')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                  activeMenu === 'create'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Zap className="w-5 h-5" />
                Create Flag
              </button>
              <button
                onClick={() => setActiveMenu('api-keys')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                  activeMenu === 'api-keys'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Key className="w-5 h-5" />
                API Keys
              </button>
              <button
                onClick={() => setActiveMenu('flags')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                  activeMenu === 'flags'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Flag className="w-5 h-5" />
                Flags
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-8 py-8">
              {/* Create Flag Section */}
              {activeMenu === 'create' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      {editingName ? 'Edit flag' : 'Create flag'}
                    </CardTitle>
                    <CardDescription>Configure rollout strategies and targeting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={saveFlag} className="space-y-6 max-w-2xl">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Flag name</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(event) => updateFormField('name', event.target.value)}
                          placeholder="e.g., new-checkout-experience"
                          required
                          className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Flag type</label>
                          <select
                            value={form.type}
                            onChange={(event) => updateFormField('type', event.target.value)}
                            className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="boolean">Boolean (On/Off)</option>
                            <option value="percentage">Percentage (Gradual rollout)</option>
                            <option value="segment">Segment (Targeted users)</option>
                          </select>
                        </div>
                        {form.type === 'percentage' && (
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">Rollout percentage</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={form.rolloutPercentage}
                              onChange={(event) => updateFormField('rolloutPercentage', event.target.value)}
                              className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </div>
                        )}
                      </div>

                      <label className="flex items-center gap-3 p-4 rounded-lg border border-input hover:bg-muted/50 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={form.enabled}
                          onChange={(event) => updateFormField('enabled', event.target.checked)}
                          className="w-5 h-5 rounded border border-input"
                        />
                        <span className="font-medium text-foreground">Enable this flag</span>
                      </label>

                      {form.type === 'segment' && (
                        <div className="space-y-4 p-4 rounded-lg border border-input bg-muted/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">Segment rules</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">Target specific users by attributes</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addRule} className="gap-1">
                              <Plus className="w-3 h-3" />
                              Add
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {form.rules.map((rule, index) => (
                              <div className="flex gap-3" key={`${rule.attribute}-${index}`}>
                                <input
                                  type="text"
                                  placeholder="Attribute (e.g., plan, tier)"
                                  value={rule.attribute}
                                  onChange={(event) => updateRule(index, 'attribute', event.target.value)}
                                  className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                                <input
                                  type="text"
                                  placeholder="Value (e.g., premium)"
                                  value={rule.value}
                                  onChange={(event) => updateRule(index, 'value', event.target.value)}
                                  className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeRule(index)}
                                  disabled={form.rules.length === 1}
                                  className="gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button type="submit" className="flex-1 h-11" disabled={loading}>
                          {loading ? 'Saving...' : editingName ? 'Update flag' : 'Create flag'}
                        </Button>
                        {editingName && (
                          <Button variant="outline" type="button" onClick={resetForm} className="flex-1 h-11">
                            New Flag
                          </Button>
                        )}
                      </div>

                      {status.message && (
                        <div className={`rounded-lg px-4 py-3 text-sm font-medium border ${status.type === 'error'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {status.message}
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* API Keys Section */}
              {activeMenu === 'api-keys' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      API Keys
                    </CardTitle>
                    <CardDescription>Manage and rotate your API keys for SDK authentication</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 max-w-2xl">
                    <div className="p-6 rounded-lg border border-input bg-muted/30">
                      <h3 className="font-semibold text-foreground mb-4">Current API Key</h3>
                      <div className="space-y-4">
                        <div className="relative rounded-lg border border-input bg-background p-4">
                          <div className="font-mono text-sm text-foreground break-all">
                            {apiKeyVisible ? (apiKey || 'Generate a key') : '••••••••••••••••'}
                          </div>
                          {apiKeyVisible && apiKey && (
                            <button
                              onClick={() => copyToClipboard(apiKey)}
                              className="absolute top-2 right-2 p-2 rounded hover:bg-muted transition"
                            >
                              {apiKeyCopied ? (
                                <span className="text-xs font-medium text-emerald-700">Copied!</span>
                              ) : (
                                <Copy className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={toggleApiKey}
                            disabled={apiKeyLoading}
                          >
                            {apiKeyVisible ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                Hide Key
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                Show Key
                              </>
                            )}
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={toggleApiKey}
                            disabled={apiKeyLoading}
                          >
                            {apiKeyLoading ? 'Rotating...' : 'Rotate Key'}
                          </Button>
                        </div>
                        {apiKeyError && (
                          <div className="rounded-lg bg-red-50 text-red-700 border border-red-200 p-3 text-sm font-medium">
                            {apiKeyError}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          All API keys are rotated with a 24-hour grace period. The previous key will continue working until the grace period expires.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Flags Section */}
              {activeMenu === 'flags' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Flag className="w-5 h-5" />
                          Flags
                        </CardTitle>
                        <CardDescription>{sortedFlags.length} flag{sortedFlags.length !== 1 ? 's' : ''}</CardDescription>
                      </div>
                      <Button variant="outline" onClick={fetchFlags} size="sm" className="gap-2" disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sortedFlags.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No flags yet. Create one from the Create Flag menu.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedFlags.map((flag) => (
                          <div key={flag._id || flag.name} className="flex items-center justify-between p-4 rounded-lg border border-input hover:bg-muted/50 transition">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-foreground">{flag.name}</h3>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  flag.enabled
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-muted text-muted-foreground border-input'
                                }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${flag.enabled ? 'bg-emerald-600' : 'bg-muted-foreground'}`}></div>
                                  {flag.enabled ? 'Live' : 'Off'}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="capitalize">{flag.type} flag</span>
                                {flag.type === 'percentage' && <span>• {flag.rolloutPercentage}% rollout</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => {
                                startEdit(flag)
                                setActiveMenu('create')
                              }} className="gap-1">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => toggleFlag(flag.name)} className="gap-1">
                                {flag.enabled ? 'Disable' : 'Enable'}
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => deleteFlag(flag.name)} className="gap-1">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      )}
      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
              </div>
              <span className="text-sm font-semibold text-foreground">Feature Flag</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">GitHub</span>
              </a>
            </div>
            
            <p className="text-xs text-muted-foreground">
              © 2026 <span className="font-semibold">FeatureFlag</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
