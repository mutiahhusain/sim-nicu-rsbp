export default function ReportsPage() {
  const reports = [
    { title: 'Sensus Harian NICU', desc: 'Rekap jumlah pasien, status rawat, dan kapasitas bed per hari.', icon: 'monitoring' },
    { title: 'Laporan Kejadian Ikutan (KIP)', desc: 'Dokumentasi kejadian tidak diharapkan selama perawatan.', icon: 'warning' },
    { title: 'Statistik Diagnosis Bulanan', desc: 'Golongan diagnosis utama, mortalitas, dan durasi rawat.', icon: 'bar_chart' },
    { title: 'Laporan Pulang / Discharge', desc: 'Rincian kepulangan, status akhir, dan follow-up.', icon: 'assignment_turned_in' },
    { title: 'Laporan Vaksinasi / Imunisasi', desc: 'Status imunisasi dasar neonatus sesuai usia gestasi.', icon: 'vaccines' },
    { title: 'Ekspor Data Medis', desc: 'Unduh ringkasan data pasien dalam format PDF / CSV.', icon: 'file_download' },
  ]

  return (
    <div className="flex flex-col w-full px-gutter-mobile py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Laporan</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Pilih jenis laporan yang ingin ditampilkan atau diekspor.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {reports.map((item) => (
          <button
            key={item.title}
            className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all text-left"
            type="button"
          >
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="font-label-md text-label-md text-on-surface font-semibold">{item.title}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-2">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
