/**
 * scripts/setup-admin.cjs
 * Re-(upsert) profile admin untuk akun demo agar bisa login sebagai admin.
 * Pakai anon key (policy profiles "Public access for demo" allow all).
 * Jalankan setelah migration 001 (yang DROP profiles).
 */
const fs = require('fs');
const path = require('path');

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

const h = {
  apikey: key,
  Authorization: 'Bearer ' + key,
  'Content-Type': 'application/json',
};

(async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'Demo12345';

  const si = await fetch(url + '/auth/v1/signin', {
    method: 'POST', headers: h, body: JSON.stringify({ email, password }),
  });
  const sjson = await si.json();
  console.log('signin status:', si.status, 'user_id:', sjson?.user?.id);
  if (si.status !== 200 || !sjson.user) {
    console.error('Sign-in gagal:', JSON.stringify(sjson));
    process.exit(1);
  }
  const uid = sjson.user.id;

  const pr = await fetch(url + '/rest/v1/profiles?id=eq.' + uid, {
    method: 'PUT', headers: { ...h, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ id: uid, full_name: 'Admin Demo', role: 'admin' }),
  });
  console.log('upsert profile status:', pr.status, await pr.text());

  const pr2 = await fetch(url + '/rest/v1/profiles?select=id,full_name,role', {
    headers: { apikey: key, Authorization: 'Bearer ' + key },
  });
  console.log('profiles:', pr2.status, await pr2.text());
})();
