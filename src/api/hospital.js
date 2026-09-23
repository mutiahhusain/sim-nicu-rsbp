import { supabase } from '../lib/supabaseClient'

// Convert frontend camelCase to database snake_case
function toDb(identity) {
  const payload = {
    name: identity.name,
    address: identity.address,
    type: identity.type,
    director: identity.director,
    director_nip: identity.directorNip,
    logo: identity.logo,
    logo_left: identity.logoLeft,
    logo_right: identity.logoRight,
    kop_line1: identity.kopLine1,
    kop_line2: identity.kopLine2,
    kop_line3: identity.kopLine3,
    updated_at: new Date().toISOString(),
  }
  // Only include id if it exists (for updates), let DB generate for new records
  if (identity.id) {
    payload.id = identity.id
  }
  return payload
}

// Convert database snake_case to frontend camelCase
function fromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    type: row.type,
    director: row.director,
    directorNip: row.director_nip,
    logo: row.logo,
    logoLeft: row.logo_left,
    logoRight: row.logo_right,
    kopLine1: row.kop_line1,
    kopLine2: row.kop_line2,
    kopLine3: row.kop_line3,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function fetchHospitalIdentity() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('hospital_identity')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return fromDb(data)
}

export async function upsertHospitalIdentity(identity) {
  if (!supabase) return null
  const payload = toDb(identity)
  const { data, error } = await supabase
    .from('hospital_identity')
    .upsert([payload], { onConflict: 'id' })
    .select()
  if (error) throw error
  return fromDb(data?.[0])
}