import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import supabase from '../lib/supabaseClient'

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [pwd, setPwd] = useState({ new: '', confirm: '' })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      setPhone(profile.phone ?? '')
      setAvatarUrl(profile.avatar_url ?? '')
    }
  }, [profile])

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    setMsg('')
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName, role: profile?.role ?? 'user', phone, avatar_url: avatarUrl })
    if (error) {
      if (error.code === '42703' || error.message.includes('column') && error.message.includes('phone')) {
        setMsg('Kolom phone belum ada di tabel profiles, jalankan ALTER TABLE public.profiles ADD COLUMN phone text')
      } else {
        setMsg('Gagal menyimpan profil: ' + error.message)
      }
    } else {
      setMsg('Profil berhasil disimpan.')
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (!pwd.new) return
    if (pwd.new !== pwd.confirm) {
      return setMsg('Password tidak cocok.')
    }
    setSaving(true)
    setMsg('')
    const { error } = await supabase.auth.updateUser({ password: pwd.new })
    if (error) setMsg('Gagal mengubah password: ' + error.message)
    else setMsg('Password berhasil diubah.')
    setSaving(false)
    setPwd({ new: '', confirm: '' })
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    setMsg('')
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })
      if (uploadError) {
        if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
          setMsg('Bucket avatars belum ada, buat bucket "avatars" di Supabase Storage')
        } else {
          setMsg('Gagal mengunggah foto: ' + uploadError.message)
        }
        setUploading(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: fullName, role: profile?.role ?? 'user', phone, avatar_url: publicUrl })
      if (profileError) {
        if (profileError.code === '42703' || profileError.message.includes('column') && profileError.message.includes('avatar_url')) {
          setMsg('Kolom avatar_url belum ada di tabel profiles, jalankan ALTER TABLE public.profiles ADD COLUMN avatar_url text')
        } else {
          setMsg('Gagal menyimpan URL foto: ' + profileError.message)
        }
      } else {
        setAvatarUrl(publicUrl)
        setMsg('Foto profil berhasil diperbarui.')
      }
    } catch (err) {
      setMsg('Terjadi kesalahan: ' + (err?.message || err))
    } finally {
      setUploading(false)
    }
  }

  const handlePhotoDelete = async () => {
    if (!user || !avatarUrl) return
    setUploading(true)
    setMsg('')
    try {
      const fileName = avatarUrl.split('/').pop()
      if (fileName) {
        await supabase.storage.from('avatars').remove([fileName])
      }
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: fullName, role: profile?.role ?? 'user', phone, avatar_url: null })
      if (error) {
        setMsg('Gagal menghapus foto: ' + error.message)
      } else {
        setAvatarUrl('')
        setMsg('Foto profil berhasil dihapus.')
      }
    } catch (err) {
      setMsg('Terjadi kesalahan: ' + (err?.message || err))
    } finally {
      setUploading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const inputBase = 'w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)]'

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-headline-sm text-headline-sm text-on-surface">Profil & Pengaturan Akun</h1>

      <p className="font-label-sm text-label-sm text-on-surface-variant">Email: {user?.email}</p>

      <div className="space-y-3">
        <label className="font-label-md text-label-md text-on-surface" htmlFor="full-name">Nama Lengkap</label>
        <input
          id="full-name"
          className={inputBase}
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Masukkan nama lengkap"
        />
      </div>

      <div className="space-y-3">
        <label className="font-label-md text-label-md text-on-surface" htmlFor="phone">No HP</label>
        <input
          id="phone"
          className={inputBase}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nomor HP"
        />
      </div>

      <div className="space-y-3">
        <label className="font-label-md text-label-md text-on-surface">Foto Profil</label>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img alt="Foto Profil" className="w-20 h-20 rounded-full object-cover border border-surface-container" src={avatarUrl} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[28px]">account_circle</span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <button
              className="px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1 font-label-sm text-label-sm"
              type="button"
              onClick={() => document.getElementById('avatar-upload').click()}
              disabled={uploading || saving}
            >
              <span className="material-symbols-outlined text-[18px]">upload</span>
              {uploading ? 'Mengunggah...' : 'Unggah Foto'}
            </button>
            {avatarUrl && (
              <button
                className="px-3 py-2 rounded-lg bg-error-container text-on-error-container hover:bg-error hover:text-on-error transition-colors flex items-center gap-1 font-label-sm text-label-sm"
                type="button"
                onClick={handlePhotoDelete}
                disabled={uploading || saving}
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Hapus Foto
              </button>
            )}
          </div>
          <input
            accept="image/*"
            className="hidden"
            id="avatar-upload"
            type="file"
            onChange={handlePhotoUpload}
            disabled={uploading}
          />
        </div>
      </div>

      <button
        className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-shadow shadow-[0_2px_8px_rgba(14,116,144,0.35)] flex items-center gap-1.5"
        onClick={handleSaveProfile}
        disabled={saving || !fullName.trim()}
      >
        <span>{saving ? 'Menyimpan...' : 'Simpan Profil'}</span>
      </button>

      <hr className="border-outline-variant" />

      <h2 className="font-label-md text-label-md text-on-surface font-semibold">Ubah Password</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="new-password">Password Baru</label>
          <input
            id="new-password"
            className={inputBase}
            type="password"
            value={pwd.new}
            onChange={(e) => setPwd({ ...pwd, new: e.target.value })}
            placeholder="Password baru"
            minLength={6}
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="confirm-password">Konfirmasi</label>
          <input
            id="confirm-password"
            className={inputBase}
            type="password"
            value={pwd.confirm}
            onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
            placeholder="Ulangi password"
            minLength={6}
          />
        </div>
      </div>
      <button
        className="px-4 py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary-shadow flex items-center gap-1.5"
        onClick={handleChangePassword}
        disabled={saving || !pwd.new}
      >
        <span>{saving ? 'Menyimpan...' : 'Ubah Password'}</span>
      </button>

      {msg && <p className="font-label-sm text-label-sm text-primary">{msg}</p>}

      <div className="pt-4 border-t border-outline-variant">
        <button
          className="px-4 py-2.5 rounded-lg bg-error-container text-on-error-container font-label-md text-label-md font-semibold hover:bg-error-container-hover flex items-center gap-1.5"
          onClick={handleSignOut}
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}