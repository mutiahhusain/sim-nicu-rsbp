export default function BedsideVignette() {
  return (
    <div className="relative overflow-hidden rounded-xl shadow-sm bg-surface-container-low p-3 flex items-center gap-3">
      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
        <img
          className="w-full h-full object-cover"
          data-alt="A warm, sterile modern NICU environment with a medical incubator softly glowing under ambient hospital lighting, monitored by professional nursing staff wearing clinical scrubs in deep teal and cyan tones, gentle medical care aesthetic"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsMhe3ggiDkH1VyuDbmT31ES8zY8aTl4S94MmTjdBaKZRY7BaRXmPUhKNPix0DeQEn-36z7cFGM7XYocqQsiFOTHbl-86Gr87lSsC-4luRdqvP8KO57hDP8m6F4BkoG-5rjp9uHQQ2uqZtIeXbgOdr_Pwd8XADoOUz-FyTRzVfOzQ507DZOepgQNnwxhahPOpIKHXqPj_HBMxTw4lk5kozOgvYS_qSsvqwST9yA6e73dAo5uPRJHQX"
        />
      </div>
      <div className="flex flex-col justify-center min-w-0 pr-1">
        <span className="font-label-sm text-label-sm text-tertiary font-semibold flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">favorite</span>
          Protokol Kangaroo Mother Care
        </span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">Sesi Kontak Kulit Hari Ini</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">
          2 pasang orang tua telah dijadwalkan sesi KMC pukul 15:30. Evaluasi toleransi termoregulasi bayi sebelum pelaksanaan.
        </p>
      </div>
    </div>
  )
}
