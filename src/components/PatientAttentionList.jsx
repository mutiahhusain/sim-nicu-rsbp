import { usePatients } from '../context/PatientContext'

function PatientCard({ patient }) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl p-3 border-l-4 ${patient.borderColor || 'border-primary'} shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px] text-primary">child_care</span>
          </div>
          <div className="min-w-0">
            <p className="font-label-md text-label-md text-on-surface font-semibold truncate">{patient.name}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{patient.bed}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full font-label-sm text-label-sm ${patient.statusColor || 'bg-surface-container text-on-surface-variant'}`}>
          {patient.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 bg-surface-container-low p-2 rounded-lg font-code-tabular text-code-tabular pl-2">
        <div>
          <span className="text-on-surface-variant text-[11px] block">Diagnosis</span>
          <span className={`font-semibold ${patient.diagnosisColor || 'text-on-surface'} text-label-sm`}>{patient.diagnosis}</span>
        </div>
        <div>
          <span className="text-on-surface-variant text-[11px] block">Respirasi</span>
          <span className="font-semibold text-on-surface text-label-sm">{patient.respiratory}</span>
        </div>
        <div>
          <span className="text-on-surface-variant text-[11px] block">{patient.nutrition ? 'Nutrisi TPN/ASI' : 'SpO2 / FiO2'}</span>
          <span className={`font-semibold ${patient.nutritionColor || 'text-on-surface'} text-label-sm`}>{patient.nutrition || patient.spo2}</span>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-primary">stethoscope</span>
          <span>
            DPJP: <strong className="text-on-surface font-semibold">{patient.dpjp}</strong>
          </span>
        </div>
        <button className="inline-flex items-center gap-1 text-primary hover:text-on-primary-fixed font-label-sm text-label-sm font-semibold" type="button">
          Detail Vitals
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  )
}

export default function PatientAttentionList() {
  const { patients } = usePatients()

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[20px] text-error">notification_important</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Perhatian Khusus Shift Ini</h2>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant">{patients.length} Pasien Prioritas</span>
      </div>
      {patients.map((patient) => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  )
}
