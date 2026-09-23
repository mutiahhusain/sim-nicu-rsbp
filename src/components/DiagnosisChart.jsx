const diagnosisData = [
  { name: 'Respiratory Distress Syndrome (RDS)', count: 5, percent: 36, color: 'bg-primary' },
  { name: 'Berat Bayi Lahir Rendah (BBLR/BBLSR)', count: 4, percent: 29, color: 'bg-secondary' },
  { name: 'Asfiksia Neonatorum Sedang-Berat', count: 2, percent: 14, color: 'bg-error' },
  { name: 'Hiperbilirubinemia / Fototerapi Intensif', count: 2, percent: 14, color: 'bg-secondary-container' },
  { name: 'Sepsis Neonatorum Awitan Dini', count: 1, percent: 7, color: 'bg-tertiary' },
]

export default function DiagnosisChart() {
  return (
    <div className="bg-surface-container-lowest p-card-padding-md rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">pie_chart</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Distribusi Diagnosis Utama</h2>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant font-code-tabular">N = 14 Kasus</span>
      </div>
      <div className="space-y-3">
        {diagnosisData.map((item) => (
          <div key={item.name} className="space-y-1">
            <div className="flex items-center justify-between font-label-md text-label-md">
              <span className="text-on-surface font-medium flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                {item.name}
              </span>
              <span className="font-code-tabular text-code-tabular text-on-surface-variant font-semibold">
                {item.count} Bayi ({item.percent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
