import fs from 'fs';
import https from 'https';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env.local', 'utf8');
const sb = createClient(
  envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim(),
  envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim()
);

const BASE_URL = 'https://cdn.jsdelivr.net/gh/izzulabadi/api-wilayah-indonesia-2026@v1.0.4/api';

function fetchJSON(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
    }).on('error', () => resolve(null));
  });
}

// Levenshtein distance for fuzzy matching
function levenshtein(a, b) {
  a = a.toLowerCase(); b = b.toLowerCase();
  const m = a.length + 1, n = b.length + 1;
  const d = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) d[i][0] = i;
  for (let j = 0; j < n; j++) d[0][j] = j;
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      d[i][j] = a[i-1] === b[j-1] ? d[i-1][j-1] : 1 + Math.min(d[i-1][j], d[i][j-1], d[i-1][j-1]);
  return d[m-1][n-1];
}

// Direct known mappings for district codes
const districtCorrections = {
  'Patilanggi': '750406',    // "Patilanggio" - typo
  'Wonggarasi': '750411',    // "Wanggarasi" - typo
};

// For districts that need API lookup to find fuzzy matches, we'll check all regencies
// Posigadan, Boliyohuto, Talaga Jaya - these might be in different regencies
async function searchAllDistricts(name) {
  const provinces = await fetchJSON(BASE_URL + '/provinces.json');
  if (!provinces) return null;
  for (const prov of provinces) {
    const regs = await fetchJSON(BASE_URL + `/regencies/${prov.id}.json`);
    if (!regs) continue;
    for (const reg of regs) {
      const dists = await fetchJSON(BASE_URL + `/districts/${reg.id}.json`);
      if (!dists) continue;
      const match = dists.find(d => levenshtein(d.name, name) <= 2);
      if (match) {
        console.log(`  Found '${name}' -> ${match.id} (${match.name}) in regency ${reg.id}`);
        return { code: match.id, regency: reg.id, name: match.name };
      }
    }
  }
  return null;
}

// Known corrections for villages
const villageKnownCorrections = {
  'Karangetan': { dist: '750408', code: '7504082003', apiName: 'Karangetang' },
  'Torsiaje Jaya': { dist: '750401', code: '7504012003', apiName: 'Torosiaje Jaya' },
  'Siduwonge': { dist: '750403', code: '7504032018', apiName: 'Sidowonge' },
};

// For remaining villages, do fuzzy matching within known district
async function findVillage(name, districtCode) {
  const villages = await fetchJSON(BASE_URL + `/villages/${districtCode}.json`);
  if (!villages) return null;
  // Exact case-insensitive match
  let match = villages.find(v => v.name.toLowerCase() === name.toLowerCase());
  if (match) return match;
  // Partial match (contains)
  match = villages.find(v =>
    v.name.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(v.name.toLowerCase())
  );
  if (match) return match;
  // Levenshtein distance <= 3
  let best = null;
  let bestDist = Infinity;
  for (const v of villages) {
    const dist = levenshtein(v.name, name);
    if (dist < bestDist && dist <= 3) {
      bestDist = dist;
      best = v;
    }
  }
  if (best) {
    console.log(`  Fuzzy: "${name}" -> ${best.id} (${best.name}, lev=${bestDist})`);
    return best;
  }
  return null;
}

(async () => {
  // Get patients
  const { data: patients, error } = await sb.from('patients')
    .select('id, regency_code, district_code, village_code')
    .not('district_code', 'is', null);
  if (error) { console.error('Error:', error.message); return; }

  // === FIX DISTRICTS ===
  console.log('=== Fixing districts ===');
  const distUpdates = [];
  const fuzzyDistPatients = [];
  for (const p of patients) {
    if (!p.district_code || /^\d+$/.test(p.district_code)) continue;
    if (districtCorrections[p.district_code]) {
      console.log(`  Patient ${p.id}: "${p.district_code}" -> ${districtCorrections[p.district_code]}`);
      distUpdates.push({ id: p.id, district_code: districtCorrections[p.district_code] });
    } else {
      fuzzyDistPatients.push(p);
    }
  }

  // For fuzzy district matches (search all regencies)
  for (const p of fuzzyDistPatients) {
    const result = await searchAllDistricts(p.district_code);
    if (result) {
      console.log(`  Patient ${p.id}: "${p.district_code}" -> ${result.code} (regency ${result.regency})`);
      distUpdates.push({ id: p.id, district_code: result.code, regency_code: result.regency });
    } else {
      console.log(`  Patient ${p.id}: "${p.district_code}" - could not find in any regency`);
    }
  }

  // Execute district updates
  for (const u of distUpdates) {
    const updates = { district_code: u.district_code };
    if (u.regency_code) updates.regency_code = u.regency_code;
    const { error: e } = await sb.from('patients').update(updates).eq('id', u.id);
    if (e) console.error(`  Error ${u.id}:`, e.message);
  }

  // === Re-fetch for villages ===
  const { data: updatedPatients, error: err2 } = await sb.from('patients')
    .select('id, district_code, village_code')
    .not('village_code', 'is', null);

  console.log('\n=== Fixing villages ===');
  const villUpdates = [];
  for (const p of updatedPatients) {
    if (!p.village_code || /^\d+$/.test(p.village_code)) continue;
    if (!p.district_code || !/^\d+$/.test(p.district_code)) {
      console.log(`  Patient ${p.id}: village="${p.village_code}" but district="${p.district_code}" is not numeric - skipping`);
      continue;
    }

    // Check known corrections first
    if (villageKnownCorrections[p.village_code]) {
      const fix = villageKnownCorrections[p.village_code];
      console.log(`  Patient ${p.id}: "${p.village_code}" -> ${fix.code} (${fix.apiName})`);
      villUpdates.push({ id: p.id, village_code: fix.code });
      continue;
    }

    // Fuzzy search
    const match = await findVillage(p.village_code, p.district_code);
    if (match) {
      console.log(`  Patient ${p.id}: "${p.village_code}" -> ${match.id} (${match.name})`);
      villUpdates.push({ id: p.id, village_code: match.id });
    } else {
      console.log(`  Patient ${p.id}: "${p.village_code}" NOT FOUND in district ${p.district_code}`);
    }
  }

  for (const u of villUpdates) {
    const { error: e } = await sb.from('patients').update({ village_code: u.village_code }).eq('id', u.id);
    if (e) console.error(`  Error ${u.id}:`, e.message);
  }

  console.log('\nDone!');
})();
