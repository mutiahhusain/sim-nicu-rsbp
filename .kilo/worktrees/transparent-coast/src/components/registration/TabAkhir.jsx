import { useMaster } from '../../context/Master'

export default function TabAkhir({ form, errors, onChange }) {
  const inputBase = 'w-full pl-3 pr-9 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all'
  const inputError = 'border border-error'

  return (
    <div className="space-y-4">
<div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-4">
         <h2 className="font-headline-sm text-headline-sm text-on-surface">Akhir Rawat</h2>

        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="follow-up">Tindak Lanjut</label>
          {(() => {
            const { masterLists } = useMaster()
            const list = masterLists.followUp
            return (
              <div className="relative">
                <select
                  className={`${inputBase} ${errors.followUp ? inputError : ''}`}
                  id="follow-up"
                  name="followUp"
                  value={form.followUp || ''}
                  onChange={onChange('followUp')}
                >
                  <option value="">Pilih tindak lanjut</option>
                  {list.map((option) => (
                    <option key={option.id} value={option.name}>{option.name}</option>
                  ))}
                </select>
              </div>
            )
          })()}
          {errors.followUp && <p className="font-label-sm text-label-sm text-error">{errors.followUp}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="discharge-date">Tanggal Keluar</label>
          <div className="relative flex items-center">
            <input
              className={`${inputBase} ${errors.dischargeDate ? inputError : ''}`}
              id="discharge-date"
              name="dischargeDate"
              type="date"
              value={form.dischargeDate || ''}
              onChange={onChange('dischargeDate')}
            />
          </div>
          {errors.dischargeDate && <p className="font-label-sm text-label-sm text-error">{errors.dischargeDate}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="discharge-sep">Nomor SEP</label>
          <div className="relative flex items-center">
            <input
              className={`${inputBase} ${errors.dischargeRm ? inputError : ''}`}
              id="discharge-sep"
              name="dischargeRm"
              placeholder="Nomor SEP pasca keluar"
              value={form.dischargeRm || ''}
              onChange={onChange('dischargeRm')}
            />
          </div>
          {errors.dischargeRm && <p className="font-label-sm text-label-sm text-error">{errors.dischargeRm}</p>}
        </div>
      </div>
    </div>
  )
}
