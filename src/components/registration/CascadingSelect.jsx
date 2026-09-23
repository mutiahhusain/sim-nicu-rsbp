import { useEffect, useState } from 'react'

const BASE_URL = 'https://cdn.jsdelivr.net/gh/izzulabadi/api-wilayah-indonesia-2026@v1.0.4/api'

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json()
}

export default function CascadingSelect({
  provinceCode,
  regencyCode,
  districtCode,
  villageCode,
  onProvinceChange,
  onRegencyChange,
  onDistrictChange,
  onVillageChange,
  errors = {}
}) {
  const [provinces, setProvinces] = useState([])
  const [regencies, setRegencies] = useState([])
  const [districts, setDistricts] = useState([])
  const [villages, setVillages] = useState([])
  const [loading, setLoading] = useState({ provinces: true, regencies: false, districts: false, villages: false })

  useEffect(() => {
    let cancelled = false
    setLoading((l) => ({ ...l, provinces: true }))
    fetchJSON(`${BASE_URL}/provinces.json`)
      .then((data) => {
        if (!cancelled) {
          setProvinces(data)
          setLoading((l) => ({ ...l, provinces: false }))
        }
      })
      .catch(() => {
        if (!cancelled) setLoading((l) => ({ ...l, provinces: false }))
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!provinceCode) {
      setRegencies([])
      setDistricts([])
      setVillages([])
      return
    }
    setLoading((l) => ({ ...l, regencies: true }))
    fetchJSON(`${BASE_URL}/regencies/${provinceCode}.json`)
      .then((data) => {
        if (!cancelled) {
          setRegencies(data)
          setLoading((l) => ({ ...l, regencies: false }))
        }
      })
      .catch(() => {
        if (!cancelled) setLoading((l) => ({ ...l, regencies: false }))
      })
    return () => { cancelled = true }
  }, [provinceCode])

  useEffect(() => {
    let cancelled = false
    if (!provinceCode || !regencyCode) {
      setDistricts([])
      setVillages([])
      return
    }
    setLoading((l) => ({ ...l, districts: true }))
    fetchJSON(`${BASE_URL}/districts/${regencyCode}.json`)
      .then((data) => {
        if (!cancelled) {
          setDistricts(data)
          setLoading((l) => ({ ...l, districts: false }))
        }
      })
      .catch(() => {
        if (!cancelled) setLoading((l) => ({ ...l, districts: false }))
      })
    return () => { cancelled = true }
  }, [provinceCode, regencyCode])

  useEffect(() => {
    let cancelled = false
    if (!provinceCode || !regencyCode || !districtCode) {
      setVillages([])
      return
    }
    setLoading((l) => ({ ...l, villages: true }))
    fetchJSON(`${BASE_URL}/villages/${districtCode}.json`)
      .then((data) => {
        if (!cancelled) {
          setVillages(data)
          setLoading((l) => ({ ...l, villages: false }))
        }
      })
      .catch(() => {
        if (!cancelled) setLoading((l) => ({ ...l, villages: false }))
      })
    return () => { cancelled = true }
  }, [provinceCode, regencyCode, districtCode])

  useEffect(() => {
    if (!provinceCode && regencyCode) onRegencyChange('')
  }, [provinceCode, regencyCode, onRegencyChange])

  useEffect(() => {
    if (!regencyCode && districtCode) onDistrictChange('')
  }, [regencyCode, districtCode, onDistrictChange])

  useEffect(() => {
    if (!districtCode && villageCode) onVillageChange('')
  }, [districtCode, villageCode, onVillageChange])

  const selectClass = 'w-full px-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(14,116,144,0.35)] transition-all appearance-none'
  const wrapperClass = 'relative flex items-center'

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="province">Provinsi</label>
        <div className={wrapperClass}>
          <select
            id="province"
            className={`${selectClass} pr-8`}
            value={provinceCode}
            onChange={(e) => {
              onProvinceChange(e.target.value)
              onRegencyChange('')
              onDistrictChange('')
              onVillageChange('')
            }}
            required
          >
            <option value="">{loading.provinces ? 'Memuat...' : 'Pilih Provinsi'}</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>{prov.name}</option>
            ))}
          </select>
          <span className="absolute right-2 text-on-surface-variant material-symbols-outlined text-[18px] pointer-events-none">expand_more</span>
        </div>
        {errors.province && <p className="font-label-sm text-label-sm text-error">{errors.province}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="regency">Kabupaten/Kota</label>
        <div className={wrapperClass}>
          <select
            id="regency"
            className={`${selectClass} pr-8`}
            value={regencyCode}
            onChange={(e) => {
              onRegencyChange(e.target.value)
              onDistrictChange('')
              onVillageChange('')
            }}
            required
            disabled={!provinceCode || loading.regencies}
          >
            <option value="">{loading.regencies ? 'Memuat...' : 'Pilih Kabupaten/Kota'}</option>
            {regencies.map((reg) => (
              <option key={reg.id} value={reg.id}>{reg.name}</option>
            ))}
          </select>
          <span className="absolute right-2 text-on-surface-variant material-symbols-outlined text-[18px] pointer-events-none">expand_more</span>
        </div>
        {errors.regency && <p className="font-label-sm text-label-sm text-error">{errors.regency}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="district">Kecamatan</label>
        <div className={wrapperClass}>
          <select
            id="district"
            className={`${selectClass} pr-8`}
            value={districtCode}
            onChange={(e) => {
              onDistrictChange(e.target.value)
              onVillageChange('')
            }}
            required
            disabled={!regencyCode || loading.districts}
          >
            <option value="">{loading.districts ? 'Memuat...' : 'Pilih Kecamatan'}</option>
            {districts.map((dist) => (
              <option key={dist.id} value={dist.id}>{dist.name}</option>
            ))}
          </select>
          <span className="absolute right-2 text-on-surface-variant material-symbols-outlined text-[18px] pointer-events-none">expand_more</span>
        </div>
        {errors.district && <p className="font-label-sm text-label-sm text-error">{errors.district}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="village">Desa/Kelurahan</label>
        <div className={wrapperClass}>
          <select
            id="village"
            className={`${selectClass} pr-8`}
            value={villageCode}
            onChange={(e) => onVillageChange(e.target.value)}
            required
            disabled={!districtCode || loading.villages}
          >
            <option value="">{loading.villages ? 'Memuat...' : 'Pilih Desa/Kelurahan'}</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          <span className="absolute right-2 text-on-surface-variant material-symbols-outlined text-[18px] pointer-events-none">expand_more</span>
        </div>
        {errors.village && <p className="font-label-sm text-label-sm text-error">{errors.village}</p>}
      </div>
    </div>
  )
}
