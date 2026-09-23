import { createContext, useContext, useEffect, useState } from 'react'
import { useMaster } from './Master'
import {
  fetchPatients as fetchPatientsFromSupabase,
  upsertPatient,
  insertPatientRecord,
  deletePatient as deletePatientFromSupabase,
  updatePatient as updatePatientFromSupabase,
} from '../api/patients'

const PatientContext = createContext()

const initialPatients = [
  {
    id: 'RM-2024-0891',
    name: 'By. Ny. Rahma',
    bed: 'Bok 04',
    status: 'Dirawat (Ventilator)',
    statusColor: 'bg-error-container text-on-error-container',
    dotColor: 'bg-error',
    avatarBg: 'bg-surface-container-high',
    avatarIcon: 'child_care',
    gender: 'Laki-laki',
    genderIcon: 'male',
    genderColor: 'text-secondary',
    birthTime: '14 Nov 2024 (08:30)',
    birthWeight: '1.150',
    weightUnit: 'gram',
    weightColor: 'text-error',
    gestationalAge: '28 Mgg',
    gestationalNote: '(Ekstrem)',
    gestationalNoteColor: 'text-error',
    mother: 'Ny. Rahmawati',
    motherPhone: '(0812-9842-xxxx)',
    dpjp: 'dr. Hendra, Sp.A(K)',
    diagnosis: 'RDS Gr. III (Hyaline Membrane)',
    diagnosisColor: 'text-error',
    dataStatus: 'dirawat',
    respiratoryStatus: 'Vent. PC-SIMV',
    border: 'border-l-4 border-error',
    attentionStatus: 'Observasi Ketat',
    attentionColor: 'bg-error-container text-on-error-container',
    spo2: '92% / 40%',
    nutritionStatus: '',
  },
  {
    id: 'RM-2024-0895',
    name: 'By. Ny. Siti Aisyah',
    bed: 'Bok 07',
    status: 'Dirawat (CPAP)',
    statusColor: 'bg-primary-fixed text-on-primary-fixed-variant',
    dotColor: 'bg-primary',
    avatarBg: 'bg-surface-container-high',
    avatarIcon: 'child_care',
    gender: 'Perempuan',
    genderIcon: 'female',
    genderColor: 'text-primary',
    birthTime: '16 Nov 2024 (14:15)',
    birthWeight: '1.620',
    weightUnit: 'gram',
    weightColor: 'text-primary',
    gestationalAge: '32 Mgg',
    gestationalNote: '(Sedang)',
    gestationalNoteColor: 'text-on-surface-variant',
    mother: 'Ny. Siti Aisyah',
    motherPhone: '',
    dpjp: 'dr. Anita, Sp.A',
    diagnosis: 'BBLR + Hiperbilirubinemia',
    diagnosisColor: 'text-primary',
    dataStatus: 'dirawat',
  },
  {
    id: 'RM-2024-0870',
    name: 'By. Ny. Ratna Sari',
    bed: 'Bok 11',
    status: 'Dirawat (CPAP)',
    statusColor: 'bg-primary-fixed text-on-primary-fixed-variant',
    dotColor: 'bg-primary',
    avatarBg: 'bg-surface-container-high',
    avatarIcon: 'child_care',
    gender: 'Laki-laki',
    genderIcon: 'male',
    genderColor: 'text-secondary',
    birthTime: '10 Nov 2024 (09:45)',
    birthWeight: '2.450',
    weightUnit: 'gram',
    weightColor: 'text-tertiary',
    gestationalAge: '36 Mgg',
    gestationalNote: '(Pasca Prematur)',
    gestationalNoteColor: 'text-tertiary',
    mother: 'Ny. Ratna',
    motherPhone: '(0812-5555-xxxx)',
    dpjp: 'dr. Sari, Sp.A',
    diagnosis: 'BBLR',
    diagnosisColor: 'text-primary',
    dataStatus: 'dirawat',
  },
  {
    id: 'RM-2024-0892',
    name: 'By. Ny. Dewi Lestari',
    bed: 'Bok 08',
    status: 'Dirawat (Ventilator)',
    statusColor: 'bg-error-container text-on-error-container',
    dotColor: 'bg-error',
    avatarBg: 'bg-surface-container-high',
    avatarIcon: 'girl',
    gender: 'Perempuan',
    genderIcon: 'female',
    genderColor: 'text-primary',
    birthTime: '15 Nov 2024 (16:30)',
    birthWeight: '1.300',
    weightUnit: 'gram',
    weightColor: 'text-error',
    gestationalAge: '29 Mgg',
    gestationalNote: '(Ekstrem)',
    gestationalNoteColor: 'text-error',
    mother: 'Ny. Sari',
    motherPhone: '',
    dpjp: 'dr. Budi, Sp.A(K)',
    diagnosis: 'RDS + BBLR',
    diagnosisColor: 'text-error',
    dataStatus: 'dirawat',
  },
  {
    id: 'RM-2024-0888',
    name: 'By. Ny. Sari Wulan',
    bed: 'Bok 15',
    status: 'Pulang',
    statusColor: 'bg-tertiary text-on-tertiary',
    dotColor: 'bg-tertiary',
    avatarBg: 'bg-surface-container-high',
    avatarIcon: 'child_care',
    gender: 'Laki-laki',
    genderIcon: 'male',
    genderColor: 'text-secondary',
    birthTime: '10 Nov 2024 (07:20)',
    birthWeight: '2.800',
    weightUnit: 'gram',
    weightColor: 'text-tertiary',
    gestationalAge: '37 Mgg',
    gestationalNote: '(Stabil)',
    gestationalNoteColor: 'text-tertiary',
    mother: 'Ny. Wulan',
    motherPhone: '(0812-9999-xxxx)',
    dpjp: 'dr. Andi, Sp.A',
    diagnosis: 'BBLR',
    diagnosisColor: 'text-primary',
    dataStatus: 'pulang',
  },
  {
    id: 'RM-2024-0880',
    name: 'By. Ny. Putri',
    bed: 'Bok 12',
    status: 'Dirawat (HFNC)',
    statusColor: 'bg-secondary text-on-secondary',
    dotColor: 'bg-secondary',
    avatarBg: 'bg-surface-container-high',
    avatarIcon: 'girl',
    gender: 'Perempuan',
    genderIcon: 'female',
    genderColor: 'text-primary',
    birthTime: '12 Nov 2024 (11:00)',
    birthWeight: '1.800',
    weightUnit: 'gram',
    weightColor: 'text-primary',
    gestationalAge: '33 Mgg',
    gestationalNote: '(Sedang)',
    gestationalNoteColor: 'text-on-surface-variant',
    mother: 'Ny. Putri',
    motherPhone: '',
    dpjp: 'dr. Cici, Sp.A',
    diagnosis: 'Hiperbilirubinemia',
    diagnosisColor: 'text-primary',
    dataStatus: 'dirawat',
  },
]

