export default function RoomIdentityForm({ identity, onChange, onSave, msg }) {
  const inputBase = 'w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all'

  const handleChange = (field) => (e) => {
    onChange({ ...identity, [field]: e.target.value })
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[18px]">room</span>
          </div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Identitas Ruangan</h2>
        </div>

        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="room-name">Nama Ruangan</label>
          <input
            className={inputBase}
            id="room-name"
            name="roomName"
            placeholder="Nama ruangan (contoh: Ruang NICU)"
            value={identity.roomName || ''}
            onChange={handleChange('roomName')}
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="room-admin">Nama Admin Ruangan</label>
          <input
            className={inputBase}
            id="room-admin"
            name="adminName"
            placeholder="Nama admin yang bertanggung jawab"
            value={identity.adminName || ''}
            onChange={handleChange('adminName')}
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="room-head">Nama Kepala Ruangan</label>
          <input
            className={inputBase}
            id="room-head"
            name="headName"
            placeholder="Nama kepala ruangan (biasanya dokter spesialis)"
            value={identity.headName || ''}
            onChange={handleChange('headName')}
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="room-head-nip">NIP Kepala Ruangan</label>
          <input
            className={inputBase}
            id="room-head-nip"
            name="headNip"
            placeholder="NIP kepala ruangan"
            value={identity.headNip || ''}
            onChange={handleChange('headNip')}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-shadow shadow-[0_2px_8px_rgba(14,116,144,0.35)] flex items-center gap-1.5"
            type="button"
            onClick={() => onSave?.(identity)}
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Simpan
          </button>
          {msg && <p className="font-label-sm text-label-sm text-primary">{msg}</p>}
        </div>
      </div>
    </div>
  )
}