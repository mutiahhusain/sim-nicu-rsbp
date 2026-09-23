import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const allItems = [
  { path: '/', label: 'Beranda', icon: 'monitoring', adminOnly: true },
  { path: '/pasien', label: 'Pasien', icon: 'format_list_bulleted', adminOnly: true },
  { path: '/tambah-pasien', label: '+ Pasien', icon: 'add', adminOnly: true, floating: true },
  { path: '/laporan', label: 'Laporan', icon: 'description', adminOnly: false },
  { path: '/rs-akun', label: 'RS & Akun', icon: 'local_hospital', adminOnly: true },
]

export default function BottomNav() {
  const { isAdmin } = useAuth()
  const location = useLocation()

  const items = isAdmin ? allItems : allItems.filter((i) => !i.adminOnly)
  const isInactive = (item) => location.pathname !== item.path

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/80 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)] lg:hidden">
      <div className="flex justify-around items-center h-16 px-2 relative">
        {items.map((item) => {
          if (item.floating) {
            return (
              <div key={item.path} className="flex-1 flex flex-col items-center justify-center h-full min-w-[56px] relative">
                <Link
                  className="-top-4 absolute w-12 h-12 rounded-full bg-primary-container text-on-primary shadow-[0_4px_10px_rgba(14,116,144,0.35)] flex items-center justify-center hover:bg-primary transition-all active:scale-95"
                  to={item.path}
                >
                  <span className="material-symbols-outlined text-[26px]">{item.icon}</span>
                </Link>
                <span className="font-label-sm text-label-sm text-on-surface-variant mt-7">{item.label}</span>
              </div>
            )
          }
          return (
            <Link
              key={item.path}
              aria-current={isInactive(item) ? undefined : 'page'}
              className={`flex-1 flex flex-col items-center justify-center h-full min-w-[56px] transition-colors ${
                isInactive(item) ? 'text-on-surface-variant hover:text-on-surface' : 'text-primary font-semibold'
              }`}
              to={item.path}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="font-label-sm text-label-sm mt-0.5">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
