import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePatients } from '../context/PatientContext'
import { showToast } from '../utils/toast'

const PAGE_SIZE = 10

const STATUS_CONFIG = {
  dirawat: { label: 'Dirawat', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', dot: 'bg-blue-500' },
  sembuh: { label: 'Pulang Sembuh', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', dot: 'bg-green-500' },
  rujuk: { label: 'Dirujuk', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', dot: 'bg-amber-500' },
  meninggal: { label: 'Meninggal', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', dot: 'bg-red-500' },
  pulang_paksa: { label: 'Pulang Paksa', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', dot: 'bg-orange-500' },
  pulang: { label: 'Pulang', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', dot: 'bg-purple-500' },
}

const getStatusConfig = (status) => {
  const key = String(status || '').toLowerCase()
  if (key.includes('paksa')) return STATUS_CONFIG.pulang_paksa
  if (key.includes('sembuh') || key === 'pulang') return STATUS_CONFIG.sembuh
  if (key.includes('rujuk')) return STATUS_CONFIG.rujuk
  if (key.includes('meninggal') || key.includes('mati')) return STATUS_CONFIG.meninggal
  if (key.includes('dirawat') || key.includes('rawat')) return STATUS_CONFIG.dirawat
  return STATUS_CONFIG.dirawat
}

const getGenderConfig = (gender) => {
  const g = String(gender || '').toLowerCase()
  if (g.includes('perempuan') || g.includes('p') || g.includes('female') || g === 'p') {
    return { icon: 'female', color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' }
  }
  if (g.includes('ganda') || g.includes('kembar') || g === 'g') {
    return { icon: 'diversity_3', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' }
  }
  return { icon: 'male', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' }
}

const StatCard = ({ label, value, icon, color }) => (
  <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-surface-container-low rounded-xl border border-surface-variant/50 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>
    </div>
    <div>
      <p className="text-xs text-on-surface-variant font-medium">{label}</p>
      <p className="text-xl font-bold text-on-surface tabular-nums">{value}</p>
    </div>
  </div>
)

export default function PatientTable() {
  const { patients, deletePatient } = usePatients()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState(null)
  const [viewMode, setViewMode] = useState('cards')
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const [activeMonth, setActiveMonth] = useState('all')
  const [activeYear, setActiveYear] = useState('all')

  const currentYear = new Date().getFullYear()
  const years = useMemo(() => Array.from({ length: 5 }, (_, i) => currentYear - i), [currentYear])
  const months = [
    { key: 'all', label: 'Semua Bulan' },
    { key: '1', label: 'Januari' }, { key: '2', label: 'Februari' }, { key: '3', label: 'Maret' },
    { key: '4', label: 'April' }, { key: '5', label: 'Mei' }, { key: '6', label: 'Juni' },
    { key: '7', label: 'Juli' }, { key: '8', label: 'Agustus' }, { key: '9', label: 'September' },
    { key: '10', label: 'Oktober' }, { key: '11', label: 'November' }, { key: '12', label: 'Desember' },
  ]

  const filters = useMemo(() => [
    { key: 'all', label: 'Semua', icon: 'list_alt' },
    { key: 'dirawat', label: 'Dirawat', icon: 'local_hospital' },
    { key: 'sembuh', label: 'Sembuh', icon: 'check_circle' },
    { key: 'rujuk', label: 'Rujuk', icon: 'transfer_within_a_station' },
    { key: 'meninggal', label: 'Meninggal', icon: 'sentiment_dissatisfied' },
    { key: 'pulang_paksa', label: 'Pulang Paksa', icon: 'exit_to_app' },
  ], [])

  const filteredPatients = useMemo(() => {
    const query = search.toLowerCase().trim()
    let result = patients.filter((p) => {
      const matchesQuery =
        !query ||
        p.name?.toLowerCase().includes(query) ||
        String(p.id || '').toLowerCase().includes(query) ||
        String(p.medical_record_number || '').toLowerCase().includes(query) ||
        (p.mother && p.mother.toLowerCase().includes(query)) ||
        (p.dpjp && p.dpjp.toLowerCase().includes(query))
      const matchesStatus = activeFilter === 'all' || p.dataStatus === activeFilter
      
      // Month filter
      let matchesMonth = true
      if (activeMonth !== 'all' && p.birth_date) {
        const birthMonth = new Date(p.birth_date).getMonth() + 1
        matchesMonth = String(birthMonth) === activeMonth
      }
      
      // Year filter
      let matchesYear = true
      if (activeYear !== 'all' && p.birth_date) {
        const birthYear = new Date(p.birth_date).getFullYear()
        matchesYear = String(birthYear) === activeYear
      }
      
      return matchesQuery && matchesStatus && matchesMonth && matchesYear
    })

    result.sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]
      if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase() }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [search, activeFilter, activeMonth, activeYear, patients, sortConfig])

  // Patients filtered by month/year only (for stats & filter chips)
  const monthYearFilteredPatients = useMemo(() => {
    return patients.filter((p) => {
      let matchesMonth = true
      if (activeMonth !== 'all' && p.birth_date) {
        const birthMonth = new Date(p.birth_date).getMonth() + 1
        matchesMonth = String(birthMonth) === activeMonth
      }
      
      let matchesYear = true
      if (activeYear !== 'all' && p.birth_date) {
        const birthYear = new Date(p.birth_date).getFullYear()
        matchesYear = String(birthYear) === activeYear
      }
      
      return matchesMonth && matchesYear
    })
  }, [activeMonth, activeYear, patients])

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const paginatedPatients = filteredPatients.slice(start, start + PAGE_SIZE)

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getPatientId = (patient) => patient.medical_record_number || String(patient.id)

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus pasien "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return
    setDeletingId(id)
    try {
      await deletePatient(id)
      showToast('Pasien dihapus', 'check_circle')
    } catch (err) {
      showToast('Gagal hapus: ' + err.message, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handlePrev = () => setPage(p => Math.max(1, p - 1))
  const handleNext = () => setPage(p => Math.min(totalPages, p + 1))

  return (
    <div className="flex flex-col w-full px-gutter-mobile py-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="material-symbols-outlined text-2xl text-on-primary">groups</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Data Pasien NICU</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">Monitoring admisi, riwayat rawat, dan rekap medis</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-surface-container-high text-primary hover:bg-surface-variant transition-all font-medium text-sm flex items-center gap-2 shadow-sm" type="button">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Ekspor</span>
          </button>
          <button className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-all font-medium text-sm flex items-center gap-2 shadow-lg shadow-primary/30" type="button" onClick={() => navigate('/tambah-pasien')}>
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Tambah Pasien</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Pasien" value={monthYearFilteredPatients.length} icon="groups" color="text-primary" />
        <StatCard label="Dirawat" value={monthYearFilteredPatients.filter(p => p.dataStatus === 'dirawat').length} icon="local_hospital" color="text-blue-500" />
        <StatCard label="Sembuh" value={monthYearFilteredPatients.filter(p => p.dataStatus === 'sembuh').length} icon="check_circle" color="text-green-500" />
        <StatCard label="Rujuk" value={monthYearFilteredPatients.filter(p => p.dataStatus === 'rujuk').length} icon="transfer_within_a_station" color="text-amber-500" />
        <StatCard label="Meninggal" value={monthYearFilteredPatients.filter(p => p.dataStatus === 'meninggal').length} icon="sentiment_dissatisfied" color="text-red-500" />
        <StatCard label="Pulang Paksa" value={monthYearFilteredPatients.filter(p => p.dataStatus === 'pulang_paksa').length} icon="exit_to_app" color="text-orange-500" />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </span>
          <input
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-lowest text-on-surface text-base placeholder:text-on-surface-variant/60 border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Cari Nama Bayi, No. RM, Nama Ibu, atau DPJP..."
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
          {search && (
            <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant hover:text-on-surface" onClick={() => { setSearch(''); setPage(1) }} type="button" aria-label="Hapus pencarian">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="hidden sm:inline text-sm text-on-surface-variant">Tampilan:</span>
          <div className="flex bg-surface-container-low rounded-xl p-1" role="radiogroup">
            <button type="button" role="radio" aria-checked={viewMode === 'cards'} onClick={() => setViewMode('cards')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${viewMode === 'cards' ? 'bg-white dark:bg-surface-container-high text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
              <span className="material-symbols-outlined text-[18px]">view_module</span>
              <span className="hidden sm:inline">Kartu</span>
            </button>
            <button type="button" role="radio" aria-checked={viewMode === 'table'} onClick={() => setViewMode('table')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-white dark:bg-surface-container-high text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
              <span className="material-symbols-outlined text-[18px]">table_view</span>
              <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-on-surface-variant">Bulan:</span>
            <select
              value={activeMonth}
              onChange={(e) => { setActiveMonth(e.target.value); setPage(1) }}
              className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface text-sm border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-on-surface-variant">Tahun:</span>
            <select
              value={activeYear}
              onChange={(e) => { setActiveYear(e.target.value); setPage(1) }}
              className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface text-sm border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status pasien">
        {filters.map((filter) => {
          const count = filter.key === 'all' ? monthYearFilteredPatients.length : monthYearFilteredPatients.filter(p => p.dataStatus === filter.key).length
          const isActive = activeFilter === filter.key
          const config = isActive ? STATUS_CONFIG[filter.key] || STATUS_CONFIG.dirawat : null
          return (
            <button key={filter.key} type="button" onClick={() => { setActiveFilter(filter.key); setPage(1) }} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${isActive ? `${config.color} shadow-sm` : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}>
              <span className="material-symbols-outlined text-[16px]">{filter.icon}</span>
              {filter.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${isActive ? 'bg-white/20' : 'bg-surface-container-high'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Patient List */}
      <div className="space-y-3">
        {paginatedPatients.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <p className="text-lg font-medium text-on-surface mb-1">Tidak ada pasien ditemukan</p>
            <p className="text-sm">Coba ubah pencarian atau filter status</p>
          </div>
        ) : (
          <>
            {/* Card View */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {paginatedPatients.map((patient) => {
                  const statusConfig = getStatusConfig(patient.dataStatus)
                  const genderConfig = getGenderConfig(patient.gender)
                  const patientId = getPatientId(patient)
                  return (
                    <article key={patient.id} className="group relative bg-white dark:bg-surface-container-low rounded-2xl border border-surface-variant/50 shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/pasien/${patientId}?edit=true`} className="p-2 rounded-xl bg-white/80 dark:bg-surface-container/80 backdrop-blur-sm text-on-surface hover:bg-surface-container transition-colors shadow-sm" aria-label="Edit"><span className="material-symbols-outlined text-[18px]">edit</span></Link>
                        <button onClick={() => handleDelete(patientId, patient.name)} disabled={deletingId === patientId} className={`p-2 rounded-xl transition-colors ${deletingId === patientId ? 'bg-error-container text-error' : 'bg-white/80 dark:bg-surface-container/80 backdrop-blur-sm text-on-surface hover:bg-error-container hover:text-error shadow-sm'}`} aria-label="Hapus">{deletingId === patientId ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">delete</span>}</button>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${genderConfig.bg}`}>
                              <span className={`material-symbols-outlined text-xl ${genderConfig.color}`}>{genderConfig.icon}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-on-surface truncate">{patient.name}</p>
                              <p className="text-xs text-on-surface-variant">{patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 ${statusConfig.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-container-low">
                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">bed</span>
                            <span className="font-medium text-on-surface">{patient.bed || '-'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link to={`/pasien/${patientId}`} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group">
                              <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary transition-colors">visibility</span>
                              <span className="text-sm text-on-surface-variant truncate">Detail</span>
                            </Link>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-variant/50">
                            <p className="text-xs text-on-surface-variant font-medium">Berat Lahir</p>
                            <p className="font-bold text-on-surface tabular-nums">{patient.birthWeight || '-'} <span className="font-normal text-sm text-on-surface-variant">g</span></p>
                          </div>
                          <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-variant/50">
                            <p className="text-xs text-on-surface-variant font-medium">Gestasional</p>
                            <p className="font-bold text-on-surface">{patient.gestationalAge || '-'}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-variant/50">
                            <p className="text-xs text-on-surface-variant font-medium">DPJP</p>
                            <p className="font-medium text-on-surface truncate">{patient.dpjp || '-'}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-variant/50">
                            <p className="text-xs text-on-surface-variant font-medium">Diagnosis</p>
                            <p className="font-medium text-on-surface truncate">{patient.diagnosis || '-'}</p>
                          </div>
                        </div>

                        {patient.mother && (
                          <div className="pt-2 border-t border-surface-variant/50">
                            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-[16px]">person_outline</span>
                              <span className="truncate font-medium text-on-surface">{patient.mother}</span>
                              {patient.motherPhone && <span className="ml-auto text-xs">{patient.motherPhone}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="overflow-x-auto rounded-2xl border border-surface-variant/50 bg-white dark:bg-surface-container-low">
                <table className="w-full" role="grid">
                  <thead className="bg-surface-container-low/50 border-b border-surface-variant/50">
                    <tr>
                      {[
                        { key: 'name', label: 'Pasien' },
                        { key: 'bed', label: 'Bed' },
                        { key: 'status', label: 'Status' },
                        { key: 'birthWeight', label: 'Berat (g)' },
                        { key: 'gestationalAge', label: 'Gestasional' },
                        { key: 'dpjp', label: 'DPJP' },
                        { key: 'diagnosis', label: 'Diagnosis' },
                        { key: 'actions', label: '' },
                      ].map(col => (
                        <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-primary select-none" onClick={() => col.key !== 'actions' && handleSort(col.key)} style={{ userSelect: 'none' }}>
                          <div className="flex items-center gap-1">
                            {col.label}
                            {col.key !== 'actions' && sortConfig.key === col.key && (
                              <span className="material-symbols-outlined text-[14px] text-primary">{sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/50">
                    {paginatedPatients.map((patient) => {
                      const statusConfig = getStatusConfig(patient.dataStatus)
                      const genderConfig = getGenderConfig(patient.gender)
                      const patientId = getPatientId(patient)
                      return (
                        <tr key={patient.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${genderConfig.bg}`}>
                                <span className={`material-symbols-outlined text-[16px] ${genderConfig.color}`}>{genderConfig.icon}</span>
                              </div>
                              <div>
                                <p className="font-medium text-on-surface">{patient.name}</p>
                                <p className="text-xs text-on-surface-variant">{patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-sm font-medium bg-surface-container-high text-on-surface">{patient.bed || '-'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-on-surface tabular-nums">{patient.birthWeight || '-'}</td>
                          <td className="px-4 py-3 text-sm text-on-surface">{patient.gestationalAge || '-'}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-on-surface truncate max-w-xs">{patient.dpjp || '-'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-on-surface truncate max-w-xs">{patient.diagnosis || '-'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Link to={`/pasien/${patientId}`} className="p-2 rounded-lg hover:bg-surface-container transition-colors" aria-label="Detail"><span className="material-symbols-outlined text-[18px] text-on-surface-variant">visibility</span></Link>
                              <Link to={`/pasien/${patientId}?edit=true`} className="p-2 rounded-lg bg-white/80 dark:bg-surface-container/80 backdrop-blur-sm text-on-surface hover:bg-surface-container transition-colors shadow-sm" aria-label="Edit"><span className="material-symbols-outlined text-[18px]">edit</span></Link>
                              <button onClick={() => handleDelete(patientId, patient.name)} disabled={deletingId === patientId} className={`p-2 rounded-lg transition-colors ${deletingId === patientId ? 'bg-error-container text-error' : 'bg-white/80 dark:bg-surface-container/80 backdrop-blur-sm text-on-surface hover:bg-error-container hover:text-error shadow-sm'}`} aria-label="Hapus">{deletingId === patientId ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">delete</span>}</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {filteredPatients.length > PAGE_SIZE && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-surface-variant/50">
                <div className="text-sm text-on-surface-variant">
                  Menampilkan <span className="font-semibold text-on-surface">{filteredPatients.length === 0 ? 0 : start + 1}-{Math.min(start + PAGE_SIZE, filteredPatients.length)}</span> dari <span className="font-semibold text-on-surface">{filteredPatients.length}</span> pasien
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handlePrev} disabled={safePage === 1} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${safePage === 1 ? 'bg-surface-container-low text-on-surface-variant/50 cursor-not-allowed' : 'bg-white dark:bg-surface-container-high text-primary hover:bg-surface-container-low shadow-sm'}`} aria-label="Halaman sebelumnya">
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) pageNum = i + 1
                      else if (safePage <= 3) pageNum = i + 1
                      else if (safePage >= totalPages - 2) pageNum = totalPages - 4 + i
                      else pageNum = safePage - 2 + i
                      return (
                        <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-8 h-8 rounded-lg font-mono text-sm flex items-center justify-center transition-all ${pageNum === safePage ? 'bg-primary text-on-primary shadow-sm' : 'hover:bg-surface-container text-on-surface'}`} aria-label={`Halaman ${pageNum}`} aria-current={pageNum === safePage ? 'page' : undefined}>{pageNum}</button>
                      )
                    })}
                  </div>
                  <button onClick={handleNext} disabled={safePage === totalPages} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${safePage === totalPages ? 'bg-surface-container-low text-on-surface-variant/50 cursor-not-allowed' : 'bg-white dark:bg-surface-container-high text-primary hover:bg-surface-container-low shadow-sm'}`} aria-label="Halaman selanjutnya">
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}