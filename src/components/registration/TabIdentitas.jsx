import { useMaster } from '../../context/Master'
import CascadingSelect from './CascadingSelect'

export default function TabIdentitas({ form, errors, onChange, onGenerateRM, rmFlash, isEditing }) {
  const inputBase = 'w-full pl-3 pr-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all'
  const inputError = 'border border-error'

  const rawBabyName = form.babyName?.startsWith('By. Ny. ') ? form.babyName.slice(8) : form.babyName
  const usePrefix = form.babyName?.startsWith('By. Ny. ')

  const handlePrefixChange = (e) => {
    const checked = e.target.checked
    if (checked) {
      onChange('babyName')({ target: { value: `By. Ny. ${rawBabyName}` } })
    } else {
      onChange('babyName')({ target: { value: rawBabyName } })
    }
  }

  const handleBabyNameChange = (e) => {
    const value = e.target.value
    if (usePrefix) {
      onChange('babyName')({ target: { value: `By. Ny. ${value}` } })
    } else {
      onChange('babyName')(e)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Data Rekam Medik Bayi</h2>
            </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Unique ID
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="medical-record-number">Nomor Rekam Medis (RM)</label>
              <button className={`font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-0.5 ${rmFlash ? 'text-tertiary' : 'text-primary hover:text-primary-container'} ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`} type="button" onClick={onGenerateRM} disabled={isEditing}>
                Auto-generate
              </button>
          </div>
          <div className="relative flex items-center">
              <input
                className={`w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-code-tabular text-code-tabular text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all ${errors.medicalRecordNumber ? inputError : ''} ${isEditing ? 'bg-surface-container/50 cursor-not-allowed' : ''}`}
                id="medical-record-number"
                name="medicalRecordNumber"
                required
                type="text"
                value={form.medicalRecordNumber}
                onChange={onChange('medicalRecordNumber')}
                readOnly={isEditing}
              />
            <span className="absolute right-2 px-2 py-1 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Sistem NICU</span>
          </div>
          {errors.medicalRecordNumber && <p className="font-label-sm text-label-sm text-error">{errors.medicalRecordNumber}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="baby-name">Nama Pasien Bayi</label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                checked={usePrefix}
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                type="checkbox"
                onChange={handlePrefixChange}
              />
              <span className="font-label-sm text-label-sm text-on-surface">By. Ny.</span>
            </label>
          </div>
          <div className="relative flex items-center">
              <input
                className={`${inputBase} ${errors.babyName ? inputError : ''}`}
              id="baby-name"
              name="babyName"
              placeholder={usePrefix ? 'Nama ibu kandung' : 'Contoh: By. Ny. Dewi Sartika'}
              required
              type="text"
              value={rawBabyName}
              onChange={handleBabyNameChange}
            />
          </div>
          {errors.babyName && <p className="font-label-sm text-label-sm text-error">{errors.babyName}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium">Jenis Kelamin</label>
          {(() => {
            const { masterLists } = useMaster()
            const genders = masterLists.genders
            return (
               <div className="relative">
                <select
                  className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all"
                  name="gender"
                  value={form.gender}
                  onChange={onChange('gender')}
                >
                  <option value="">Pilih jenis kelamin</option>
                  {genders.map((option) => (
                    <option key={option.id} value={option.value}>{option.name}</option>
                  ))}
                </select>
              </div>
            )
          })()}
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Alamat & Kontak Darurat</h2>
          </div>

          <CascadingSelect
            provinceCode={form.contact?.provinceCode || ''}
            regencyCode={form.contact?.regencyCode || ''}
            districtCode={form.contact?.districtCode || ''}
            villageCode={form.contact?.villageCode || ''}
            onProvinceChange={(value) => onChange('contact')({ target: { value, name: 'provinceCode' } })}
            onRegencyChange={(value) => onChange('contact')({ target: { value, name: 'regencyCode' } })}
            onDistrictChange={(value) => onChange('contact')({ target: { value, name: 'districtCode' } })}
            onVillageChange={(value) => onChange('contact')({ target: { value, name: 'villageCode' } })}
            errors={{
              province: errors.province,
              regency: errors.regency,
              district: errors.district,
              village: errors.village,
            }}
          />

          {/* Alamat Lengkap - disembunyikan sementara */}
          {/* <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="address">Alamat Lengkap</label>
            <div className="relative flex items-center">
              <input
                className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all"
                id="address"
                name="address"
                placeholder="Dusun / RT RW"
                required
                type="text"
                value={form.contact?.address || ''}
                onChange={(e) => onChange('contact')({ target: { value: e.target.value, name: 'address' } })}
              />
            </div>
          </div> */}

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="phone">Nomor Telepon</label>
            <div className="relative flex items-center">
              <input
                className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all"
                id="phone"
                name="phone"
                placeholder="0812-xxxx-xxxx"
                required
                type="tel"
                value={form.contact?.phone || ''}
                onChange={(e) => onChange('contact')({ target: { value: e.target.value, name: 'phone' } })}
              />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-card-padding-md shadow-sm space-y-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Kontak Darurat</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="emergencyName">Nama Kontak</label>
              <input
                className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all"
                id="emergencyName"
                name="emergencyName"
                placeholder="Nama kontak darurat"
                required
                type="text"
                value={form.contact?.emergencyName || ''}
                onChange={(e) => onChange('contact')({ target: { value: e.target.value, name: 'emergencyName' } })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="emergencyRelation">Hubungan</label>
              <input
                className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all"
                id="emergencyRelation"
                name="emergencyRelation"
                placeholder="Ayah / Ibu"
                required
                type="text"
                value={form.contact?.emergencyRelation || ''}
                onChange={(e) => onChange('contact')({ target: { value: e.target.value, name: 'emergencyRelation' } })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="emergencyPhone">Telepon Darurat</label>
              <input
                className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all"
                id="emergencyPhone"
                name="emergencyPhone"
                placeholder="0812-xxxx-xxxx"
                required
                type="tel"
                value={form.contact?.emergencyPhone || ''}
                onChange={(e) => onChange('contact')({ target: { value: e.target.value, name: 'emergencyPhone' } })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
