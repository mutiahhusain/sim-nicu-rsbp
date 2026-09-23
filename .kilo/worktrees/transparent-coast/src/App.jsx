import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import LoginPage from './components/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ProfilePage from './components/ProfilePage'
import AccountManagement from './components/AccountManagement'
import GreetingBanner from './components/GreetingBanner'
import QuickStats from './components/QuickStats'
import DiagnosisChart from './components/DiagnosisChart'
import PatientAttentionList from './components/PatientAttentionList'
import BedsideVignette from './components/BedsideVignette'
import QuickActions from './components/QuickActions'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import PatientRegistration from './components/PatientRegistration'
import PatientTable from './components/PatientTable'
import ReportsPage from './components/ReportsPage'
import HospitalAccountPage from './components/HospitalAccountPage'
import PatientDetail from './components/PatientDetail'

function DashboardContent() {
  return (
    <>
      <GreetingBanner />
      <QuickStats />
      <DiagnosisChart />
      <PatientAttentionList />
      <BedsideVignette />
      <QuickActions />
    </>
  )
}

function RegistrationContent() {
  return <PatientRegistration />
}

function PatientTableContent() {
  return <PatientTable />
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const isRegistrationPage = location.pathname === '/tambah-pasien'

  const getSubtitle = () => {
    if (location.pathname === '/pasien') return 'Pasien'
    if (location.pathname === '/tambah-pasien') return 'Tambah Pasien'
    if (location.pathname === '/laporan') return 'Laporan'
    if (location.pathname === '/rs-akun') return 'RS & Akun'
    return 'Beranda'
  }

  const isLogin = location.pathname === '/login'

  return (
    <>
      {!isLogin && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      {!isLogin && <Header subtitle={getSubtitle()} onMenuClick={() => setSidebarOpen(true)} />}
      <main className={isLogin ? 'min-h-screen bg-surface' : 'flex-1 flex flex-col relative w-full pt-16 lg:pl-64 bg-surface'}>
        {isLogin ? (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        ) : (
          <div className={`flex flex-col w-full px-gutter-mobile lg:px-6 space-y-4 ${isRegistrationPage ? 'py-4' : 'pt-3 pb-8 lg:pb-24'}`}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/laporan" element={<ReportsPage />} />
                <Route path="/profil" element={<ProfilePage />} />
              </Route>
              <Route element={<AdminRoute />}>
                <Route path="/" element={<DashboardContent />} />
                <Route path="/pasien" element={<PatientTableContent />} />
                <Route path="/pasien/:id" element={<PatientDetail />} />
                <Route path="/tambah-pasien" element={<RegistrationContent />} />
                <Route path="/rs-akun" element={<HospitalAccountPage />} />
                <Route path="/akun" element={<AccountManagement />} />
              </Route>
            </Routes>
          </div>
        )}
      </main>
      {!isLogin && <BottomNav />}
      <Toast />
    </>
  )
}

function App() {
  return <AppContent />
}

export default App