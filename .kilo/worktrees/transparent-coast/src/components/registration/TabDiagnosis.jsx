import { useEffect } from 'react'
import { useMaster } from '../../context/Master'

const initialDiagnosis = {
  diagnoses: [],
  keterangan: '',
}

const textareaBase =
  'w-full pl-3 pr-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all'

export default function TabDiagnosis({ form, errors, onChange }) {
  const diagnosis = form.diagnosis || initialDiagnosis
  const { diagnoses } = useMaster()

  const update = (field) => (e) => {
    const value = typeof e === 'object' && e?.target ? e.target.value : e
    onChange('diagnosis')({ target: { value, name: field } })
  }

  const toggleDiagnosis = (dxId) => {
    const current = diagnosis.diagnoses || []
    const updated = current.includes(dxId) ? current.filter((id) => id !== dxId) : [...current, dxId]
    onChange('diagnosis')({ target: { value: updated, name: 'diagnoses' } })
  }

  const groupedDiagnoses = diagnoses.reduce((acc, item) => {
    const cat = item.category || 'Lainnya'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const selected = diagnosis.diagnoses || []

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const current = diagnosis.diagnoses || []
    if (current.length > 0) {
      const names = current.map((id) => diagnoses.find((d) => d.id === id)?.name).filter(Boolean)
      const text = names.join(', ')
      if (text !== (diagnosis.keterangan || '')) {
        onChange('diagnosis')({ target: { value: text, name: 'keterangan' } })
      }
    }
  }, [diagnosis.diagnoses, diagnoses, onChange])

  return (
    <div className="space-y-4">
<div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-4">
         <h2 className="font-headline-sm text-headline-sm text-on-surface">Diagnosis Utama</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold flex-1">Nama Diagnosa</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold truncate">Kelompok Diagnosa</p>
        </div>
        <div className="flex flex-col space-y-3">
          {Object.entries(groupedDiagnoses).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">{category}</p>
              <div className="space-y-1">
                {items.map((item) => {
                  const checked = selected.includes(item.id)
                  return (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border ${checked ? 'bg-primary-container border-primary shadow-sm' : 'bg-surface-container-low border-transparent hover:bg-surface-container'}`}
                    >
                      <input
                        checked={checked}
                        className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                        type="checkbox"
                        onChange={() => toggleDiagnosis(item.id)}
                      />
                      <span className={`flex-1 font-body-sm text-body-sm ${checked ? 'text-primary font-semibold' : 'text-on-surface'}`}>{item.name}</span>
                      <span className={`font-label-sm text-label-sm ${checked ? 'text-primary' : 'text-on-surface-variant'}`}>{item.category || category}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        {!selected.length && errors.diagnoses && <p className="font-label-sm text-label-sm text-error">{errors.diagnoses}</p>}
      </div>

        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="keterangan">
            Keterangan semua diagnosis yang dipilih
          </label>
          <textarea
            className={textareaBase}
            id="keterangan"
            name="keterangan"
            placeholder="Masukkan keterangan..."
            rows="3"
            value={diagnosis.keterangan || ''}
            onChange={update('keterangan')}
          />
        </div>
      </div>
    </div>
  )
}
