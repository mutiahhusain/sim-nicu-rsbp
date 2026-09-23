/**
 * scripts/create-admin.cjs
 * Buat akun admin demo baru (signup anon + upsert profile role admin).
 * Pakai anon key — policy profiles "Public access for demo" allow all (insert/update).
 * Jalankan bila login admin@example.com sudah tidak valid.
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = fs
  .readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
  .split(/\r?\n/)
  .reduce((acc, line) => {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) acc[m[1].trim()] = m[2].trim();
    return acc;
  }, {});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

(async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'Demo12345';
  const fullName = process.env.ADMIN_FULLNAME || 'Admin Demo';

  const { data: da, error: se } = await supabase.auth.signInWithPassword({ email, password });
  if (da?.user) {
    const uid = da.user.id;
    const { error: upErr } = await supabase
      .from('profiles')
      .upsert({ id: uid, full_name: fullName, role: 'admin' });
    console.log('Akun sudah ada -> upsert profile admin:', upErr ? upErr.message : 'OK');
    console.log('LOGIN:', email, '/', password);
    process.exit(0);
  }

  console.log('signin gagal (', se?.message, ') -> coba signup baru');
  const { data: { user }, error } = await supabase.auth.signUp({
    email, password, options: { data: { full_name: fullName } },
  });
  if (error || !user) {
    console.error('signup FAILED:', error ? error.message : 'no user');
    process.exit(1);
  }
  const { error: e2 } = await supabase.from('profiles').upsert({
    id: user.id, full_name: fullName, role: 'admin',
  });
  console.log('signup uid:', user.id, '| upsert profile:', e2 ? e2.message : 'OK role=admin');
  console.log('LOGIN:', email, '/', password);
  const { data: all } = await supabase.from('profiles').select('id,full_name,role');
  console.log('profiles:', JSON.stringify(all));
})();
