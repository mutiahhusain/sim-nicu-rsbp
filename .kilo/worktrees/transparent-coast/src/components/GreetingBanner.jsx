export default function GreetingBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-card-padding-md shadow-sm">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] mr-1 text-primary">verified_user</span>
              Ruang NICU Level III
            </span>
            <span className="inline-flex items-center gap-1 font-code-tabular text-code-tabular text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
              Shift Siang (14:00 - 21:00)
            </span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
            Selamat Bertugas, dr. Hendra, Sp.A(K)
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
            <span>Kamis, 24 Oktober 2024 • Sinkronisasi Telemetri Aktif</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-lowest p-2.5 rounded-lg shadow-sm self-start sm:self-center">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface-container"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-primary-container"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="87.5, 100"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <span className="absolute font-label-sm text-label-sm font-bold text-primary">88%</span>
          </div>
          <div className="flex flex-col pr-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Keterisian Unit</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">14 / 16 Bed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
