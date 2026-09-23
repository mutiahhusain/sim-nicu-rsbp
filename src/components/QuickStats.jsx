import { usePatients } from '../context/PatientContext'

export default function QuickStats() {
  const { patients } = usePatients()

  const totalInTreatment = patients.filter((p) => p.status?.includes('Dirawat')).length
  const criticalVentilator = patients.filter((p) => p.status?.includes('Ventilator') || p.status?.includes('Kritis')).length
  const cpapHighFlow = patients.filter((p) => p.status?.includes('CPAP') || p.status?.includes('HFNC')).length
  const readyToDischarge = patients.filter((p) => p.status?.includes('Pulang') || p.dataStatus === 'pulang').length

  const stats = [
    {
      label: 'Total Rawat',
      value: totalInTreatment,
      unit: 'Bayi',
      icon: 'child_care',
      iconBg: 'bg-surface-container-high text-primary',
      note: `Kapasitas ${Math.round((totalInTreatment / 16) * 100)}%`,
    },
    {
      label: 'Kritis & Ventilator',
      value: criticalVentilator,
      unit: 'Bayi',
      icon: 'warning',
      iconBg: 'bg-error-container text-error',
      badge: 'High Alert Respi',
      badgeColor: 'bg-error-container text-on-error-container',
    },
    {
      label: 'CPAP / High Flow',
      value: cpapHighFlow,
      unit: 'Bayi',
      icon: 'air',
      iconBg: 'bg-secondary-fixed text-secondary',
      note: `${cpapHighFlow > 0 ? `${cpapHighFlow} pasien` : 'Stabil'}`,
    },
    {
      label: 'Rencana Pulang',
      value: readyToDischarge,
      unit: 'Bayi',
      icon: 'home_health',
      iconBg: 'bg-tertiary-fixed text-tertiary',
      badge: 'Edukasi PMK Siap',
      badgeColor: 'bg-surface-container-high text-tertiary',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-surface-container-lowest p-card-padding-sm rounded-lg shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant">{stat.label}</span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${stat.iconBg}`}>
              <span className="material-symbols-outlined text-[18px]">{stat.icon}</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="font-vital-metric-lg text-vital-metric-lg text-on-surface">
              {stat.value} <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">{stat.unit}</span>
            </div>
            {stat.note && <div className="mt-1 flex items-center text-on-surface-variant font-label-sm text-label-sm">{stat.note}</div>}
            {stat.badge && (
              <div className={`mt-1 inline-flex items-center px-1.5 py-0.5 rounded-full font-label-sm text-label-sm ${stat.badgeColor}`}>
                {stat.badge}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
