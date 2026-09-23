import { createClient } from '@supabase/supabase-js';
import https from 'https';

const sb = createClient(
  'https://jxurtzynghonozmusbfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dXJ0enluZ2hvbm96bXVzYmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDk5MzEsImV4cCI6MjEwNDYyNTkzMX0.Rc_PxJwZmgRybbUXGPW-qKBMtJ_td_lllSJ8-tpEBFk'
);

const BASE_URL = 'https://cdn.jsdelivr.net/gh/izzulabadi/api-wilayah-indonesia-2026@v1.0.4/api';

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
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

// Also build province name -> code mapping
const provinceNameToCode = new Map();
const regencyNameToCode = new Map();

(async () => {
  console.log('Building province and regency maps...');

  const provinces = await fetchJSON(BASE_URL + '/provinces.json');
  console.log('Total provinces in API:', provinces?.length || 0);

  if (provinces) {
    for (const prov of provinces) {
      provinceNameToCode.set(prov.name, prov.id);
      provinceNameToCode.set(prov.name.toLowerCase(), prov.id);
      if (prov.altName) {
        provinceNameToCode.set(prov.altName, prov.id);
        provinceNameToCode.set(prov.altName.toLowerCase(), prov.id);
      }
    }
    // Add known abbreviations
    provinceNameToCode.set('Sulteng', '72');
    provinceNameToCode.set('sulteng', '72');
    provinceNameToCode.set('Sulawesi Tengah', '72');
    provinceNameToCode.set('sulawesi tengah', '72');
    provinceNameToCode.set('Sulawesi Selatan', '73');
    provinceNameToCode.set('sulawesi selatan', '73');
  }

  // Fetch all regencies using the API's provinces list (numeric codes)
  for (const prov of provinces) {
    const regs = await fetchJSON(BASE_URL + `/regencies/${prov.id}.json`);
    if (regs) {
      for (const r of regs) {
        // Store full name -> code
        regencyNameToCode.set(r.name, r.id);
        regencyNameToCode.set(r.name.toLowerCase(), r.id);
        // Also store name without "Kabupaten " or "Kota " prefix
        let shortName = r.name;
        if (shortName.startsWith('Kabupaten ')) shortName = shortName.substring(11);
        if (shortName.startsWith('Kota ')) shortName = shortName.substring(5);
        regencyNameToCode.set(shortName, r.id);
        regencyNameToCode.set(shortName.toLowerCase(), r.id);
      }
    }
  }

  // Add known corrections
  regencyNameToCode.set('Pohowato', '7504');  // Pohowato != Pohuwato in API
  regencyNameToCode.set('pohowato', '7504');

  console.log('Total regency name mappings:', regencyNameToCode.size);

  // Now get all patients with non-numeric regency_code
  const { data: patients, error: err2 } = await sb
    .from('patients')
    .select('id, province_code, regency_code');
  if (err2) { console.error('Error:', err2.message); return; }

  const updates = [];
  for (const p of patients) {
    if (/^\d+$/.test(p.regency_code)) continue;

    const code = regencyNameToCode.get(p.regency_code) || regencyNameToCode.get(p.regency_code.toLowerCase());
    if (code) {
      console.log(`Patient ${p.id}: regency "${p.regency_code}" -> ${code} (province ${p.province_code})`);
      updates.push({ id: p.id, regency_code: code });

      // Also fix province_code if it's non-numeric
      if (p.province_code && !/^\d+$/.test(p.province_code)) {
        const provCode = provinceNameToCode.get(p.province_code) || provinceNameToCode.get(p.province_code.toLowerCase());
        if (provCode) {
          console.log(`  province "${p.province_code}" -> ${provCode}`);
          updates[updates.length - 1].province_code = provCode;
        }
      }
    } else {
      console.log(`Patient ${p.id}: regency "${p.regency_code}" NOT FOUND`);
    }
  }

  console.log('\nTotal to update:', updates.length);

  // Execute updates
  for (const u of updates) {
    const { error: err3 } = await sb
      .from('patients')
      .update({ regency_code: u.regency_code, ...(u.province_code && { province_code: u.province_code }) })
      .eq('id', u.id);
    if (err3) console.error(`  Error updating patient ${u.id}:`, err3.message);
    else console.log(`  Updated patient ${u.id}`);
  }

  // Cleanup temp file
  console.log('\nDone!');
})();
