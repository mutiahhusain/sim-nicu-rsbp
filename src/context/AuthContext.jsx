import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import supabase from '../lib/supabaseClient'

const AuthContext = createContext()

const ADMIN_ROLE = ['admin']
const INACTIVITY_TIMEOUT = 5 * 60 * 1000

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const timeoutRef = useRef(null)
  const signOutRef = useRef(null)

  const signOut = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign out error:', error.message)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setUser(null)
    setSession(null)
    setProfile(null)
  }, [])

  const resetInactivityTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (user) {
      timeoutRef.current = setTimeout(() => {
        signOutRef.current?.()
      }, INACTIVITY_TIMEOUT)
    }
  }, [user])

  useEffect(() => {
    signOutRef.current = signOut
  }, [signOut])

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click']

    const handleActivity = () => {
      resetInactivityTimer()
    }

    events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }))
    resetInactivityTimer()

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity))
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [resetInactivityTimer])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !user) {
      setProfile(null)
      return
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load profile:', error.message)
      }
      setProfile(data ?? { id: user.id, full_name: user.user_metadata?.full_name ?? null, role: 'user', avatar_url: null })
    }

    fetchProfile()
  }, [user])

  const signIn = async ({ email, password }) => {
    if (!supabase) throw new Error('Supabase belum terkonfigurasi.')
    const {
      data: { session, user },
      error,
    } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setSession(session)
    setUser(user)
    return true
  }

  const signUp = async ({ email, password, fullName }) => {
    if (!supabase) throw new Error('Supabase belum terkonfigurasi.')
    const {
      data: { session, user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    if (session) {
      setSession(session)
      setUser(user)
    }
    return true
  }

  const isAdmin = ADMIN_ROLE.includes(profile?.role)

  const value = {
    user,
    session,
    profile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
