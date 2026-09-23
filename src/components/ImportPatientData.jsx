import { useState } from 'react'
import * as XLSX from 'xlsx'
import { showToast } from '../utils/toast'
import { upsertPatient, insertPatientRecord } from '../api/patients'

const SAMPLE_HEADERS = [
  'medical_record_number',
  'baby_name',
  'gender',
  'birth_date',
  'birth_time',
  'gestational_age',
  'birth_weight',
  'twins',
  'room_origin',
  'referral',
  'born_at',
  'birth_process',
  'service_status',
  'follow_up',
  'discharge_date',
  'discharge_rm',
  'contact_phone',
  'contact_address',
  'province_code',
  'regency_code',
  'district_code',
  'village_code',
  'postal_code',
  'emergency_name',
  'emergency_relation',
  'emergency_phone',
  'diagnosis_names',
  'diagnosis_keterangan',
  'treatment_names',
  'respiratory_detail',
  'antibiotics',
  'other_plan',
]

export default function ImportPatientData() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState({ success: 0, failed: 0, errors: [] })

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([SAMPLE_HEADERS])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template Import Pasien')
    XLSX.writeFile(wb, 'template_import_pasien_nicu.xlsx')
  }

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setResults({ success: 0, failed: 0, errors: [] })
    setProgress(0)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
        setPreview(json.slice(0, 10))
      } catch (err) {
        showToast('Gagal membaca file: ' + err.message, 'error')
      }
    }
    reader.readAsArrayBuffer(f)
  }

  const mapGender = (val) => {
    const v = String(val).toLowerCase().trim()
    if (['l', 'laki', 'laki-laki', 'male', 'pria'].includes(v)) return 'L'
    if (['p', 'perempuan', 'wanita', 'female'].includes(v)) return 'P'
    if (['g', 'ganda', 'kembar'].includes(v)) return 'G'
    return 'L'
  }

  const parseDate = (val) => {
    if (!val) return null
    const d = new Date(val)
    if (isNaN(d.getTime())) return null
    return d.toISOString().split('T')[0]
  }

  const parseTime = (val) => {
    if (!val) return '00:00'
    const s = String(val).trim()
    if (s.includes(':')) return s.substring(0, 5)
    return '00:00'
  }

  const parseIntSafe = (val, fallback = null) => {
    if (val === '' || val === null || val === undefined) return fallback
    const n = parseInt(val, 10)
    return isNaN(n) ? fallback : n
  }

  const validateRow = (row) => {
    const errors = []
    if (!row.medical_record_number) errors.push('Nomor RM wajib diisi')
    if (!row.baby_name) errors.push('Nama bayi wajib diisi')
    const birthDate = parseDate(row.birth_date)
    if (!birthDate) errors.push('Tanggal lahir wajib diisi & format valid')
    const birthTime = parseTime(row.birth_time)
    if (!birthTime || birthTime === '00:00') errors.push('Jam lahir wajib diisi (format HH:MM)')
    const ga = parseIntSafe(row.gestational_age)
    if (ga === null || ga < 22 || ga > 43) errors.push('Usia gestasional 22-43 minggu')
    const bw = parseIntSafe(row.birth_weight)
    if (bw === null || bw < 400 || bw > 5000) errors.push('Berat lahir 400-5000 gram')
    if (!row.contact_phone) errors.push('Telepon wajib diisi')
    if (!row.contact_address) errors.push('Alamat wajib diisi')
    if (!row.province_code) errors.push('Provinsi wajib diisi')
    if (!row.regency_code) errors.push('Kabupaten wajib diisi')
    if (!row.district_code) errors.push('Kecamatan wajib diisi')
    if (!row.village_code) errors.push('Desa/Kelurahan wajib diisi')
    return errors
  }

  const buildPatient = (row) => ({
    medical_record_number: String(row.medical_record_number || '').trim(),
    baby_name: String(row.baby_name || '').trim(),
    gender: mapGender(row.gender),
    birth_date: parseDate(row.birth_date),
    birth_time: parseTime(row.birth_time),
    gestational_age: parseIntSafe(row.gestational_age),
    birth_weight: parseIntSafe(row.birth_weight),
    twins: row.twins ? String(row.twins).trim() : null,
    room_origin: row.room_origin ? String(row.room_origin).trim() : null,
    referral: row.referral ? String(row.referral).trim() : null,
    born_at: row.born_at ? String(row.born_at).trim() : null,
    birth_process: row.birth_process ? String(row.birth_process).trim() : null,
    service_status: row.service_status ? String(row.service_status).trim() : null,
    follow_up: row.follow_up ? String(row.follow_up).trim() : null,
    discharge_date: parseDate(row.discharge_date) || null,
    discharge_rm: row.discharge_rm ? String(row.discharge_rm).trim() : null,
    contact_phone: String(row.contact_phone || '').trim(),
    contact_address: String(row.contact_address || '').trim(),
    province_code: String(row.province_code || '').trim(),
    regency_code: String(row.regency_code || '').trim(),
    district_code: String(row.district_code || '').trim(),
    village_code: String(row.village_code || '').trim(),
    postal_code: row.postal_code ? String(row.postal_code).trim() : null,
    emergency_name: row.emergency_name ? String(row.emergency_name).trim() : null,
    emergency_relation: row.emergency_relation ? String(row.emergency_relation).trim() : null,
    emergency_phone: row.emergency_phone ? String(row.emergency_phone).trim() : null,
    admission_date: parseDate(row.birth_date) || null,
    dpjp: null,
    status: row.service_status ? String(row.service_status).trim() : null,
    respiratory_status: null,
    attention_status: null,
    spo2: null,
    nutrition_status: null,
    discharge_status: null,
  })

  const importData = async () => {
    if (!file || preview.length === 0) {
      showToast('Pilih file Excel terlebih dahulu', 'error')
      return
    }

    setImporting(true)
    setResults({ success: 0, failed: 0, errors: [] })

    try {
      const data = new Uint8Array(await file.arrayBuffer())
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

      const total = rows.length
      let success = 0
      let failed = 0
      const errors = []

      for (let i = 0; i < total; i++) {
        const row = rows[i]
        const rowNum = i + 2

        const validationErrors = validateRow(row, rowNum)
        if (validationErrors.length > 0) {
          failed++
          errors.push(`Baris ${rowNum}: ${validationErrors.join(', ')}`)
          setProgress(Math.round(((i + 1) / total) * 100))
          continue
        }

        try {
          const patient = buildPatient(row)
          const saved = await upsertPatient(patient)
          const patientId = saved?.id || patient.medical_record_number

          if (saved) {
            await insertPatientRecord(patientId, {
              diagnoses: [],
              keterangan: row.diagnosis_keterangan || '',
            }, {
              selectedTreatments: [],
              respiratoryDetail: row.respiratory_detail || '',
              antibiotics: row.antibiotics || '',
              otherPlan: row.other_plan || '',
            })
          }

          success++
        } catch (err) {
          failed++
          errors.push(`Baris ${rowNum}: ${err.message || err}`)
        }

        setProgress(Math.round(((i + 1) / total) * 100))
      }

      setResults({ success, failed, errors })
      showToast(`Import selesai: ${success} berhasil, ${failed} gagal`, failed > 0 ? 'warning' : 'check_circle')
    } catch (err) {
      showToast('Gagal import: ' + err.message, 'error')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Import Data Pasien dari Excel</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-label-md text-label-md text-on-surface">1. Unduh Template</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Unduh template Excel untuk memastikan format kolom sesuai.
            </p>
            <button
              className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-medium hover:bg-primary transition-colors flex items-center gap-2"
              type="button"
              onClick={downloadTemplate}
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Unduh Template
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="font-label-md text-label-md text-on-surface">2. Pilih File Excel</h4>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="w-full px-3 py-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
              onChange={handleFileChange}
              disabled={importing}
            />
            {file && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                File: <span className="font-mono">{file.name}</span> ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>
        </div>

        {preview.length > 0 && (
          <div className="space-y-2 border-t border-outline-variant pt-4">
            <h4 className="font-label-md text-label-md text-on-surface">Pratinjau Data (10 baris pertama)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-label-sm border border-outline-variant">
                <thead className="bg-surface-container-low">
                  <tr>
                    {Object.keys(preview[0]).map((key) => (
                      <th key={key} className="px-2 py-1 text-left font-semibold text-on-surface-variant">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-outline-variant">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-2 py-1 text-on-surface">{val === '' ? <span className="text-on-surface-variant">-</span> : String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-outline-variant">
          <button
            className="w-full px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-shadow shadow-[0_2px_8px_rgba(14,116,144,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            type="button"
            onClick={importData}
            disabled={importing || !file}
          >
            {importing ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Mengimport... {progress}%</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">upload</span>
                <span>Mulai Import</span>
              </>
            )}
          </button>
        </div>
      </div>

      {results.success > 0 || results.failed > 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-3">
          <h4 className="font-headline-sm text-headline-sm text-on-surface">Hasil Import</h4>
          <div className="flex items-center gap-4 text-label-md">
            <span className="flex items-center gap-1.5 text-tertiary">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Berhasil: <strong>{results.success}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-error">
              <span className="material-symbols-outlined text-[18px]">error</span>
              Gagal: <strong>{results.failed}</strong>
            </span>
          </div>
          {results.errors.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {results.errors.slice(0, 20).map((err, i) => (
                <p key={i} className="font-body-sm text-body-sm text-error bg-error-container p-2 rounded-lg">{err}</p>
              ))}
              {results.errors.length > 20 && (
                <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-2">
                  ... dan {results.errors.length - 20} error lainnya
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}