import { useEffect } from 'react'
import { useMaster } from '../../context/Master'

const initialPlan = {
  selectedTreatments: [],
  respiratoryDetail: '',
  antibiotics: '',
  otherPlan: '',
  keteranganTindakan: '',
}

const inputBase = 'w-full pl-3 pr-9 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all'

export default function TabTindakan({ form, errors, onChange }) {
  const plan = form.plan || initialPlan
  const { treatments } = useMaster()

  const update = (field) => (e) => {
    const value = typeof e === 'object' && e?.target ? e.target.value : e
    onChange('plan')({ target: { value, name: field } })
  }

  const toggleTreatment = (txId) => {
    const current = plan.selectedTreatments || []
    const updated = current.includes(txId) ? current.filter((id) => id !== txId) : [...current, txId]
    onChange('plan')({ target: { value: updated, name: 'selectedTreatments' } })
  }

  const groupedTreatments = treatments.reduce((acc, item) => {
    const cat = item.category || 'Lainnya'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const selectedNames = (plan.selectedTreatments || [])
    .map((id) => treatments.find((t) => t.id === id)?.name)
    .filter(Boolean)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const current = plan.selectedTreatments || []
    if (current.length > 0) {
      const names = current.map((id) => treatments.find((t) => t.id === id)?.name).filter(Boolean)
      const text = names.join(', ')
      if (text !== (plan.keteranganTindakan || '')) {
        onChange('plan')({ target: { value: text, name: 'keteranganTindakan' } })
      }
    }
  }, [plan.selectedTreatments, treatments, onChange])

  return (
    <div className="space-y-4">
      {/* Pilih Tindakan Section */}
<div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-4">
         <h2 className="font-headline-sm text-headline-sm text-on-surface">Rencana Tindakan & Alat</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold flex-1">Nama Tindakan</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold truncate">Kelompok Tindakan</p>
          </div>
          <div className="flex flex-col space-y-3">
            {Object.entries(groupedTreatments).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">{category}</p>
                <div className="space-y-1">
                  {items.map((item) => {
                    const checked = (plan.selectedTreatments || []).includes(item.id)
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border ${checked ? 'bg-tertiary-fixed border-tertiary shadow-sm' : 'bg-surface-container-low border-transparent hover:bg-surface-container'}`}
                      >
                        <input
                          checked={checked}
                          className="h-4 w-4 rounded border-outline-variant text-tertiary focus:ring-tertiary"
                          type="checkbox"
                          onChange={() => toggleTreatment(item.id)}
                        />
                        <span className={`flex-1 font-body-sm text-body-sm ${checked ? 'text-tertiary font-semibold' : 'text-on-surface'}`}>{item.name}</span>
                        <span className={`font-label-sm text-label-sm ${checked ? 'text-tertiary' : 'text-on-surface-variant'}`}>{item.category || category}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          {selectedNames.length > 0 && (
            <div className="mt-2 p-3 rounded-lg bg-surface-container-low">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Terpilih:</p>
              <div className="flex flex-wrap gap-1">
                {selectedNames.map((name) => (
                  <span key={name} className="inline-flex items-center px-2 py-1 rounded-full bg-tertiary-container text-on-tertiary font-label-sm text-label-sm">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {errors.selectedTreatments && <p className="font-label-sm text-label-sm text-error">{errors.selectedTreatments}</p>}

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="keterangan-tindakan">
              Keterangan semua Tindakan yang dipilih
            </label>
            <textarea
              className={inputBase}
              id="keterangan-tindakan"
              name="keteranganTindakan"
              placeholder="Keterangan otomatis terisi berdasarkan tindakan yang dipilih..."
              rows="3"
              value={plan.keteranganTindakan || ''}
              onChange={update('keteranganTindakan')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
