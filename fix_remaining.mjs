import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://jxurtzynghonozmusbfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dXJ0enluZ2hvbm96bXVzYmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDk5MzEsImV4cCI6MjEwNDYyNTkzMX0.Rc_PxJwZmgRybbUXGPW-qKBMtJ_td_lllSJ8-tpEBFk'
);

// Direct mapping: regency name -> numeric code
const REGMAP = {
  'Pohowato': '7504',
  'Gorontalo': '7571',
  'Donggala': '7203',
  'Buol': '7205',
  'Parigi Moutong': '7208',
  'Pangkajene Kepulauan': '7310',   // API: "Pangkajene dan Kepulauan"
  'Bone Bolango': '7503',
  'Palu Selatan': '7271',           // Not a regency, use Kota Palu (7271)
};

// Province name -> numeric code
const PROVMAP = {
  'Sulteng': '72',
  'Sulawesi Tengah': '72',
  'Sulawesi Selatan': '73',
};

(async () => {
  // Get patients with non-numeric regency_code
  const { data: patients, error } = await sb
    .from('patients')
    .select('id, province_code, regency_code');
  if (error) { console.error('Error:', error.message); return; }

  // Also get all distinct non-numeric province codes
  const nonNumericProv = [...new Set(patients
    .filter(p => p.province_code && !/^\d+$/.test(p.province_code))
    .map(p => p.province_code))];
  console.log('Non-numeric province codes:', nonNumericProv);

  for (const p of patients) {
    if (/^\d+$/.test(p.regency_code)) continue;

    const updates = {};

    // Fix regency_code
    if (REGMAP[p.regency_code]) {
      updates.regency_code = REGMAP[p.regency_code];
      console.log(`Patient ${p.id}: "${p.regency_code}" -> ${updates.regency_code}`);
    } else {
      console.log(`Patient ${p.id}: "${p.regency_code}" UNKNOWN - skipping`);
      continue;
    }

    // Fix province_code if needed
    if (p.province_code && !/^\d+$/.test(p.province_code)) {
      if (PROVMAP[p.province_code]) {
        updates.province_code = PROVMAP[p.province_code];
        console.log(`  province "${p.province_code}" -> ${updates.province_code}`);
      } else {
        // Try case-insensitive
        const lower = p.province_code.toLowerCase();
        for (const [name, code] of Object.entries(PROVMAP)) {
          if (name.toLowerCase() === lower) {
            updates.province_code = code;
            console.log(`  province "${p.province_code}" -> ${code}`);
            break;
          }
        }
      }
    }

    const { error: err3 } = await sb.from('patients').update(updates).eq('id', p.id);
    if (err3) console.error(`  Error:`, err3.message);
    else console.log(`  Updated patient ${p.id}`);
  }

  console.log('\nDone!');
})();
