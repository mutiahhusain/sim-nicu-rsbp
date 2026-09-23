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

// Names we need to find
const districtLookups = [
  { name: 'Patilanggi', regency: '7504' },
  { name: 'Wonggarasi', regency: '7504' },
  { name: 'Posigadan', regency: '7571' },
  { name: 'Boliyohuto', regency: '7571' },
  { name: 'Talaga Jaya', regency: '7571' },
];

const villageLookups = [
  { name: 'Karangetan', district: '750408' },
  { name: 'Panca Karsa', district: '750407' },
  { name: 'Bukit Tinggi', district: '750401' },
  { name: 'Salum Pengut', district: '720804' },
  { name: 'Taopa', district: '720804' },
  { name: 'Lemito Pantai', district: '750402' },
  { name: 'Torsiaje Jaya', district: '750401' },
  { name: 'Lakea 1', district: '720502' },
  { name: 'Siduwonge', district: '750403' },
  { name: 'Panca Karsa 1', district: '750407' },
  { name: 'Panca Karsa 2', district: '750407' },
];

(async () => {
  console.log('=== District lookups ===');
  for (const lookup of districtLookups) {
    const districts = await fetchJSON(BASE_URL + `/districts/${lookup.regency}.json`);
    if (!districts) {
      console.log(`  No districts for regency ${lookup.regency}`);
      continue;
    }
    // Search for the name
    const matches = districts.filter(d =>
      d.name.toLowerCase().includes(lookup.name.toLowerCase()) ||
      lookup.name.toLowerCase().includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().replace(/kecamatan\s+/, '').includes(lookup.name.toLowerCase().replace(/kecamatan\s+/, ''))
    );
    if (matches.length > 0) {
      matches.forEach(m => console.log(`  ${lookup.name} -> ${m.id} (${m.name})`));
    } else {
      console.log(`  ${lookup.name} NOT FOUND in regency ${lookup.regency}. All districts:`);
      districts.forEach(d => console.log(`    ${d.id}: ${d.name}`));
    }
  }

  console.log('\n=== Village lookups ===');
  const uniqueDistricts = [...new Set(villageLookups.map(v => v.district))];
  const villageMaps = {};
  for (const dc of uniqueDistricts) {
    const villages = await fetchJSON(BASE_URL + `/villages/${dc}.json`);
    if (villages) {
      console.log(`\nDistrict ${dc} has ${villages.length} villages:`);
      villages.forEach(v => console.log(`  ${v.id}: ${v.name}`));
      const map = new Map();
      for (const v of villages) map.set(v.name.toLowerCase(), v.id);
      villageMaps[dc] = map;
    } else {
      console.log(`\nDistrict ${dc}: no data`);
    }
  }

  console.log('\n=== Village lookup results ===');
  for (const lookup of villageLookups) {
    const map = villageMaps[lookup.district];
    if (!map) {
      console.log(`  ${lookup.name} (district ${lookup.district}): no village data`);
      continue;
    }
    const code = map.get(lookup.name.toLowerCase());
    if (code) {
      console.log(`  ${lookup.name} -> ${code}`);
    } else {
      const partial = [...map.entries()].filter(([k]) => k.includes(lookup.name.toLowerCase().split(' ')[0]));
      if (partial.length > 0) {
        console.log(`  ${lookup.name} -> partial match:`, partial.map(([k, v]) => `${v} (${k})`));
      } else {
        console.log(`  ${lookup.name} NOT FOUND (district ${lookup.district})`);
      }
    }
  }
})();
