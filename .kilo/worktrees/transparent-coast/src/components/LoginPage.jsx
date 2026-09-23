import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError('')
    try {
      if (mode === 'signin') {
        await signIn({ email, password })
      } else {
        await signUp({ email, password, fullName })
      }
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err?.message || err?.error_description || 'Terjadi kesalahan.'
      setSubmitError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex justify-center">
            <span className="material-symbols-outlined text-[44px] text-primary">local_hospital</span>
          </div>
          <h1 className="mt-2 font-headline-sm text-headline-sm text-on-surface">NeoCare NICU</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Sistem informasi rawat NICU</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="full-name">Nama Lengkap</label>
              <input
                id="full-name"
                className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
                placeholder="Nama lengkap"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email</label>
            <input
              id="email"
              className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
              placeholder="nama@email.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
            <input
              id="password"
              className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
              placeholder="••••••••"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {submitError && <p className="font-label-sm text-label-sm text-error">{submitError}</p>}

          <button
            className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-shadow shadow-[0_2px_8px_rgba(14,116,144,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : null}
            {mode === 'signin' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <p className="text-center font-label-sm text-label-sm text-on-surface-variant">
          {mode === 'signin' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
          <button
            className="font-semibold text-primary hover:underline"
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </div>
    </div>
  )
}
