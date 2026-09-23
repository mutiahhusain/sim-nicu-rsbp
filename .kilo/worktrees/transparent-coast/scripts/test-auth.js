import fs from 'node:fs'
import path from 'node:path'

const envPath = path.join(process.cwd(), '.env.local')
const env = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/)
  if (m) a[m[1].trim()] = m[2].trim()
  return a
}, {})

const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

const run = async () => {
  console.log('URL:', url)
  console.log('Key prefix:', key.substring(0, 24))

  const signup = await fetch(`${url}/auth/v1/signup`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'Demo12345',
      options: { data: { full_name: 'Admin Demo' } },
    }),
  })
  console.log('signup status:', signup.status)
  console.log('signup body:', await signup.text())

  await new Promise((r) => setTimeout(r, 1500))

  const signin = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email: 'admin@example.com', password: 'Demo12345' }),
  })
  const sjson = await signin.json().catch(() => null)
  console.log('signin status:', signin.status)
  if (sjson?.user?.id) {
    console.log('signin user_id:', sjson.user.id)
    console.log('access_token prefix:', sjson.access_token?.substring(0, 32))
  } else {
    console.log('signin body:', JSON.stringify(sjson))
  }

  const prof = await fetch(`${url}/rest/v1/profiles?select=id,full_name,role`, { headers })
  const projson = await prof.json().catch(() => null)
  console.log('profiles status:', prof.status)
  console.log('profiles body:', JSON.stringify(projson))
}

run().catch((e) => {
  console.error('Script error:', e.message)
  process.exit(1)
})
