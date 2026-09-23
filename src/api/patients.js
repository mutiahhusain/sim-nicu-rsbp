import { supabase } from '../lib/supabaseClient'

export async function fetchPatients() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchPatientByRM(medicalRecordNumber) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('medical_record_number', medicalRecordNumber)
    .single()
  if (error) throw error
  return data
}

export async function fetchPatientDiagnoses(patientId) {
  if (!supabase || !patientId) return null
  const { data: diagData, error: diagError } = await supabase
    .from('patient_diagnoses')
    .select('*, diagnosis:diagnoses(*)')
    .eq('patient_id', patientId)
  if (diagError) throw diagError
  return diagData
}

export async function fetchPatientTreatments(patientId) {
  if (!supabase || !patientId) return null
  const { data: txData, error: txError } = await supabase
    .from('patient_treatments')
    .select('*, treatment:treatments(*)')
    .eq('patient_id', patientId)
  if (txError) throw txError
  return txData
}

export async function fetchClinicalNotes(patientId) {
  if (!supabase || !patientId) return null
  const { data, error } = await supabase
    .from('clinical_notes')
    .select('*')
    .eq('patient_id', patientId)
    .order('note_date', { ascending: true })
  if (error) throw error
  return data
}

export async function upsertPatient(patient) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('patients')
    .upsert([patient], { onConflict: ['medical_record_number'] })
    .select()
  if (error) throw error
  return data?.[0]
}

export async function insertPatientRecord(patientId, diagnosisForm, planForm) {
  if (!supabase || !patientId) return null

  const dxInserts = (diagnosisForm.diagnoses || []).map((dxId) => ({
    patient_id: patientId,
    diagnosis_id: dxId,
    diagnosis_type: 'primary',
    nicu_indication: diagnosisForm.keterangan || null,
  }))

  if (dxInserts.length) {
    const { error: dpError } = await supabase.from('patient_diagnoses').insert(dxInserts)
    if (dpError) throw dpError
  }

  const txInserts = (planForm.selectedTreatments || []).map((txId) => ({
    patient_id: patientId,
    treatment_id: txId,
    respiratory_detail: planForm.respiratoryDetail || null,
    antibiotics: planForm.antibiotics || null,
    other_plan: planForm.otherPlan || null,
  }))

  if (txInserts.length) {
    const { error: txError } = await supabase.from('patient_treatments').insert(txInserts)
    if (txError) throw txError
  }

  return txInserts.length > 0
}

export async function insertClinicalNote(patientId, noteDate, note) {
  if (!supabase || !patientId) return null
  const { data, error } = await supabase
    .from('clinical_notes')
    .insert({ patient_id: patientId, note_date: noteDate, note })
    .select()
  if (error) throw error
  return data?.[0]
}

export async function fetchMasterDiagnoses() {
  if (!supabase) return null
  const { data, error } = await supabase.from('diagnoses').select('*').eq('is_active', true).order('category', { ascending: true }).order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchMasterTreatments() {
  if (!supabase) return null
  const { data, error } = await supabase.from('treatments').select('*').eq('is_active', true).order('category', { ascending: true }).order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function addMasterDiagnosis(item) {
  if (!supabase) return null
  const { data, error } = await supabase.from('diagnoses').insert([{ ...item, is_active: true }]).select()
  if (error) throw error
  return data?.[0]
}

export async function addMasterTreatment(item) {
  if (!supabase) return null
  const { data, error } = await supabase.from('treatments').insert([{ ...item, is_active: true }]).select()
  if (error) throw error
  return data?.[0]
}

export async function deletePatient(id) {
  if (!supabase || !id) return null
  // Delete related records first (patient_id references patients.id — bigint)
  await supabase.from('patient_diagnoses').delete().eq('patient_id', id)
  await supabase.from('patient_treatments').delete().eq('patient_id', id)
  await supabase.from('clinical_notes').delete().eq('patient_id', id)

  const { error } = await supabase.from('patients').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function deletePatientDiagnoses(patientId) {
  if (!supabase || !patientId) return null
  const { error } = await supabase.from('patient_diagnoses').delete().eq('patient_id', patientId)
  if (error) throw error
  return true
}

export async function deletePatientTreatments(patientId) {
  if (!supabase || !patientId) return null
  const { error } = await supabase.from('patient_treatments').delete().eq('patient_id', patientId)
  if (error) throw error
  return true
}

export async function updatePatient(medicalRecordNumber, updates) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('medical_record_number', medicalRecordNumber)
    .select()
  if (error) throw error
  return data?.[0]
}
