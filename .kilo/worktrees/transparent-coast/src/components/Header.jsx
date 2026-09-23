import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDarkMode } from '../context/DarkMode'
import { useAuth } from '../context/AuthContext'

export default function Header({ subtitle = 'Beranda', onMenuClick }) {
  const { isDark, toggle } = useDarkMode()
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  })

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-gutter-mobile flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors lg:hidden"
            aria-label="Buka menu navigasi"
            aria-expanded="false"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
          <img
            alt="NICU Care Logo"
            className="h-8 w-auto object-contain shrink-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLCpamkKFRUYK83Izxrq4Y_sPiz4_hatqgvlXNgap0O34dh9gZoMHpqc8exr5CnyaIKlaVUQES-BCg1PXmjlGEMoce76EfcKAOWwkZFsUXMQJJv2lXVASqC-Nj-bXu0b6M7dI1akHs16LLk55fwgIfxSnFIy8wE32_w95025ZgBxiVsoaQnlL8j_NoMghHWisi3mUD5wI0UAmEY59r5ZPpwSC1T1oRJQNyXtCpBzCVOqep9S-ZJNg7"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight truncate">NeoCare NICU</span>
              <span className="hidden sm:inline-block font-label-sm text-label-sm text-on-surface-variant font-normal">| {subtitle}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
                <span className="truncate max-w-[140px]">Ruang NICU - RS Ibu & Anak</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            aria-label="Toggle Dark Mode"
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors hidden lg:flex"
            type="button"
            onClick={toggle}
          >
            <span className="material-symbols-outlined text-[22px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button
            aria-label="Notifikasi Klinis"
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors relative hidden lg:flex"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface"></span>
          </button>
          <div className="relative" ref={profileRef}>
            <button
              aria-label="Profil Pengguna"
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
              type="button"
              onClick={() => setShowProfile(!showProfile)}
            >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              {profile?.avatar_url ? (
                <img alt={profile.full_name || 'User'} className="w-8 h-8 rounded-full object-cover" src={profile.avatar_url} />
              ) : (
                <span className="material-symbols-outlined text-on-primary text-[18px]">account_circle</span>
              )}
            </div>
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-outline-variant py-1 z-10">
              <div className="px-4 py-3 border-b border-outline-variant">
                <div className="font-label-sm text-label-sm text-on-surface font-semibold">{profile?.full_name || user?.email || 'dr. Sp.A'}</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">{profile?.role === 'admin' ? 'Admin Unit' : 'Petugas'}</div>
              </div>
              <Link to="/profil" className="block px-4 py-2 text-label-sm text-on-surface hover:bg-surface-container-high" onClick={() => setShowProfile(false)}>Profil & Pengaturan</Link>
              {isAdmin && <Link to="/akun" className="block px-4 py-2 text-label-sm text-on-surface hover:bg-surface-container-high" onClick={() => setShowProfile(false)}>Kelola Akun</Link>}
              <Link to="/rs-akun" className="block px-4 py-2 text-label-sm text-on-surface hover:bg-surface-container-high" onClick={() => setShowProfile(false)}>RS & Akun</Link>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  await signOut()
                  setShowProfile(false)
                  navigate('/login')
                }}
              >
                <button type="submit" className="w-full text-left px-4 py-2 text-label-sm text-on-surface hover:bg-surface-container-high">
                  Keluar
                </button>
              </form>
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  )
}