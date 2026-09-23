/**
 * scripts/seed-master.cjs
 * Seed default diagnoses & treatments ke Supabase.
 * - Jika VITE_SUPABASE_SERVICE_ROLE_KEY ada -> pakai itu (boleh INSERT; anon hanya SELECT).
 * - Jika tidak -> pakai anon key (akan dapat 401 karena policy hanya `for select`); beri tahu cara set key.
 * Jalankan setelah menerapkan migration 20240911000001_reset_and_recreate.sql.
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
const usingServiceRole = !!env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const key = usingServiceRole ? env.VITE_SUPABASE_SERVICE_ROLE_KEY : env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL / key in .env.local');
  process.exit(1);
}

const h = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };

function authHeaders() {
  return { apikey: key, Authorization: 'Bearer ' + key };
}

const diagnoses = [
  { name: 'Respiratory Distress Syndrome (RDS)', category: 'Pernapasan', is_active: true },
  { name: 'Berat Bayi Lahir Rendah (BBLR/BBLSR)', category: 'Nutrisi', is_active: true },
  { name: 'Asfiksia Neonatorum Sedang-Berat', category: 'Pernapasan', is_active: true },
  { name: 'Hiperbilirubinemia / Fototerapi Intensif', category: 'Hematologi', is_active: true },
  { name: 'Sepsis Neonatorum Awaitan Dini', category: 'Infeksi', is_active: true },
];
const treatments = [
  { name: 'Bubble CPAP', category: 'Pernapasan', is_active: true },
  { name: 'Ventilator PC-SIMV', category: 'Pernapasan', is_active: true },
  { name: 'HFNC (High Flow Nasal Cannula)', category: 'Pernapasan', is_active: true },
  { name: 'Fototerapi Intensif', category: 'Hematologi', is_active: true },
  { name: 'UVC (Umbilical Venous Catheter)', category: 'Vaskular', is_active: true },
  { name: 'TPN / Nutrisi Enteral', category: 'Nutrisi', is_active: true },
  { name: 'Antibiotik IV (Ampicillin + Gentamisin)', category: 'Infeksi', is_active: true },
  { name: 'Surfactant Replacement', category: 'Pernapasan', is_active: true },
];

(async () => {
  console.log('using service_role key:', usingServiceRole);

  const dj = (await (await fetch(url + '/rest/v1/diagnoses?select=id&limit=1', { headers: authHeaders() })).json()).catch(() => []);
  const d = Array.isArray(dj) ? dj : [];
  if (!d.length) {
    const r = await fetch(url + '/rest/v1/diagnoses', { method: 'POST', headers: h, body: JSON.stringify(diagnoses) });
    console.log('seed diagnoses status:', r.status, r.ok ? 'OK' : await r.text());
  } else {
    console.log('diagnoses sudah ada:', d.length);
  }

  const tj = (await (await fetch(url + '/rest/v1/treatments?select=id&limit=1', { headers: authHeaders() })).json()).catch(() => []);
  const t = Array.isArray(tj) ? tj : [];
  if (!t.length) {
    const r2 = await fetch(url + '/rest/v1/treatments', { method: 'POST', headers: h, body: JSON.stringify(treatments) });
    console.log('seed treatments status:', r2.status, r2.ok ? 'OK' : await r2.text());
  } else {
    console.log('treatments sudah ada:', t.length);
  }

  const v1 = await fetch(url + '/rest/v1/diagnoses?select=id,name&order=name', { headers: authHeaders() });
  console.log('diagnoses:', v1.status, (Array.isArray(await v1.json()) ? await v1.json() : []).map((x) => x.name));
  const v2 = await fetch(url + '/rest/v1/treatments?select=id,name&order=name', { headers: authHeaders() });
  const txList = Array.isArray(await v2.json()) ? await v2.json() : [];
  console.log('treatments:', v2.status, txList.map((x) => x.name));

  if (!usingServiceRole) {
    console.log('NOTE: anon policy hanya `for select` untuk diagnoses/treatments -> 401. Tambahkan VITE_SUPABASE_SERVICE_ROLE_KEY di .env.local supaya INSERT berhasil.');
  }
})();
