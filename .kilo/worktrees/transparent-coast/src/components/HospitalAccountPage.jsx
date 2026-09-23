import { useState, useEffect, useCallback } from 'react'
import { useMaster } from '../context/Master'
import HospitalIdentityForm from './HospitalIdentityForm'
import RoomIdentityForm from './RoomIdentityForm'
import AccountProfile from './AccountProfile'
import ImportPatientData from './ImportPatientData'
import { fetchHospitalIdentity, upsertHospitalIdentity } from '../api/hospital'
import { showToast } from '../utils/toast'

function MasterList({ title, items, onAdd, onEdit, onDelete, placeholder, showGroup = false, showCategory = false, columnHeaders }) {
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editGroup, setEditGroup] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newGroup, setNewGroup] = useState('')
  const [newCategory, setNewCategory] = useState('')

  const handleAdd = () => {
    if (!newName.trim()) return
    onAdd({
      name: newName.trim(),
      ...(showGroup ? { group: newGroup.trim() } : {}),
      ...(showCategory ? { category: newCategory.trim() || 'Lainnya' } : {}),
    })
    setNewName('')
    setNewGroup('')
    setNewCategory('')
    setIsAdding(false)
  }

  const handleEdit = (item) => {
    onEdit(item.id, {
      name: editName.trim() || item.name,
      ...(showGroup ? { group: editGroup.trim() || item.group } : {}),
      ...(showCategory ? { category: editCategory.trim() || item.category } : {}),
    })
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{title}</h3>
        <button
          className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary shadow-sm font-label-sm text-label-sm flex items-center gap-1"
          type="button"
          onClick={() => setIsAdding(true)}
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Tambah
        </button>
      </div>

      {isAdding && (
        <div className="bg-surface-container-low rounded-lg p-3 space-y-2">
          <input
            className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg font-body-md text-body-md focus:outline-none focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
            placeholder={placeholder || 'Nama baru...'}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          {showGroup && (
            <select
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg font-body-md text-body-md focus:outline-none focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
            >
              <option value="">Pilih kelompok</option>
              <option value="BPJS">BPJS</option>
              <option value="ASKES">ASKES</option>
              <option value="UMUM">UMUM</option>
            </select>
          )}
          {showCategory && (
            <input
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg font-body-md text-body-md focus:outline-none focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
              placeholder="Kelompok, mis. Pernapasan / Nutrisi"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          )}
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm" type="button" onClick={handleAdd}>
              Simpan
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm" type="button" onClick={() => setIsAdding(false)}>
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {columnHeaders && showCategory && (
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold flex-1">{columnHeaders[0]}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold truncate">{columnHeaders[1]}</p>
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="bg-surface-container-lowest rounded-lg p-3 flex items-center justify-between gap-2">
            {editingId === item.id ? (
              <>
                <div className="flex-1 space-y-2">
                  <input
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-body-md focus:outline-none focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
                    defaultValue={item.name}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  {showGroup && (
                    <select
                      className="w-full px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-body-md focus:outline-none focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
                      value={editGroup}
                      onChange={(e) => setEditGroup(e.target.value)}
                    >
                      <option value="">Pilih kelompok</option>
                      <option value="BPJS">BPJS</option>
                      <option value="ASKES">ASKES</option>
                      <option value="UMUM">UMUM</option>
                    </select>
                  )}
                  {showCategory && (
                    <input
                      className="w-full px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-body-md focus:outline-none focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
                      defaultValue={item.category}
                      placeholder="Kelompok, mis. Pernapasan / Nutrisi"
                      onChange={(e) => setEditCategory(e.target.value)}
                    />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg bg-primary text-on-primary" type="button" onClick={() => handleEdit(item)}>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </button>
                  <button className="p-2 rounded-lg bg-surface-container text-on-surface" type="button" onClick={() => setEditingId(null)}>
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-body-sm text-body-sm text-on-surface font-medium truncate">{item.name}</p>
                    {showGroup && item.group && <p className="font-label-sm text-label-sm text-on-surface-variant">{item.group}</p>}
                  </div>
                  {showCategory && (
                    <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{item.category || '-'}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors" type="button" onClick={() => { setEditingId(item.id); setEditName(item.name); setEditCategory(item.category || '') }}>
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button className="p-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors" type="button" onClick={() => onDelete(item.id)}>
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-4">Belum ada data.</p>
        )}
      </div>
    </div>
  )
}

export default function HospitalAccountPage() {
  const [activeMainTab, setActiveMainTab] = useState('rs')
  const [activeCategory, setActiveCategory] = useState('umum')
  const [syncing, setSyncing] = useState(false)
  const [remoteLoaded, setRemoteLoaded] = useState(false)

  const getInitialHospitalIdentity = () => {
    try {
      const stored = localStorage.getItem('nicu-hospital-identity')
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore parse errors
    }
    return {
      name: 'RS Ibu & Anak',
      address: 'Jl. Merdeka No. 12, Jakarta Pusat',
      type: 'Rujukan',
      director: 'Dr. Budi Santoso, MD',
      directorNip: '',
      logo: '',
      logoLeft: '',
      logoRight: '',
      kopLine1: 'PEMERINTAH KABUPATEN POHUWATO',
      kopLine2: 'RUMAH SAKIT UMUM DAERAH BUMI PANUA',
      kopLine3: 'Jl. Dr. Herizal Umar Desa Botubilotahu Kec. Marisa Kab. Pohuwato Kode Pos 96266',
    }
  }

  const getInitialRoomIdentity = () => {
    try {
      const stored = localStorage.getItem('nicu-room-identity')
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore parse errors
    }
    return {
      roomName: 'Ruang NICU',
      adminName: 'Suster Rina',
      headName: 'Dr. Sp.A Andi Wijaya',
      headNip: '',
    }
  }

  const [hospitalIdentity, setHospitalIdentity] = useState(getInitialHospitalIdentity)
  const [roomIdentity, setRoomIdentity] = useState(getInitialRoomIdentity)

  // Load from Supabase on mount
  useEffect(() => {
    let cancelled = false
    async function loadRemote() {
      try {
        const remote = await fetchHospitalIdentity()
        if (!cancelled && remote) {
          // Merge: remote data wins, but keep local logos if remote doesn't have them
          setHospitalIdentity((prev) => ({
            ...remote,
            logo: remote.logo || prev.logo,
            logoLeft: remote.logoLeft || prev.logoLeft,
            logoRight: remote.logoRight || prev.logoRight,
          }))
        }
      } catch (err) {
        console.warn('Failed to load hospital identity from Supabase:', err.message)
      } finally {
        if (!cancelled) setRemoteLoaded(true)
      }
    }
    loadRemote()
    return () => { cancelled = true }
  }, [])

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem('nicu-hospital-identity', JSON.stringify(hospitalIdentity))
  }, [hospitalIdentity])

  useEffect(() => {
    localStorage.setItem('nicu-room-identity', JSON.stringify(roomIdentity))
  }, [roomIdentity])

  // Save handler for HospitalIdentityForm
  const handleSaveHospital = useCallback(async () => {
    setSyncing(true)
    try {
      const saved = await upsertHospitalIdentity(hospitalIdentity)
      // Update local state with returned data (includes generated ID from DB)
      if (saved) {
        setHospitalIdentity((prev) => ({ ...prev, ...saved }))
      }
      showToast('Identitas RS disimpan ke cloud', 'check_circle')
    } catch (err) {
      showToast('Gagal simpan ke server: ' + err.message, 'error')
    } finally {
      setSyncing(false)
    }
  }, [hospitalIdentity])

  const {
    diagnoses,
    treatments,
    addDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
    addTreatment,
    updateTreatment,
    deleteTreatment,
    masterLists,
    addItem,
    updateItem,
    deleteItem,
  } = useMaster()

  const hospitals = [
    { name: 'RS Ibu & Anak', address: 'Jl. Merdeka No. 12, Jakarta Pusat', type: 'Rujukan', status: 'Aktif' },
    { name: 'RS Kencana', address: 'Jl. Sudirman No. 45, Jakarta Selatan', type: 'Partner', status: 'Aktif' },
    { name: 'RS Harapan Bunda', address: 'Jl. Gatot Subroto No. 88, Jakarta Selatan', type: 'Rujukan', status: 'Tidak Aktif' },
  ]

  
  const hospitalTabs = [
    { id: 'rs', label: 'RS Partner', icon: 'local_hospital' },
    { id: 'hospital-identity', label: 'Identitas RS', icon: 'local_hospital' },
    { id: 'room-identity', label: 'Identitas Ruangan', icon: 'room' },
    { id: 'profile', label: 'Akun Profil', icon: 'account_circle' },
    { id: 'import-patient', label: 'Import Pasien', icon: 'upload_file' },
  ]

  const registrationTabs = [
    { id: 'genders', label: 'Jenis Kelamin', title: 'Master Jenis Kelamin', items: masterLists.genders, listKey: 'genders', placeholder: 'Nama jenis kelamin...' },
    { id: 'twins', label: 'Bayi Kembar', title: 'Master Bayi Kembar', items: masterLists.twins, listKey: 'twins', placeholder: 'Nama status bayi kembar...' },
    { id: 'roomOrigins', label: 'Asal Ruangan', title: 'Master Asal Ruangan', items: masterLists.roomOrigins, listKey: 'roomOrigins', placeholder: 'Nama asal ruangan...' },
    { id: 'birthProcess', label: 'Proses Lahir', title: 'Master Proses Lahir', items: masterLists.birthProcess, listKey: 'birthProcess', placeholder: 'Nama proses lahir...' },
    { id: 'referrals', label: 'Rujukan', title: 'Master Rujukan', items: masterLists.referrals, listKey: 'referrals', placeholder: 'Nama rujukan...' },
    { id: 'bornAt', label: 'Lahir Di', title: 'Master Lahir Di', items: masterLists.bornAt, listKey: 'bornAt', placeholder: 'Nama tempat lahir...' },
    { id: 'serviceStatus', label: 'Status Pelayanan', title: 'Master Status Pelayanan', items: masterLists.serviceStatus, listKey: 'serviceStatus', placeholder: 'Nama status pelayanan...', showGroup: true },
  ]

  const clinicalTabs = [
    { id: 'diagnosis', label: 'Diagnosa Penyakit', title: 'Master Diagnosa Penyakit', items: diagnoses, listKey: null, onAdd: addDiagnosis, onEdit: updateDiagnosis, onDelete: deleteDiagnosis, placeholder: 'Nama diagnosis baru...', showCategory: true, columnHeaders: ['Nama Diagnosa', 'Kelompok Diagnosa'] },
    { id: 'treatment', label: 'Tindakan', title: 'Master Tindakan', items: treatments, listKey: null, onAdd: addTreatment, onEdit: updateTreatment, onDelete: deleteTreatment, placeholder: 'Nama tindakan baru...', showCategory: true, columnHeaders: ['Nama Tindakan', 'Kelompok Tindakan'] },
    { id: 'resuscitation', label: 'Resusitasi', title: 'Master Resusitasi', items: masterLists.resuscitation, listKey: 'resuscitation', placeholder: 'Nama resusitasi...' },
    { id: 'breathingAid', label: 'Alat Bantu Napas', title: 'Master Alat Bantu Napas', items: masterLists.breathingAid, listKey: 'breathingAid', placeholder: 'Nama alat bantu napas...' },
    { id: 'allergies', label: 'Alergi', title: 'Master Alergi', items: masterLists.allergies, listKey: 'allergies', placeholder: 'Nama alergi...' },
  ]

  const assessmentTabs = [
    { id: 'congenitalAbnormalities', label: 'Kelainan Kongenital', title: 'Master Kelainan Kongenital', items: masterLists.congenitalAbnormalities, listKey: 'congenitalAbnormalities', placeholder: 'Nama kelainan kongenital...' },
    { id: 'pregnancyAge', label: 'Usia Kehamilan', title: 'Master Usia Kehamilan', items: masterLists.pregnancyAge, listKey: 'pregnancyAge', placeholder: 'Nama usia kehamilan...' },
    { id: 'departureTime', label: 'Waktu Meninggalkan', title: 'Master Waktu Meninggalkan', items: masterLists.departureTime, listKey: 'departureTime', placeholder: 'Nama waktu meninggalkan...' },
    { id: 'phlebitis', label: 'Flebitis', title: 'Master Flebitis', items: masterLists.phlebitis, listKey: 'phlebitis', placeholder: 'Nama flebitis...' },
    { id: 'macrosomia', label: 'Makrosomia', title: 'Master Makrosomia', items: masterLists.macrosomia, listKey: 'macrosomia', placeholder: 'Nama makrosomia...' },
    { id: 'lbBmk', label: 'LB / BMK', title: 'Master LB / BMK', items: masterLists.lbBmk, listKey: 'lbBmk', placeholder: 'Nama LB/BMK...' },
    { id: 'followUp', label: 'Tindak Lanjut', title: 'Master Tindak Lanjut', items: masterLists.followUp, listKey: 'followUp', placeholder: 'Nama tindak lanjut...' },
  ]

  const categories = [
    { id: 'umum', label: 'UMUM', icon: '🏥', tabs: hospitalTabs },
    { id: 'registrasi', label: 'REGISTRASI', icon: '📋', tabs: registrationTabs },
    { id: 'klinis', label: 'KLINIS', icon: '🩺', tabs: clinicalTabs },
    { id: 'penilaian', label: 'PENILAIAN', icon: '📊', tabs: assessmentTabs },
  ]

  const handleAddItem = (listKey, item) => {
    const handler = listKey ? () => addItem(listKey, item) : null
    return handler
  }

  const handleEditItem = (listKey, updateFn) => {
    return (id, updates) => updateFn(listKey, id, updates)
  }

  const handleDeleteItem = (listKey, deleteFn) => {
    return (id) => deleteFn(listKey, id)
  }

  const currentCategory = categories.find((cat) => cat.id === activeCategory)
  const allTabs = [...hospitalTabs, ...registrationTabs, ...clinicalTabs, ...assessmentTabs]
  const currentTab = allTabs.find((tab) => tab.id === activeMainTab)

  const handleTabClick = (tab) => {
    const cat = categories.find((c) => c.tabs.some((t) => t.id === tab.id))
    if (cat) {
      setActiveCategory(cat.id)
      setActiveMainTab(tab.id)
    }
  }

  return (
    <div className="flex flex-col w-full px-gutter-mobile py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Master</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Kelola data master untuk formulir pendaftaran pasien.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-64 bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-1">
          <h3 className="font-label-md text-label-md text-on-surface-variant font-semibold mb-3">KATEGORI</h3>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg font-label-sm text-label-sm transition-all ${activeCategory === cat.id ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id)
                setActiveMainTab(cat.tabs[0]?.id || '')
              }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="border-b border-surface-container overflow-x-auto mb-4">
            <nav className="flex items-center gap-1 min-w-max">
              {currentCategory?.tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-4 py-2 font-label-sm text-label-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeMainTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                  type="button"
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {activeMainTab === 'rs' ? (
            <div className="flex flex-col space-y-3">
              {hospitals.map((hospital) => (
                <div key={hospital.name} className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">local_hospital</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-label-md text-label-md text-on-surface font-semibold truncate">{hospital.name}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{hospital.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-1 rounded-full font-label-sm text-label-sm ${hospital.status === 'Aktif' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container text-on-surface-variant'}`}>
                      {hospital.status}
                    </span>
                    <button className="p-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors shadow-xs" type="button">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : activeMainTab === 'hospital-identity' ? (
            <HospitalIdentityForm
              identity={hospitalIdentity}
              onChange={setHospitalIdentity}
              onSave={handleSaveHospital}
              syncing={syncing}
              remoteLoaded={remoteLoaded}
            />
          ) : activeMainTab === 'room-identity' ? (
            <RoomIdentityForm identity={roomIdentity} onChange={setRoomIdentity} onSave={() => {}} />
          ) : activeMainTab === 'profile' ? (
            <AccountProfile />
          ) : activeMainTab === 'import-patient' ? (
            <ImportPatientData />
          ) : currentTab ? (
            <MasterList
              title={currentTab.title}
              items={currentTab.items || []}
              listKey={currentTab.listKey}
              onAdd={currentTab.listKey ? handleAddItem(currentTab.listKey) : currentTab.onAdd}
              onEdit={currentTab.listKey ? handleEditItem(currentTab.listKey, updateItem) : currentTab.onEdit}
              onDelete={currentTab.listKey ? handleDeleteItem(currentTab.listKey, deleteItem) : currentTab.onDelete}
              placeholder={currentTab.placeholder}
              showGroup={currentTab.showGroup || false}
              showCategory={currentTab.showCategory || false}
              columnHeaders={currentTab.columnHeaders}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
