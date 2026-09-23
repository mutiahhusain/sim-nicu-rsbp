import { supabase } from '../lib/supabaseClient'
import { defaultDiagnoses, defaultTreatments } from './defaults'

export async function fetchDiagnoses() {
  if (!supabase) return null
  const { data, error } = await supabase.from('diagnoses').select('*').eq('is_active', true)
  if (error) throw error
  return data
}

export async function fetchTreatments() {
  if (!supabase) return null
  const { data, error } = await supabase.from('treatments').select('*').eq('is_active', true)
  if (error) throw error
  return data
}

export async function seedMasterData() {
  if (!supabase) return null

  const existing = await fetchDiagnoses()
  if (!existing || existing.length === 0) {
    const { error } = await supabase.from('diagnoses').insert(
      defaultDiagnoses.map((d) => ({ name: d.name, category: d.category, is_active: true }))
    )
    if (error) throw error
  }

  const existingTx = await fetchTreatments()
  if (!existingTx || existingTx.length === 0) {
    const { error } = await supabase.from('treatments').insert(
      defaultTreatments.map((t) => ({ name: t.name, category: t.category, is_active: true }))
    )
    if (error) throw error
  }

  return { diagnoses: defaultDiagnoses, treatments: defaultTreatments }
}
