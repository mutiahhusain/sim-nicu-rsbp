import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import supabase from '../lib/supabaseClient'

export default function AccountProfile() {
  const { user, profile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      setPhone(profile.phone ?? '')
      setAvatarUrl(profile.avatar_url ?? '')
    }
  }, [profile])

  const handleSave = async () => {
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
        setMsg('Gagal menyimpan: ' + error.message)
      }
    } else {
      setMsg('Profil berhasil disimpan.')
      setIsEditing(false)
    }
    setSaving(false)
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

  const inputBase = 'w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all'

  return (
    <div className="space-y-4">
      <div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Akun Profil</h2>
          </div>
          <button
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 font-label-sm text-label-sm transition-colors ${isEditing ? 'bg-surface-container text-on-surface hover:bg-surface-container-high' : 'bg-primary text-on-primary hover:bg-primary/90'}`}
            type="button"
            onClick={() => {
              if (isEditing) {
                handleSave()
              } else {
                setIsEditing(true)
              }
            }}
            disabled={saving || uploading}
          >
            <span className="material-symbols-outlined text-[16px]">{isEditing ? 'save' : 'edit'}</span>
            {isEditing ? (saving ? 'Menyimpan...' : 'Simpan') : 'Edit'}
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          {avatarUrl ? (
            <img alt="Foto Profil" className="w-20 h-20 rounded-full object-cover border border-surface-container" src={avatarUrl} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[28px]">account_circle</span>
            </div>
          )}
          {isEditing && (
            <div className="flex flex-col gap-2">
              <button
                className="px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1 font-label-sm text-label-sm"
                type="button"
                onClick={() => document.getElementById('profile-photo-upload').click()}
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
          )}
          <input
            accept="image/*"
            className="hidden"
            id="profile-photo-upload"
            type="file"
            onChange={handlePhotoUpload}
            disabled={uploading}
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium">Nama Lengkap</label>
            {isEditing ? (
              <input
                className={inputBase}
                placeholder="Nama lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            ) : (
              <p className="font-body-md text-body-md text-on-surface">{fullName || '(belum diisi)'}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium">Email</label>
            <p className="font-body-md text-body-md text-on-surface-variant">{user?.email || '-'}</p>
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium">No HP</label>
            {isEditing ? (
              <input
                className={inputBase}
                placeholder="Nomor HP"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            ) : (
              <p className="font-body-md text-body-md text-on-surface">{phone || '(belum diisi)'}</p>
            )}
          </div>
        </div>

        {msg && <p className="font-label-sm text-label-sm text-primary">{msg}</p>}
      </div>
    </div>
  )
}