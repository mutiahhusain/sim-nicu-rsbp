import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { usePatients } from '../context/PatientContext'
import {
  fetchClinicalNotes,
  fetchPatientDiagnoses,
  fetchPatientTreatments,
} from '../api/patients'

const formatDate = (date) => {
  if (!date) return ''
  const parsed = new Date(`${date}T00:00:00`)
  if (isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PatientDetail() {
  const { id } = useParams()
  const { patients } = usePatients()
  const patient = patients.find((p) => p.id === id || p.medical_record_number === id) || null
  const patientId = patient?.id || patient?.medical_record_number
  const [clinicalNotes, setClinicalNotes] = useState([])
  const [diagnoses, setDiagnoses] = useState([])
  const [treatments, setTreatments] = useState([])
  const [clinicalLoading, setClinicalLoading] = useState(false)
  const [clinicalError, setClinicalError] = useState('')

  useEffect(() => {
    if (!patientId) return

    let cancelled = false
    setClinicalLoading(true)
    setClinicalError('')

    Promise.all([
      fetchClinicalNotes(patientId),
      fetchPatientDiagnoses(patientId),
      fetchPatientTreatments(patientId),
    ])
      .then(([notes, patientDiagnoses, patientTreatments]) => {
        if (cancelled) return
        setClinicalNotes(Array.isArray(notes) ? notes : [])
        setDiagnoses(Array.isArray(patientDiagnoses) ? patientDiagnoses : [])
        setTreatments(Array.isArray(patientTreatments) ? patientTreatments : [])
      })
      .catch((err) => {
        if (!cancelled) setClinicalError(err?.message || 'Gagal memuat data klinis.')
      })
      .finally(() => {
        if (!cancelled) setClinicalLoading(false)
      })

    return () => { cancelled = true }
  }, [patientId])

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-container-high text-outline flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">folder_off</span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Pasien Tidak Ditemukan</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 max-w-xs">Data pasien dengan ID tersebut tidak tersedia.</p>
        <Link className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm" to="/pasien">
          Kembali ke Daftar Pasien
        </Link>
      </div>
    )
  }

  const getStatusConfig = () => {
    const configs = {
      dirawat: { label: 'Dirawat', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', dot: 'bg-blue-500' },
      sembuh: { label: 'Pulang Sembuh', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', dot: 'bg-green-500' },
      rujuk: { label: 'Dirujuk', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', dot: 'bg-amber-500' },
      meninggal: { label: 'Meninggal', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', dot: 'bg-red-500' },
      pulang: { label: 'Pulang', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', dot: 'bg-purple-500' },
    }
    return configs[patient.dataStatus] || configs.dirawat
  }

  const statusConfig = getStatusConfig(patient.dataStatus)

  return (
    <div className="flex flex-col w-full px-gutter-mobile py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link className="p-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors" to="/pasien">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Detail Pasien</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Ringkasan medis dan timeline perawatan</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[24px]">child_care</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">{patient.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-code-tabular text-label-sm">{patient.bed}</span>
              </div>
              <p className="font-code-tabular text-body-sm text-outline mt-0.5">No. RM: <span className="font-semibold text-on-surface">{patient.medical_record_number || patient.id}</span></p>
            </div>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm shadow-xs ${statusConfig.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
            {patient.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-surface-container-low rounded-lg p-2.5">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Jenis Kelamin</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`material-symbols-outlined text-[16px] ${patient.genderColor}`}>{patient.genderIcon}</span>
              <span className="font-body-sm text-body-sm font-semibold text-on-surface">{patient.gender}</span>
            </div>
          </div>
          {patient.birthTime && (
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Waktu Lahir</span>
              <span className="font-code-tabular text-body-sm text-on-surface font-semibold mt-0.5">{patient.birthTime}</span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Berat Badan Lahir</span>
            <span className={`font-vital-metric-md text-vital-metric-md ${patient.weightColor} mt-0.5 font-bold`}>
              {patient.birthWeight} <span className="text-label-sm font-body-sm text-on-surface-variant font-normal">{patient.weightUnit || 'gram'}</span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Usia Gestasi</span>
            <span className="font-body-sm text-body-sm text-on-surface font-semibold mt-0.5">
              {patient.gestationalAge}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 pt-0.5 text-body-sm font-body-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-on-surface-variant flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-[16px]">pregnant_woman</span> Ibu Kandung:
            </span>
            <span className="text-on-surface font-medium truncate">
              {patient.mother} {patient.motherPhone && <span className="font-code-tabular text-outline text-label-sm">{patient.motherPhone}</span>}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-on-surface-variant flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-[16px]">stethoscope</span> DPJP:
            </span>
            <span className="text-on-surface font-medium truncate">{patient.dpjp}</span>
          </div>
          <div className="flex items-start justify-between gap-2 bg-surface-container-high/40 p-2 rounded">
            <span className="text-on-surface-variant flex items-center gap-1 shrink-0 text-label-sm font-label-sm">
              <span className={`material-symbols-outlined text-[16px] ${patient.diagnosisColor}`}>diagnosis</span> Dx Utama:
            </span>
            <span className={`${patient.diagnosisColor} font-semibold text-right text-body-sm truncate`}>{patient.diagnosis}</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-3">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Diagnosa & Tindakan</h3>
        {clinicalLoading ? (
          <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            <span>Memuat data klinis...</span>
          </div>
        ) : clinicalError ? (
          <div className="flex items-start gap-2 rounded-lg bg-error-container p-3 font-label-sm text-label-sm text-on-error-container">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{clinicalError}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg bg-surface-container-low p-3">
              <h4 className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Diagnosa</h4>
              {diagnoses.length ? (
                <ul className="mt-2 space-y-1">
                  {diagnoses.map((item, index) => {
                    const name = item.diagnosis?.name || item.diagnosis_name || item.name
                    return <li key={item.id || index} className="font-body-sm text-body-sm text-on-surface">{name || '—'}</li>
                  })}
                </ul>
              ) : <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">Belum ada diagnosa.</p>}
            </div>
            <div className="rounded-lg bg-surface-container-low p-3">
              <h4 className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Tindakan</h4>
              {treatments.length ? (
                <ul className="mt-2 space-y-1">
                  {treatments.map((item, index) => {
                    const name = item.treatment?.name || item.treatment_name || item.name
                    return <li key={item.id || index} className="font-body-sm text-body-sm text-on-surface">{name || '—'}</li>
                  })}
                </ul>
              ) : <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">Belum ada tindakan.</p>}
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-3">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Timeline Perawatan</h3>
        {clinicalLoading ? (
          <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            <span>Memuat catatan klinis...</span>
          </div>
        ) : clinicalError ? (
          <div className="flex items-start gap-2 rounded-lg bg-error-container p-3 font-label-sm text-label-sm text-on-error-container">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{clinicalError}</span>
          </div>
        ) : clinicalNotes.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">Belum ada catatan klinis.</p>
        ) : (
          <div className="space-y-3">
            {clinicalNotes.map((note, idx) => (
              <div key={note.id || idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                  {idx < clinicalNotes.length - 1 && <div className="w-0.5 h-full bg-surface-container mt-1"></div>}
                </div>
                <div className="flex-1 pb-3">
                  <p className="font-label-sm text-label-sm text-primary font-semibold">{formatDate(note.note_date || note.date)}</p>
                  <p className="font-body-sm text-body-sm text-on-surface mt-0.5">{note.note}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}