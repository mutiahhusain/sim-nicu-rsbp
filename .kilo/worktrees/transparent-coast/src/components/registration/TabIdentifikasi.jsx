import { useMaster } from '../../context/Master'

export default function TabIdentifikasi({ form, errors, onChange }) {
  const inputBase = 'w-full pl-3 pr-9 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all'
  const inputError = 'border border-error'

  return (
    <div className="space-y-4">
<div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-4">
         <h2 className="font-headline-sm text-headline-sm text-on-surface">Identifikasi Pasien</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="room-origin">Asal Ruangan</label>
            {(() => {
              const { masterLists } = useMaster()
              const list = masterLists.roomOrigins
return (
                 <div className="relative">
                  <select
                    className={`${inputBase} ${errors.roomOrigin ? inputError : ''}`}
                    id="room-origin"
                    name="roomOrigin"
                    value={form.roomOrigin || ''}
                    onChange={onChange('roomOrigin')}
                  >
                    <option value="">Pilih asal ruangan</option>
                    {list.map((option) => (
                      <option key={option.id} value={option.name}>{option.name}</option>
                    ))}
                  </select>
                </div>
               )
            })()}
            {errors.roomOrigin && <p className="font-label-sm text-label-sm text-error">{errors.roomOrigin}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="referral">Rujukan</label>
            {(() => {
              const { masterLists } = useMaster()
              const list = masterLists.referrals
return (
                 <div className="relative">
                  <select
                    className={`${inputBase} ${errors.referral ? inputError : ''}`}
                    id="referral"
                    name="referral"
                    value={form.referral || ''}
                    onChange={onChange('referral')}
                  >
                    <option value="">Pilih rujukan</option>
                    {list.map((option) => (
                      <option key={option.id} value={option.name}>{option.name}</option>
                    ))}
                  </select>
                </div>
               )
            })()}
            {errors.referral && <p className="font-label-sm text-label-sm text-error">{errors.referral}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="born-at">Lahir Di</label>
            {(() => {
              const { masterLists } = useMaster()
              const list = masterLists.bornAt
return (
                 <div className="relative">
                  <select
                    className={`${inputBase} ${errors.bornAt ? inputError : ''}`}
                    id="born-at"
                    name="bornAt"
                    value={form.bornAt || ''}
                    onChange={onChange('bornAt')}
                  >
                    <option value="">Pilih tempat lahir</option>
                    {list.map((option) => (
                      <option key={option.id} value={option.name}>{option.name}</option>
                    ))}
                  </select>
                </div>
               )
            })()}
            {errors.bornAt && <p className="font-label-sm text-label-sm text-error">{errors.bornAt}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="birth-process">Persalinan</label>
            {(() => {
              const { masterLists } = useMaster()
              const list = masterLists.birthProcess
return (
                 <div className="relative">
                  <select
                    className={`${inputBase} ${errors.birthProcess ? inputError : ''}`}
                    id="birth-process"
                    name="birthProcess"
                    value={form.birthProcess || ''}
                    onChange={onChange('birthProcess')}
                  >
                    <option value="">Pilih proses persalinan</option>
                    {list.map((option) => (
                      <option key={option.id} value={option.name}>{option.name}</option>
                    ))}
                  </select>
                </div>
               )
            })()}
            {errors.birthProcess && <p className="font-label-sm text-label-sm text-error">{errors.birthProcess}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="service-status">Status Pelayanan</label>
          {(() => {
            const { masterLists } = useMaster()
            const list = masterLists.serviceStatus
return (
                 <div className="relative">
                  <select
                    className={`${inputBase} ${errors.serviceStatus ? inputError : ''}`}
                    id="service-status"
                    name="serviceStatus"
                    value={form.serviceStatus || ''}
                    onChange={onChange('serviceStatus')}
                  >
                    <option value="">Pilih status pelayanan</option>
                    {list.map((option) => (
                      <option key={option.id} value={option.name}>{option.name}</option>
                    ))}
                  </select>
                </div>
               )
          })()}
          {errors.serviceStatus && <p className="font-label-sm text-label-sm text-error">{errors.serviceStatus}</p>}
        </div>
      </div>

<div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-4">
         <h2 className="font-headline-sm text-headline-sm text-on-surface">Data Antropometri & Kelahiran</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="birth-date">Tanggal Lahir</label>
            <div className="relative flex items-center">
              <input
                className={`${inputBase} ${errors.birthDate ? inputError : ''}`}
                id="birth-date"
                name="birthDate"
                required
                type="date"
                value={form.birthDate}
                onChange={onChange('birthDate')}
              />
            </div>
            {errors.birthDate && <p className="font-label-sm text-label-sm text-error">{errors.birthDate}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="birth-time">Jam Kelahiran (WIB)</label>
            <div className="relative flex items-center">
              <input
                className={`${inputBase} ${errors.birthTime ? inputError : ''}`}
                id="birth-time"
                name="birthTime"
                required
                type="time"
                value={form.birthTime}
                onChange={onChange('birthTime')}
              />
            </div>
            {errors.birthTime && <p className="font-label-sm text-label-sm text-error">{errors.birthTime}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="gestational-age">Usia Gestasional</label>
            <div className="relative flex items-center">
              <input
                className={`w-full pl-3 pr-24 py-2.5 bg-surface-container-low rounded-lg font-vital-metric-md text-vital-metric-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all ${errors.gestationalAge ? inputError : ''}`}
                id="gestational-age"
                max="43"
                min="22"
                name="gestationalAge"
                required
                step="1"
                type="number"
                value={form.gestationalAge}
                onChange={onChange('gestationalAge')}
              />
              <span className="absolute right-3 font-label-md text-label-md text-on-surface-variant">Minggu</span>
            </div>
            {form.gestationalAge && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${parseInt(form.gestationalAge, 10) < 37 ? 'bg-error-container text-on-error-container' : parseInt(form.gestationalAge, 10) >= 37 && parseInt(form.gestationalAge, 10) <= 42 ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                {parseInt(form.gestationalAge, 10) < 37 ? 'Preterm (Prematur)' : parseInt(form.gestationalAge, 10) >= 37 && parseInt(form.gestationalAge, 10) <= 42 ? 'Aterm (Cukup Bulan)' : 'Postmatur (Lebih Bulan)'}
              </span>
            )}
            {errors.gestationalAge && <p className="font-label-sm text-label-sm text-error">{errors.gestationalAge}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="birth-weight">Berat Badan Lahir</label>
            <div className="relative flex items-center">
              <input
                className={`w-full pl-3 pr-24 py-2.5 bg-surface-container-low rounded-lg font-vital-metric-md text-vital-metric-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all ${errors.birthWeight ? inputError : ''}`}
                id="birth-weight"
                max="5000"
                min="400"
                name="birthWeight"
                required
                step="10"
                type="number"
                value={form.birthWeight}
                onChange={onChange('birthWeight')}
              />
              <span className="absolute right-3 font-label-md text-label-md text-on-surface-variant">Gram</span>
            </div>
            {form.birthWeight && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${parseInt(form.birthWeight, 10) < 1000 ? 'bg-error-container text-on-error-container' : parseInt(form.birthWeight, 10) < 1500 ? 'bg-warning-container text-on-warning-container' : parseInt(form.birthWeight, 10) < 2500 ? 'bg-error-container text-on-error-container' : parseInt(form.birthWeight, 10) <= 4000 ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                {parseInt(form.birthWeight, 10) < 1000 ? 'BBLASR (Amat Sangat Rendah)' : parseInt(form.birthWeight, 10) < 1500 ? 'BBLSR (Sangat Rendah)' : parseInt(form.birthWeight, 10) < 2500 ? 'BBLR (Rendah)' : parseInt(form.birthWeight, 10) <= 4000 ? 'Normal' : 'Makrosomia (Bayi Besar)'}
              </span>
            )}
            {errors.birthWeight && <p className="font-label-sm text-label-sm text-error">{errors.birthWeight}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium">Bayi Kembar</label>
          {(() => {
            const { masterLists } = useMaster()
            const twins = masterLists.twins
            return (
              <div className="relative">
                <select
                   className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all"
                  name="twins"
                  value={form.twins || ''}
                  onChange={onChange('twins')}
                >
                  <option value="">Pilih status bayi kembar</option>
                  {twins.map((option) => (
                    <option key={option.id} value={option.name}>{option.name}</option>
                  ))}
                </select>
              </div>
            )
          })()}
        </div>

        <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
            </div>
            <div className="truncate">
              <p className="font-label-sm text-label-sm text-on-surface font-semibold">Taraf Risiko Neonatal</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Butuh pengawasan inkubator intensif & monitoring SpO2 kontinu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
