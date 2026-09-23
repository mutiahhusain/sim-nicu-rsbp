import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDarkMode } from '../context/DarkMode'

const allItems = [
  { path: '/', label: 'Beranda', icon: 'monitoring', adminOnly: true },
  { path: '/pasien', label: 'Pasien', icon: 'format_list_bulleted', adminOnly: true },
  { path: '/laporan', label: 'Laporan', icon: 'description', adminOnly: false },
  { path: '/rs-akun', label: 'RS & Akun', icon: 'local_hospital', adminOnly: true },
  { path: '/akun', label: 'Kelola Akun', icon: 'manage_accounts', adminOnly: true },
]

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin, signOut } = useAuth()
  const { isDark, toggle } = useDarkMode()
  const location = useLocation()
  const navigate = useNavigate()

  const items = isAdmin ? allItems : allItems.filter((i) => !i.adminOnly)
  const isInactive = (item) => location.pathname !== item.path

  const handleSignOut = async () => {
    await signOut()
    onClose()
    navigate('/login')
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-surface border-r border-outline-variant transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigasi utama"
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-outline-variant">
            <div className="flex items-center gap-3">
              <img
                alt="NICU Care Logo"
                className="h-10 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLCpamkKFRUYK83Izxrq4Y_sPiz4_hatqgvlXNgap0O34dh9gZoMHpqc8exr5CnyaIKlaVUQES-BCg1PXmjlGEMoce76EfcKAOWwkZFsUXMQJJv2lXVASqC-Nj-bXu0b6M7dI1akHs16LLk55fwgIfxSnFIy8wE32_w95025ZgBxiVsoaQnlL8j_NoMghHWisi3mUD5wI0UAmEY59r5ZPpwSC1T1oRJQNyXtCpBzCVOqep9S-ZJNg7"
              />
              <span className="font-headline-sm text-headline-sm text-primary truncate">NeoCare NICU</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Menu utama">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isInactive(item)
                    ? 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    : 'bg-primary-container text-on-primary font-medium'
                }`}
                aria-current={isInactive(item) ? undefined : 'page'}
              >
                <span className="material-symbols-outlined text-[22px] shrink-0">{item.icon}</span>
                <span className="font-label-md text-label-md truncate">{item.label}</span>
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-outline-variant">
              <Link
                to="/profil"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[22px] shrink-0">account_circle</span>
                <span className="font-label-md text-label-md">Profil & Pengaturan</span>
              </Link>
            </div>
          </nav>

          <div className="p-3 border-t border-outline-variant space-y-2">
            <button
              type="button"
              onClick={toggle}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[22px] shrink-0">{isDark ? 'light_mode' : 'dark_mode'}</span>
              <span className="font-label-md text-label-md">{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-[22px] shrink-0">logout</span>
              <span className="font-label-md text-label-md">Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}