export function PatientProvider({ children }) {
  const { diagnoses: masterDiagnoses } = useMaster()
  const [patients, setPatients] = useState(initialPatients)
  const [loading, setLoading] = useState(true)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  // Helper: check if ID is a valid UUID (from Supabase)
  const isValidUUID = (id) => {
    if (!id || typeof id !== 'string') return false
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
  }

  // Helper: format date from YYYY-MM-DD to DD MMM YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Helper: map service_status to dataStatus for filtering
  const mapDataStatus = (p) => {
    // Prioritize follow_up (Tindak Lanjut) as it contains the actual discharge status
    const status = p.follow_up || p.service_status || p.status || p.discharge_status || p.discharge_condition || p.outcome || ''
    const s = String(status).toLowerCase().trim()
    
    // Exact match for known Indonesian values (from follow_up column)
    const exactMatch = {
      'dipulangkan': 'sembuh',
      'pulang': 'sembuh',
      'meninggal': 'meninggal',
      'pulang paksa': 'pulang_paksa',
      'dirujuk ke rstn': 'rujuk',
      'dirujuk': 'rujuk',
      'rujuk': 'rujuk',
      'referred': 'rujuk',
      'transfer': 'rujuk',
      'deceased': 'meninggal',
      'died': 'meninggal',
      'expired': 'meninggal',
      'discharged': 'sembuh',
      'recovered': 'sembuh',
      'home': 'sembuh',
      'dama': 'pulang_paksa',
      'discharged against advice': 'pulang_paksa',
      'discharged_against_medical_advice': 'pulang_paksa',
    }
    
    if (exactMatch[s]) return exactMatch[s]
    
    // Fallback: keyword-based matching
    if (s.includes('sembuh') || s.includes('pulang') || s === 'discharged' || s === 'recovered' || s === 'home') return 'sembuh'
    if (s.includes('paksa') || s === 'pulang paksa' || s === 'discharged against advice' || s === 'dama' || s === 'discharged_against_medical_advice') return 'pulang_paksa'
    if (s.includes('rujuk') || s.includes('referred') || s === 'transfer' || s === 'referral' || s === 'referred out') return 'rujuk'
    if (s.includes('meninggal') || s.includes('mati') || s === 'meninggal' || s === 'deceased' || s === 'expired' || s === 'died' || s === 'death' || s === 'mortality') return 'meninggal'
    if (s.includes('dirawat') || s.includes('rawat') || s === 'dirawat' || s === 'active' || s === 'admitted' || s === 'inpatient' || s === 'treating' || s === 'care') return 'dirawat'
    // Default fallback - check if there's a discharge_date which might indicate discharged
    if (p.discharge_date) return 'sembuh'
    // Default fallback
    return 'dirawat'
  }

  // Helper: get gender config
  const getGenderConfig = (gender) => {
    const g = String(gender || '').toLowerCase()
    if (g.includes('perempuan') || g.includes('p') || g === 'p' || g.includes('female')) {
      return { icon: 'female', color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' }
    }
    if (g.includes('ganda') || g.includes('kembar') || g === 'g') {
      return { icon: 'diversity_3', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' }
    }
    return { icon: 'male', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' }
  }

  // Helper: get status config
  const getStatusConfig = (dataStatus) => {
    const configs = {
      dirawat: { label: 'Dirawat', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', dot: 'bg-blue-500' },
      sembuh: { label: 'Pulang Sembuh', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', dot: 'bg-green-500' },
      rujuk: { label: 'Dirujuk', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', dot: 'bg-amber-500' },
      meninggal: { label: 'Meninggal', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', dot: 'bg-red-500' },
      pulang: { label: 'Pulang', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', dot: 'bg-purple-500' },
      pulang_paksa: { label: 'Pulang Paksa', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', dot: 'bg-orange-500' },
    }
    return configs[dataStatus] || configs.dirawat
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const remote = await fetchPatientsFromSupabase()
        if (remote !== null && !cancelled) {
          // Transform Supabase data to include UI-expected fields
          const transformed = (remote || []).map(p => ({
            ...p,
            // Map database fields to UI fields
            name: p.baby_name ? `By. ${p.baby_name}` : p.name || '—',
            birthTime: p.birth_date && p.birth_time ? `${formatDate(p.birth_date)} (${p.birth_time})` : p.birthTime || '—',
            birthWeight: p.birth_weight ? String(p.birth_weight) : p.birthWeight || '—',
            gestationalAge: p.gestational_age ? `${p.gestational_age} Mgg` : p.gestationalAge || '—',
            mother: p.emergency_name || p.mother || '—',
            motherPhone: p.emergency_phone || p.motherPhone || '',
            dpjp: p.dpjp || '—',
            diagnosis: p.diagnosis || '—',
            bed: p.bed || '—',
            status: p.status || p.service_status || 'Dirawat',
            // Map service_status to dataStatus for filtering
            dataStatus: mapDataStatus(p),
            gender: p.gender,
            avatarBg: getGenderConfig(p.gender).bg,
            avatarIcon: getGenderConfig(p.gender).icon,
            genderColor: getGenderConfig(p.gender).color,
            genderIcon: getGenderConfig(p.gender).icon,
            weightColor: p.birth_weight && p.birth_weight < 1500 ? 'text-red-500' : p.birth_weight && p.birth_weight < 2500 ? 'text-amber-500' : 'text-green-500',
            diagnosisColor: 'text-on-surface',
            dotColor: getStatusConfig(mapDataStatus(p)).dot,
            statusColor: getStatusConfig(mapDataStatus(p)).color,
            border: `border-l-4 ${getStatusConfig(mapDataStatus(p)).dot.replace('bg-', 'border-')}`,
          }))
          setPatients(transformed)
        }
      } catch {
        if (!cancelled) setPatients(initialPatients)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [reloadTrigger])

  const addPatient = async (form) => {
    const contact = form.contact || {}
    const diagnosis = form.diagnosis || {}
    const plan = form.plan || {}

    const patient = {
      medical_record_number: form.medicalRecordNumber,
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
      admission_date: form.birthDate || null,
      dpjp: null,
      status: form.serviceStatus || null,
      respiratory_status: null,
      attention_status: null,
      spo2: null,
      nutrition_status: null,
      discharge_status: null,
    }

    try {
      const saved = await upsertPatient(patient)
      const patientId = saved?.id || form.medicalRecordNumber

      if (saved) {
        // Filter only valid UUID diagnosis/treatment IDs (from Supabase)
        const validDiagnosisIds = (diagnosis.diagnoses || []).filter(isValidUUID)
        const validTreatmentIds = (plan.selectedTreatments || []).filter(isValidUUID)

        if (validDiagnosisIds.length || validTreatmentIds.length) {
          const diagnosisForm = {
            diagnoses: validDiagnosisIds,
            keterangan: diagnosis.keterangan || '',
          }
          const planForm = {
            selectedTreatments: validTreatmentIds,
            respiratoryDetail: plan.respiratoryDetail,
            antibiotics: plan.antibiotics,
            otherPlan: plan.otherPlan,
          }
          await insertPatientRecord(patientId, diagnosisForm, planForm)
        }
      }

      // Resolve selected diagnosis IDs back to names for display
      const dxMap = {}
      ;(masterDiagnoses || []).forEach((d) => {
        if (d.id) dxMap[d.id] = d.name
      })

      // Optimistically update local list (display object)
      const displayPatient = {
        id: form.medicalRecordNumber,
        name: `By. ${form.babyName}`,
        bed: '',
        status: 'Dirawat',
        gender: form.gender === 'L' ? 'Laki-laki' : form.gender === 'P' ? 'Perempuan' : 'Ganda',
        birthTime: `${form.birthDate} (${form.birthTime})`,
        birthWeight: `${form.birthWeight || 0} gram`,
        gestationalAge: `${form.gestationalAge || 0} Mgg`,
        mother: contact.emergencyName || '',
        motherPhone: contact.emergencyPhone || '',
        dpjp: '',
        diagnosis: (diagnosis.diagnoses || []).map((id) => dxMap[id] || id).join(', ') || '',
        dataStatus: 'dirawat',
        respiratoryStatus: '',
        spo2: '',
        nutritionStatus: '',
      }

      setPatients((prev) => {
        const exists = prev.find((p) => p.id === displayPatient.id)
        return exists
          ? prev.map((p) => (p.id === displayPatient.id ? displayPatient : p))
          : [displayPatient, ...prev]
      })

      return displayPatient
    } catch (err) {
      console.error('Gagal menyimpan pasien:', err)
      throw err
    }
  }

  const deletePatient = async (id) => {
    try {
      const patient = patients.find((p) => String(p.id) === String(id) || String(p.medical_record_number) === String(id))
      const numericId = patient?.id || id
      await deletePatientFromSupabase(numericId)
      setPatients((prev) => prev.filter((p) => String(p.id) !== String(id) && String(p.medical_record_number) !== String(id)))
      return true
    } catch (err) {
      console.error('Gagal menghapus pasien:', err)
      throw err
    }
  }

  const updatePatient = async (id, updates) => {
    try {
      const patient = patients.find((p) => String(p.id) === String(id) || String(p.medical_record_number) === String(id))
      const medicalRecordNumber = patient?.medical_record_number || id
      const saved = await updatePatientFromSupabase(medicalRecordNumber, updates)
      if (saved) {
        setPatients((prev) =>
          prev.map((p) => {
            if (String(p.id) !== String(id) && String(p.medical_record_number) !== String(id)) return p

            const merged = { ...p, ...saved }
            const dataStatus = mapDataStatus(merged)
            const statusConfig = getStatusConfig(dataStatus)
            return {
              ...merged,
              status: merged.status || merged.service_status || merged.follow_up || 'Dirawat',
              dataStatus,
              dotColor: statusConfig.dot,
              statusColor: statusConfig.color,
              border: `border-l-4 ${statusConfig.dot.replace('bg-', 'border-')}`,
            }
          })
        )
      }
      return saved
    } catch (err) {
      console.error('Gagal mengupdate pasien:', err)
      throw err
    }
  }

  const reloadPatients = () => {
    setReloadTrigger(prev => prev + 1)
  }

  const value = {
    patients,
    setPatients,
    addPatient,
    deletePatient,
    updatePatient,
    reloadPatients,
    loading,
  }

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
}

export function usePatients() {
  const context = useContext(PatientContext)
  if (!context) {
    throw new Error('usePatients must be used within a PatientProvider')
  }
  return context
}
