import { createClient } from '@supabase/supabase-js';
import https from 'https';

// Read env vars
const SUPABASE_URL = 'https://jxurtzynghonozmusbfd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dXJ0enluZ2hvbm96bXVzYmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDk5MzEsImV4cCI6MjEwNDYyNTkzMX0.Rc_PxJwZmgRybbUXGPW-qKBMtJ_td_lllSJ8-tpEBFk';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BASE_URL = 'https://cdn.jsdelivr.net/gh/izzulabadi/api-wilayah-indonesia-2026@v1.0.4/api';

function fetchJSON(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  const { data: patients, error } = await sb.from('patients')
    .select('id, district_code, village_code')
    .not('district_code', 'is', null);
  if (error) { console.error('Error:', error.message); return; }

  // Find unique numeric regency codes (needed for district lookup)
  // But first, get regency codes too
  const { data: patientsWithRegency, error: err2 } = await sb.from('patients')
    .select('id, regency_code, district_code, village_code')
    .not('regency_code', 'is', null);
  if (err2) { console.error('Error:', err2.message); return; }

  const regencyCodes = [...new Set(patientsWithRegency
    .filter(p => /^\d+$/.test(p.regency_code))
    .map(p => p.regency_code))];
  console.log('Numeric regency codes:', regencyCodes);

  // Build district maps per regency
  const districtMaps = {};
  for (const rc of regencyCodes) {
    const districts = await fetchJSON(BASE_URL + `/districts/${rc}.json`);
    if (districts) {
      const map = new Map();
      for (const d of districts) {
        map.set(d.name, d.id);
        map.set(d.name.toLowerCase(), d.id);
      }
      districtMaps[rc] = map;
    } else {
      console.log(`  No districts for regency ${rc}`);
    }
  }

  // Update district_code
  const districtUpdates = [];
  for (const p of patientsWithRegency) {
    if (!p.district_code || /^\d+$/.test(p.district_code)) continue;
    if (!p.regency_code || !/^\d+$/.test(p.regency_code)) {
      console.log(`  Patient ${p.id}: regency="${p.regency_code}" is not numeric, cannot fix district="${p.district_code}"`);
      continue;
    }
    const map = districtMaps[p.regency_code];
    if (!map) {
      console.log(`  Patient ${p.id}: no map for regency ${p.regency_code}`);
      continue;
    }
    const code = map.get(p.district_code) || map.get(p.district_code.toLowerCase());
    if (code) {
      console.log(`  Patient ${p.id}: "${p.district_code}" -> ${code}`);
      districtUpdates.push({ id: p.id, district_code: code });
    } else {
      console.log(`  Patient ${p.id}: "${p.district_code}" NOT FOUND`);
    }
  }

  console.log('\nDistrict updates:', districtUpdates.length);
  for (const u of districtUpdates) {
    const { error: e } = await sb.from('patients').update({ district_code: u.district_code }).eq('id', u.id);
    if (e) console.error(`  Error ${u.id}:`, e.message);
  }
  console.log('District updates complete');

  // Re-fetch for villages
  const { data: updated, error: err3 } = await sb.from('patients')
    .select('id, district_code, village_code')
    .not('district_code', 'is', null)
    .not('village_code', 'is', null);
  if (err3) { console.error('Error:', err3.message); return; }

  const districtCodes = [...new Set(updated
    .filter(p => /^\d+$/.test(p.district_code))
    .map(p => p.district_code))];
  console.log('\nNumeric district codes:', districtCodes);

  // Build village maps per district
  const villageMaps = {};
  for (const dc of districtCodes) {
    const villages = await fetchJSON(BASE_URL + `/villages/${dc}.json`);
    if (villages) {
      const map = new Map();
      for (const v of villages) {
        map.set(v.name, v.id);
        map.set(v.name.toLowerCase(), v.id);
      }
      villageMaps[dc] = map;
    } else {
      console.log(`  No villages for district ${dc}`);
    }
  }

  // Update village_code
  const villageUpdates = [];
  for (const p of updated) {
    if (!p.village_code || /^\d+$/.test(p.village_code)) continue;
    if (!p.district_code || !/^\d+$/.test(p.district_code)) continue;
    const map = villageMaps[p.district_code];
    if (!map) continue;
    const code = map.get(p.village_code) || map.get(p.village_code.toLowerCase());
    if (code) {
      console.log(`  Patient ${p.id}: "${p.village_code}" -> ${code}`);
      villageUpdates.push({ id: p.id, village_code: code });
    } else {
      console.log(`  Patient ${p.id}: "${p.village_code}" NOT FOUND (district ${p.district_code})`);
    }
  }

  console.log('\nVillage updates:', villageUpdates.length);
  for (const u of villageUpdates) {
    const { error: e } = await sb.from('patients').update({ village_code: u.village_code }).eq('id', u.id);
    if (e) console.error(`  Error ${u.id}:`, e.message);
  }
  console.log('\nDone!');
})();
