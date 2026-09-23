import { useState, useCallback, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { showToast } from '../utils/toast'
import { usePatients } from '../context/PatientContext'
import { fetchPatientByRM, fetchPatientDiagnoses, fetchPatientTreatments } from '../api/patients'
import TabIdentitas from './registration/TabIdentitas'
import TabIdentifikasi from './registration/TabIdentifikasi'
import TabDiagnosis from './registration/TabDiagnosis'
import TabTindakan from './registration/TabTindakan'
import TabAkhir from './registration/TabAkhir'

const initialForm = {
  medicalRecordNumber: 'RM-2024-0902',
  babyName: 'Dewi Sartika',
  gender: 'L',
  birthDate: '2024-11-19',
  birthTime: '10:15',
  gestationalAge: '30',
  birthWeight: '1450',
  twins: '',
  roomOrigin: '',
  referral: '',
  bornAt: '',
  birthProcess: '',
  serviceStatus: '',
  followUp: '',
  dischargeDate: '',
  dischargeRm: '',
  contact: {
    phone: '',
    address: '',
    provinceCode: '',
    regencyCode: '',
    districtCode: '',
    villageCode: '',
    postalCode: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
  },
  diagnosis: {
    diagnoses: [],
    keterangan: '',
  },
  plan: {
    selectedTreatments: [],
    respiratoryDetail: '',
    vascularAccess: '',
    nutrition: '',
    antibiotics: '',
    otherPlan: '',
  },
}

const DRAFT_KEY = 'nicu-registration-draft'

const supabaseToForm = (patient, diagnosisIds = [], treatmentIds = []) => ({
  medicalRecordNumber: patient.medical_record_number || String(patient.id) || '',
  babyName: patient.baby_name || '',
  gender: patient.gender || '',
  birthDate: patient.birth_date ? new Date(patient.birth_date).toISOString().split('T')[0] : '',
  birthTime: patient.birth_time ? String(patient.birth_time).slice(0, 5) : '',
  gestationalAge: patient.gestational_age ? String(patient.gestational_age) : '',
  birthWeight: patient.birth_weight ? String(patient.birth_weight) : '',
  twins: patient.twins || '',
  roomOrigin: patient.room_origin || '',
  referral: patient.referral || '',
  bornAt: patient.born_at || '',
  birthProcess: patient.birth_process || '',
  serviceStatus: patient.service_status || '',
  followUp: patient.follow_up || '',
  dischargeDate: patient.discharge_date ? new Date(patient.discharge_date).toISOString().split('T')[0] : '',
  dischargeRm: patient.discharge_rm ? String(patient.discharge_rm) : '',
  contact: {
    phone: patient.contact_phone || '',
    address: patient.contact_address || '',
    provinceCode: patient.province_code || '',
    regencyCode: patient.regency_code || '',
    districtCode: patient.district_code || '',
    villageCode: patient.village_code || '',
    postalCode: patient.postal_code || '',
    emergencyName: patient.emergency_name || '',
    emergencyRelation: patient.emergency_relation || '',
    emergencyPhone: patient.emergency_phone || '',
  },
  diagnosis: {
    diagnoses: diagnosisIds,
    keterangan: '',
  },
  plan: {
    selectedTreatments: treatmentIds,
    respiratoryDetail: '',
    vascularAccess: '',
    nutrition: '',
    antibiotics: '',
    otherPlan: '',
  },
})

const formToSupabaseUpdate = (form) => {
  const contact = form.contact || {}
  return {
    baby_name: form.babyName,
    gender: form.gender,
    birth_date: form.birthDate,
    birth_time: form.birthTime,
    gestational_age: form.gestationalAge ? parseInt(form.gestationalAge, 10) : null,
    birth_weight: form.birthWeight ? parseInt(form.birthWeight, 10) : null,
    twins: form.twins || null,
    room_origin: form.roomOrigin || null,
    referral: form.referral || null,
    born_at: form.bornAt || null,
    birth_process: form.birthProcess || null,
    service_status: form.serviceStatus || null,
    follow_up: form.followUp || null,
    discharge_date: form.dischargeDate || null,
    discharge_rm: form.dischargeRm || null,
    contact_phone: contact.phone || null,
    contact_address: contact.address || null,
    province_code: contact.provinceCode || null,
    regency_code: contact.regencyCode || null,
    district_code: contact.districtCode || null,
    village_code: contact.villageCode || null,
    postal_code: contact.postalCode || null,
    emergency_name: contact.emergencyName || null,
    emergency_relation: contact.emergencyRelation || null,
    emergency_phone: contact.emergencyPhone || null,
    status: form.serviceStatus || null,
  }
}

export default function PatientRegistration() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const { addPatient, updatePatientWithRecords } = usePatients()
  const [activeTab, setActiveTab] = useState(0)
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      return saved ? JSON.parse(saved) : initialForm
    } catch {
      return initialForm
    }
  })
  const [errors, setErrors] = useState({})
  const [rmFlash, setRmFlash] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [isLoadingEdit, setIsLoadingEdit] = useState(!!editId)
  const [editPatient, setEditPatient] = useState(null)

  useEffect(() => {
    if (!editId) {
      setEditPatient(null)
      setIsLoadingEdit(false)
      return
    }

    setIsLoadingEdit(true)
    fetchPatientByRM(editId)
      .then((patient) => {
        if (!patient) {
          showToast('Pasien tidak ditemukan.', 'error')
          navigate('/tambah-pasien')
          return null
        }
        setEditPatient(patient)
        setForm(supabaseToForm(patient))

        const patientDbId = patient.id
        return Promise.all([
          fetchPatientDiagnoses(patientDbId),
          fetchPatientTreatments(patientDbId),
        ])
          .then(([diag, treat]) => {
            const diagIds = (diag || []).map((d) => d.diagnosis_id || d.diagnosis?.id).filter(Boolean)
            const treatIds = (treat || []).map((t) => t.treatment_id || t.treatment?.id).filter(Boolean)
            setForm((prev) => ({
              ...prev,
              diagnosis: { diagnoses: diagIds, keterangan: '' },
              plan: { ...prev.plan, selectedTreatments: treatIds },
            }))
          })
          .catch(() => {})
      })
      .catch((err) => {
        showToast('Gagal memuat data pasien: ' + err.message, 'error')
      })
      .finally(() => setIsLoadingEdit(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId])

  const tabs = [
    { id: 'identitas', label: 'Identitas', icon: '👤', component: 0 },
    { id: 'asal', label: 'Asal & Identifikasi', icon: '🏥', component: 1 },
    { id: 'diagnosis', label: 'Diagnosis', icon: '🩺', component: 2 },
    { id: 'tindakan', label: 'Tindakan', icon: '💉', component: 3 },
    { id: 'akhir', label: 'Akhir Rawat', icon: '✅', component: 4 },
  ]

  const handleChange = useCallback((field) => (e) => {
    const value = typeof e === 'object' && e?.target ? e.target.value : e
    const subField = typeof e === 'object' && e?.target?.name ? e.target.name : null

    setForm((prev) => {
      if (subField && prev[field] && typeof prev[field] === 'object' && !Array.isArray(prev[field])) {
        return { ...prev, [field]: { ...prev[field], [subField]: value } }
      }
      return { ...prev, [field]: value }
    })
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const handleGenerateRM = () => {
    const rand = Math.floor(1000 + Math.random() * 9000)
    const currentYear = new Date().getFullYear()
    setForm((prev) => ({ ...prev, medicalRecordNumber: `RM-${currentYear}-${rand}` }))
    setRmFlash(true)
    setTimeout(() => setRmFlash(false), 700)
  }

  const handleDraftSave = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
      setDraftSaved(true)
      showToast('Draft berhasil disimpan ke localStorage.', 'check_circle')
      setTimeout(() => setDraftSaved(false), 1600)
    } catch {
      showToast('Gagal menyimpan draft.', 'error')
    }
  }

  useEffect(() => {
    if (editId) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
      } catch {}
    }, 1000)
    return () => clearTimeout(timer)
  }, [form, editId])

  const validate = useCallback(() => {
    const next = {}
    if (!form.babyName.trim()) next.babyName = 'Nama bayi wajib diisi.'
    if (!form.birthDate) next.birthDate = 'Tanggal lahir wajib diisi.'
    if (!form.birthTime) next.birthTime = 'Jam lahir wajib diisi.'
    const gestational = parseInt(form.gestationalAge, 10)
    if (isNaN(gestational) || gestational < 22 || gestational > 43) {
      next.gestationalAge = 'Usia gestasional harus antara 22-43 minggu.'
    }
    const weight = parseInt(form.birthWeight, 10)
    if (isNaN(weight) || weight < 400 || weight > 5000) {
      next.birthWeight = 'Berat badan lahir harus antara 400-5000 gram.'
    }
    if (!form.contact?.phone?.trim()) next.contactPhone = 'Nomor telepon wajib diisi.'
    if (!form.contact?.address?.trim()) next.contactAddress = 'Alamat wajib diisi.'
    if (!form.contact?.provinceCode) next.province = 'Provinsi wajib dipilih.'
    if (!form.contact?.regencyCode) next.regency = 'Kabupaten/Kota wajib dipilih.'
    if (!form.contact?.districtCode) next.district = 'Kecamatan wajib dipilih.'
    if (!form.contact?.villageCode) next.village = 'Desa/Kelurahan wajib dipilih.'
    if (!form.diagnosis?.diagnoses?.length) next.diagnoses = 'Pilih minimal satu diagnosis.'
    if (!form.plan?.selectedTreatments?.length) next.selectedTreatments = 'Pilih minimal satu tindakan.'
    setErrors(next)
    return Object.keys(next).length === 0
  }, [form])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      showToast('Periksa kembali form yang masih kosong atau tidak valid.', 'error')
      return
    }

    try {
      if (editPatient) {
        const updates = formToSupabaseUpdate(form)
        const diagnosisForm = {
          diagnoses: form.diagnosis.diagnoses || [],
          keterangan: form.diagnosis.keterangan || '',
        }
        const planForm = {
          selectedTreatments: form.plan.selectedTreatments || [],
          respiratoryDetail: form.plan.respiratoryDetail || '',
          antibiotics: form.plan.antibiotics || '',
          otherPlan: form.plan.otherPlan || '',
        }
        await updatePatientWithRecords(editId, updates, diagnosisForm, planForm)
        showToast('Data pasien berhasil diperbarui.', 'check_circle')
        navigate('/pasien')
      } else {
        await addPatient(form)
        showToast('Formulir pendaftaran neonatal berhasil disubmit.', 'check_circle')
        setForm(initialForm)
      }
      setErrors({})
      setActiveTab(0)
    } catch {
      showToast('Gagal menyimpan data pasien. Coba lagi.', 'error')
    }
  }

  const goNext = () => {
    if (activeTab < tabs.length - 1) {
      setActiveTab((t) => t + 1)
    }
  }

  const goPrev = () => {
    if (activeTab > 0) {
      setActiveTab((t) => t - 1)
    }
  }

  return (
    <div className="flex flex-col w-full px-gutter-mobile py-4 space-y-5">
      {/* Back to Dashboard / Patient List */}
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all font-label-md text-label-md"
          type="button"
          onClick={() => {
            if (window.confirm('Kembali? Data yang belum disubmit akan dibatalkan.')) {
              navigate(editPatient ? '/pasien' : '/')
            }
          }}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>{editPatient ? 'Daftar Pasien' : 'Beranda'}</span>
        </button>
        {!editPatient && (
          <Link
            to="/login"
            className="text-sm text-on-surface-variant hover:text-on-surface"
            onClick={() => navigate('/')}
          >
            <span className="material-symbols-outlined text-[16px] vertical-middle mr-1">logout</span>
            <span>Batal &amp; Keluar</span>
          </Link>
        )}
      </div>

      {editPatient && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[24px]">edit</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface">Edit Pasien</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">No. RM: {editPatient.medical_record_number || editPatient.id}</p>
          </div>
        </div>
      )}

      {isLoadingEdit && (
        <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
          <span>Memuat data pasien untuk diedit...</span>
        </div>
      )}

      {/* Tab Navigation */}
      <section className="w-full bg-surface-container-lowest rounded-xl p-2 shadow-sm">
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.component
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.component)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-label-sm text-label-sm font-semibold transition-all whitespace-nowrap ${isActive ? 'bg-primary-container text-on-primary shadow-[0_2px_8px_rgba(14,116,144,0.3)]' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </nav>
      </section>

      {/* Tab Content */}
      <form onSubmit={handleSubmit}>
        {activeTab === 0 && (
          <TabIdentitas
            form={form}
            errors={errors}
            onChange={handleChange}
            onGenerateRM={handleGenerateRM}
            rmFlash={rmFlash}
            isEditing={!!editPatient}
          />
        )}
        {activeTab === 1 && (
          <TabIdentifikasi
            form={form}
            errors={errors}
            onChange={handleChange}
          />
        )}
        {activeTab === 2 && (
          <TabDiagnosis
            form={form}
            errors={errors}
            onChange={handleChange}
          />
        )}
        {activeTab === 3 && (
          <TabTindakan
            form={form}
            errors={errors}
            onChange={handleChange}
          />
        )}
        {activeTab === 4 && (
          <TabAkhir
            form={form}
            errors={errors}
            onChange={handleChange}
          />
        )}

        {/* Floating Bottom Action Bar for Multi-tab Form */}
        <div className="pt-2 pb-1">
          <div className="w-full bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-3 shadow-md flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all flex items-center gap-1 font-label-md text-label-md font-medium"
                type="button"
                onClick={goPrev}
                disabled={activeTab === 0}
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Kembali</span>
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all flex items-center gap-1 font-label-md text-label-md font-medium"
                type="button"
                onClick={() => {
                  setForm(initialForm)
                  setErrors({})
                  showToast('Formulir telah direset.', 'refresh')
                }}
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                <span>Reset</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container transition-all flex items-center gap-1 font-label-md text-label-md font-semibold" type="button" onClick={handleDraftSave}>
                <span className="material-symbols-outlined text-[18px]">{draftSaved ? 'check' : 'save'}</span>
                <span className="hidden sm:inline">{draftSaved ? 'Tersimpan' : 'Simpan'}</span> Draft
              </button>
              <button className="px-3 py-2 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container transition-all flex items-center gap-1 font-label-md text-label-md font-semibold" type="button" onClick={() => {
                try {
                  const saved = localStorage.getItem(DRAFT_KEY)
                  if (saved) {
                    setForm(JSON.parse(saved))
                    showToast('Draft berhasil dimuat.', 'check_circle')
                  } else {
                    showToast('Tidak ada draft tersimpan.', 'info')
                  }
                } catch {
                  showToast('Gagal memuat draft.', 'error')
                }
              }}>
                <span className="material-symbols-outlined text-[18px]">restore</span>
                <span className="hidden sm:inline">Muat Draft</span>
              </button>
              {activeTab < tabs.length - 1 ? (
                <button className="px-4 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary shadow-[0_2px_8px_rgba(14,116,144,0.35)] active:scale-[0.98] transition-all flex items-center gap-1.5 font-label-md text-label-md font-semibold" type="button" onClick={goNext}>
                  <span>Lanjut: {tabs[activeTab + 1].label}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button className="px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-on-primary-fixed shadow-[0_2px_8px_rgba(14,116,144,0.35)] active:scale-[0.98] transition-all flex items-center gap-1.5 font-label-md text-label-md font-semibold" type="submit">
                  <span>{editPatient ? 'Perbarui' : 'Submit'}</span>
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
