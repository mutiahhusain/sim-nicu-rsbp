export default function HospitalIdentityForm({ identity, onChange, onSave, syncing, remoteLoaded }) {
  const inputBase = 'w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all'

  const handleChange = (field) => (e) => {
    onChange({ ...identity, [field]: e.target.value })
  }

  const handleLogoUpload = (field) => (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onChange({ ...identity, [field]: event.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">local_hospital</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Identitas Rumah Sakit</h2>
          </div>
          <div className="flex items-center gap-2">
            {remoteLoaded ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary text-label-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                Cloud Synced
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-container text-on-warning text-label-sm font-medium">
                <span className="material-symbols-outlined text-[14px]">cloud_off</span>
                Local Only
              </span>
            )}
          </div>
        </div>

        {/* KOP Logo Section - Logo Kiri (Pohuwato) & Logo Kanan (Bakti Husada) */}
        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium">Logo KOP Laporan (Kiri & Kanan)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Logo Kiri - Pohuwato */}
            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">Logo Kiri (Pemkab Pohuwato)</label>
              <div className="flex items-center gap-3">
                {identity.logoLeft ? (
                  <img alt="Logo Pohuwato" className="w-16 h-16 rounded-lg object-cover border border-surface-container" src={identity.logoLeft} />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">image</span>
                  </div>
                )}
                <button
                  className="px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1 font-label-sm text-label-sm"
                  type="button"
                  onClick={() => document.getElementById('logo-left-upload').click()}
                >
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Unggah
                </button>
                <input
                  accept="image/*"
                  className="hidden"
                  id="logo-left-upload"
                  type="file"
                  onChange={handleLogoUpload('logoLeft')}
                />
              </div>
            </div>

            {/* Logo Kanan - Bakti Husada */}
            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">Logo Kanan (Bakti Husada)</label>
              <div className="flex items-center gap-3">
                {identity.logoRight ? (
                  <img alt="Logo Bakti Husada" className="w-16 h-16 rounded-lg object-cover border border-surface-container" src={identity.logoRight} />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">image</span>
                  </div>
                )}
                <button
                  className="px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1 font-label-sm text-label-sm"
                  type="button"
                  onClick={() => document.getElementById('logo-right-upload').click()}
                >
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Unggah
                </button>
                <input
                  accept="image/*"
                  className="hidden"
                  id="logo-right-upload"
                  type="file"
                  onChange={handleLogoUpload('logoRight')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* KOP Text Lines */}
        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium">KOP Laporan - Baris Teks</label>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="kop-line1">Baris 1</label>
              <input
                className={inputBase}
                id="kop-line1"
                name="kopLine1"
                placeholder="Contoh: PEMERINTAH KABUPATEN POHUWATO"
                value={identity.kopLine1 || ''}
                onChange={handleChange('kopLine1')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="kop-line2">Baris 2</label>
              <input
                className={inputBase}
                id="kop-line2"
                name="kopLine2"
                placeholder="Contoh: RUMAH SAKIT UMUM DAERAH BUMI PANUA"
                value={identity.kopLine2 || ''}
                onChange={handleChange('kopLine2')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="kop-line3">Baris 3</label>
              <input
                className={inputBase}
                id="kop-line3"
                name="kopLine3"
                placeholder="Contoh: Jl. Dr. Herizal Umar Desa Botubilotahu Kec. Marisa Kab. Pohuwato Kode Pos 96266"
                value={identity.kopLine3 || ''}
                onChange={handleChange('kopLine3')}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-outline-variant pt-4 space-y-4">
          <h3 className="font-label-md text-label-md text-on-surface font-semibold">Identitas Dasar RS</h3>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="hospital-name">Nama Rumah Sakit</label>
            <input
              className={inputBase}
              id="hospital-name"
              name="name"
              placeholder="Nama rumah sakit"
              value={identity.name || ''}
              onChange={handleChange('name')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="hospital-address">Alamat</label>
            <input
              className={inputBase}
              id="hospital-address"
              name="address"
              placeholder="Alamat lengkap rumah sakit"
              value={identity.address || ''}
              onChange={handleChange('address')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="hospital-type">Tipe RS</label>
            <select
              className={inputBase}
              id="hospital-type"
              name="type"
              value={identity.type || ''}
              onChange={handleChange('type')}
            >
              <option value="">Pilih tipe RS</option>
              <option value="Rujukan">Rujukan</option>
              <option value="Partner">Partner</option>
              <option value="Utama">Utama</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="hospital-director">Nama Direktur</label>
            <input
              className={inputBase}
              id="hospital-director"
              name="director"
              placeholder="Nama direktur rumah sakit"
              value={identity.director || ''}
              onChange={handleChange('director')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="hospital-director-nip">NIP Direktur</label>
            <input
              className={inputBase}
              id="hospital-director-nip"
              name="directorNip"
              placeholder="NIP direktur rumah sakit"
              value={identity.directorNip || ''}
              onChange={handleChange('directorNip')}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-shadow shadow-[0_2px_8px_rgba(14,116,144,0.35)] flex items-center gap-1.5 disabled:opacity-50"
            type="button"
            onClick={onSave}
            disabled={syncing}
          >
            {syncing ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Menyimpan...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Simpan ke Cloud
              </>
            )}
          </button>
          {remoteLoaded && !syncing && (
            <span className="font-label-sm text-label-sm text-tertiary">Tersimpan di Supabase</span>
          )}
        </div>
      </div>
    </div>
  )
}