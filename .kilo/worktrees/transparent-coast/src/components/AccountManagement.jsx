import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import supabase from '../lib/supabaseClient'
import supabaseAdmin from '../lib/supabaseAdmin'

export default function AccountManagement() {
  const { isAdmin } = useAuth()
  const adminAvailable = !!supabaseAdmin

  const [profiles, setProfiles] = useState([])
  const [usersMap, setUsersMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'user' })

  const fetchData = async () => {
    setLoading(true)
    setMsg('')
    try {
      if (adminAvailable) {
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) throw listError
        const usersMapLocal = {}
        users.forEach((u) => {
          usersMapLocal[u.id] = {
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            full_name: u.user_metadata?.full_name || '',
          }
        })
        setUsersMap(usersMapLocal)

        const { data: profilesData, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, role')
        if (profilesError) throw profilesError
        setProfiles(profilesData || [])
      } else {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, role')
        if (profilesError) throw profilesError
        setProfiles(profilesData || [])
      }
    } catch (err) {
      setMsg('Gagal memuat akun: ' + (err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openAdd = () => {
    setEditingUser(null)
    setForm({ email: '', password: '', full_name: '', role: 'user' })
    setShowForm(true)
  }

  const openEdit = (profile) => {
    const userData = adminAvailable ? usersMap[profile.id] : null
    setEditingUser(profile)
    setForm({
      email: userData?.email || '',
      password: '',
      full_name: profile.full_name || '',
      role: profile.role || 'user',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      if (editingUser) {
        if (adminAvailable) {
          const updatePayload = {}
          if (form.email) updatePayload.email = form.email
          if (form.password) updatePayload.password = form.password
          if (form.full_name !== undefined) updatePayload.user_metadata = { full_name: form.full_name }

          const { error: authError } = await supabaseAdmin.auth.admin.updateUser(editingUser.id, updatePayload)
          if (authError) throw authError

          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({ id: editingUser.id, full_name: form.full_name, role: form.role })
          if (profileError) throw profileError
        } else {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ full_name: form.full_name, role: form.role })
            .eq('id', editingUser.id)
          if (profileError) throw profileError
        }
        setMsg('Akun berhasil diperbarui.')
      } else {
        if (adminAvailable) {
          const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: form.email,
            password: form.password,
            user_metadata: { full_name: form.full_name },
          })
          if (createError) throw createError
          if (!created.user) throw new Error('Gagal membuat akun.')

          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({ id: created.user.id, full_name: form.full_name, role: form.role })
          if (profileError) throw profileError
        } else {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: { data: { full_name: form.full_name } },
          })
          if (signUpError) throw signUpError
          if (data?.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({ id: data.user.id, full_name: form.full_name, role: form.role })
            if (profileError) throw profileError
          }
        }
        setMsg('Akun berhasil dibuat.')
      }
      setShowForm(false)
      fetchData()
    } catch (err) {
      setMsg((editingUser ? 'Gagal memperbarui: ' : 'Gagal membuat akun: ') + (err?.message || err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus akun ini? Tindakan ini tidak bisa dibatalkan.')) return
    try {
      if (adminAvailable) {
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
        if (authError) throw authError
        const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', id)
        if (profileError) throw profileError
      } else {
        const { error: profileError } = await supabase.from('profiles').delete().eq('id', id)
        if (profileError) throw profileError
        setMsg('Akun berhasil dihapus. Auth user tidak dihapus (perlu service_role).')
      }
      setProfiles((prev) => prev.filter((p) => p.id !== id))
      setUsersMap((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      if (adminAvailable) setMsg('Akun berhasil dihapus.')
    } catch (err) {
      setMsg('Gagal menghapus akun: ' + (err?.message || err))
    }
  }

  const handleRoleChange = async (id, role) => {
    try {
      if (adminAvailable) {
        const { error } = await supabaseAdmin.from('profiles').update({ role }).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
        if (error) throw error
      }
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role } : p)))
      setMsg('Peran berhasil diubah.')
    } catch (err) {
      setMsg('Gagal mengubah peran: ' + (err?.message || err))
    }
  }

  const getDisplayName = (p) => {
    const name = p.full_name || (adminAvailable ? usersMap[p.id]?.full_name : '') || '(belum diisi)'
    return name
  }

  const getEmail = (p) => {
    return adminAvailable ? usersMap[p.id]?.email || '-' : '-'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline-sm text-headline-sm text-on-surface">Kelola Akun Pengguna</h1>
        {isAdmin && (
          <button
            className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-shadow shadow-[0_2px_8px_rgba(14,116,144,0.35)] active:scale-[0.98] transition-all flex items-center gap-1.5"
            onClick={openAdd}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Akun</span>
          </button>
        )}
      </div>

      {!adminAvailable && (
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant font-label-sm text-label-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] align-middle mr-1.5">info</span>
          Fitur penuh kelola akun membutuhkan{' '}
          <span className="font-semibold text-on-surface">VITE_SUPABASE_SERVICE_ROLE_KEY</span>. Saat ini hanyaubah peran dan hapus profil (anon) yang tersedia.
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
          <span>Memuat akun...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {showForm && (
            <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-outline-variant bg-surface-container-low space-y-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                {editingUser ? 'Edit Akun' : 'Tambah Akun'}
              </h2>
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="full-name">Nama Lengkap</label>
                <input
                  id="full-name"
                  className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
                  placeholder="Nama lengkap"
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                />
              </div>
              {(adminAvailable || !editingUser) && (
                <div className="space-y-1.5">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email</label>
                  <input
                  id="email"
                  className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
                  placeholder="nama@email.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required={!editingUser}
                />
                </div>
              )}
              {(adminAvailable || !editingUser) && (
                <div className="space-y-1.5">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                    Password {editingUser && <span className="text-on-surface-variant">(kosongkan jika tidak diubah)</span>}
                  </label>
                  <input
                    id="password"
                    className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
                    placeholder={editingUser ? '••••••••' : 'Minimal 6 karakter'}
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editingUser}
                    minLength={6}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="role">Peran</label>
                <select
                  id="role"
                  className="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-shadow shadow-[0_2px_8px_rgba(14,116,144,0.35)] active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                  <span>{editingUser ? 'Simpan' : 'Buat Akun'}</span>
                </button>
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-highest transition-colors"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
            <table className="w-full text-label-md">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-2.5 text-left font-label-md text-label-md text-on-surface-variant">Nama</th>
                  <th className="px-4 py-2.5 text-left font-label-md text-label-md text-on-surface-variant">Email</th>
                  <th className="px-4 py-2.5 text-left font-label-md text-label-md text-on-surface-variant">Peran</th>
                  <th className="px-4 py-2.5 text-right font-label-md text-label-md text-on-surface-variant">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {profiles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[32px]">person_off</span>
                        <span className="font-label-sm text-label-sm">Belum ada akun.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  profiles.map((p) => (
                    <tr key={p.id} className="border-t border-outline-variant">
                      <td className="px-4 py-2.5 text-on-surface">{getDisplayName(p)}</td>
                      <td className="px-4 py-2.5 text-on-surface">{getEmail(p)}</td>
                      <td className="px-4 py-2.5">
                        {isAdmin ? (
                          <select
                            className="px-2 py-1 rounded-lg bg-surface-container-low font-label-sm text-label-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest"
                            value={p.role}
                            onChange={(e) => handleRoleChange(p.id, e.target.value)}
                          >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                          </select>
                        ) : (
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{p.role}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {isAdmin && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              className="w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
                              onClick={() => openEdit(p)}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              className="w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-error-container text-on-error-container transition-colors"
                              onClick={() => handleDelete(p.id)}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {msg && <p className="font-label-sm text-label-sm text-primary">{msg}</p>}
    </div>
  )
}
