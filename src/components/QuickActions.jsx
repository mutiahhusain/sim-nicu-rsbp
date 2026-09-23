import { showToast } from '../utils/toast'

export default function QuickActions() {
  return (
    <div className="space-y-2 pt-1">
      <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold px-1">Aksi Cepat Tim Medis</span>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm font-semibold shadow-sm hover:bg-on-primary-fixed-variant active:scale-[0.99] transition-all" id="btn-registrasi" type="button" onClick={() => showToast('Membuka formulir pendaftaran neonatal darurat...', 'app_registration')}>
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>Registrasi Pasien Baru</span>
        </button>
        <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-container-high text-on-surface font-headline-sm text-headline-sm font-semibold shadow-sm hover:bg-surface-container-highest active:scale-[0.99] transition-all" id="btn-sensus" type="button" onClick={() => showToast('Sensus harian NICU terverifikasi & siap dicetak (PDF)', 'description')}>
          <span className="material-symbols-outlined text-[20px] text-primary">print</span>
          <span>Cetak Sensus Harian</span>
        </button>
        <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-container-lowest text-tertiary font-headline-sm text-headline-sm font-semibold shadow-sm hover:bg-surface-container-low active:scale-[0.99] transition-all" id="btn-pulang" type="button" onClick={() => showToast('Membuka checklist verifikasi kepulangan 2 pasien', 'fact_check')}>
          <span className="material-symbols-outlined text-[20px] text-tertiary">assignment_turned_in</span>
          <span>Cek Pasien Pulang (2)</span>
        </button>
      </div>
    </div>
  )
}
