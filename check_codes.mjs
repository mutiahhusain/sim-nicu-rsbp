import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://jxurtzynghonozmusbfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dXJ0enluZ2hvbm96bXVzYmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDk5MzEsImV4cCI6MjEwNDYyNTkzMX0.Rc_PxJwZmgRybbUXGPW-qKBMtJ_td_lllSJ8-tpEBFk'
);

(async () => {
  const { data, error } = await sb.from('patients')
    .select('district_code, village_code')
    .not('district_code', 'is', null);
  if (error) { console.error('Error:', error.message); return; }

  const nonNumDistrict = [...new Set(data
    .filter(p => p.district_code && !/^\d+$/.test(p.district_code))
    .map(p => p.district_code))];
  const nonNumVillage = [...new Set(data
    .filter(p => p.village_code && !/^\d+$/.test(p.village_code))
    .map(p => p.village_code))];

  console.log('Non-numeric district codes:', nonNumDistrict);
  console.log('\nNon-numeric village codes:', nonNumVillage);
})();
