import { createClient } from '@supabase/supabase-js';
const sb = createClient(
  'https://jxurtzynghonozmusbfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dXJ0enluZ2hvbm96bXVzYmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDk5MzEsImV4cCI6MjEwNDYyNTkzMX0.Rc_PxJwZmgRybbUXGPW-qKBMtJ_td_lllSJ8-tpEBFk'
);
(async () => {
  const { count, error } = await sb
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('regency_code', 'Pohowato');
  if (!error) console.log('Pasien dengan regency_code="Pohowato":', count);

  const { data, error: err3 } = await sb
    .from('patients')
    .select('regency_code')
    .not('regency_code', 'is', null);
  if (!err3) {
    const codes = [...new Set(data.map(r => r.regency_code))];
    console.log('\nDistinct regency_code values:');
    codes.forEach(c => {
      const isNumeric = /^\d+$/.test(c);
      console.log(' ', c, isNumeric ? '(numeric)' : '(NON-NUMERIC - needs fix)');
    });
  }
})();
