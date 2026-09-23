import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const url = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

const sb = createClient(url, key);

(async () => {
  const { data, error } = await sb.from('patients')
    .select('id, regency_code, district_code, village_code')
    .not('district_code', 'is', null);
  if (error) { console.error('Error:', error.message); return; }

  console.log('=== Patients with non-numeric district_code ===');
  const nonNum = data.filter(p => p.district_code && !/^\d+$/.test(p.district_code));
  nonNum.forEach(p => console.log(`  id=${p.id}, regency="${p.regency_code}", district="${p.district_code}", village="${p.village_code}"`));

  console.log('\n=== Patients with non-numeric village_code ===');
  const nonNumV = data.filter(p => p.village_code && !/^\d+$/.test(p.village_code));
  nonNumV.forEach(p => console.log(`  id=${p.id}, regency="${p.regency_code}", district="${p.district_code}", village="${p.village_code}"`));
})();
