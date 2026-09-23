import { createContext, useContext, useEffect, useState } from 'react'
import { defaultDiagnoses, defaultTreatments, defaultMasterLists } from '../api/defaults'
import { fetchDiagnoses as fetchDxFromSupabase, fetchTreatments as fetchTxFromSupabase } from '../api/master'

const MasterContext = createContext()

const STORAGE_KEY = 'nicu-master-data'

function loadMasterData() {
  if (typeof window === 'undefined') return { diagnoses: defaultDiagnoses, treatments: defaultTreatments, ...defaultMasterLists }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        diagnoses: parsed.diagnoses || defaultDiagnoses,
        treatments: parsed.treatments || defaultTreatments,
        ...Object.keys(defaultMasterLists).reduce((acc, key) => {
          acc[key] = parsed[key] || defaultMasterLists[key]
          return acc
        }, {}),
      }
    }
  } catch {}
  return { diagnoses: defaultDiagnoses, treatments: defaultTreatments, ...defaultMasterLists }
}

export function MasterProvider({ children }) {
  const [data, setData] = useState(loadMasterData)
  const [loading, setLoading] = useState(true)
  const [isRemoteData, setIsRemoteData] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    let cancelled = false

    async function loadRemote() {
      try {
        const remoteDx = await fetchDxFromSupabase()
        const remoteTx = await fetchTxFromSupabase()

        if (!cancelled && Array.isArray(remoteDx) && Array.isArray(remoteTx)) {
          setData((prev) => ({
            ...prev,
            diagnoses: remoteDx.length ? remoteDx : (prev.diagnoses.length ? prev.diagnoses : defaultDiagnoses),
            treatments: remoteTx.length ? remoteTx : (prev.treatments.length ? prev.treatments : defaultTreatments),
          }))
          if (remoteDx.length && remoteTx.length) {
            setIsRemoteData(true)
          }
        }
      } catch (err) {
        console.warn('Master data fetch failed, using local defaults:', err?.message || err)
        if (!cancelled) {
          setData((prev) => ({
            ...prev,
            diagnoses: prev.diagnoses.length ? prev.diagnoses : defaultDiagnoses,
            treatments: prev.treatments.length ? prev.treatments : defaultTreatments,
          }))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadRemote()
    return () => { cancelled = true }
  }, [])

  const addDiagnosis = (item) => {
    setData((prev) => ({
      ...prev,
      diagnoses: [...prev.diagnoses, { ...item, id: `dx-${Date.now()}` }],
    }))
  }

  const updateDiagnosis = (id, updates) => {
    setData((prev) => ({
      ...prev,
      diagnoses: prev.diagnoses.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }))
  }

  const deleteDiagnosis = (id) => {
    setData((prev) => ({
      ...prev,
      diagnoses: prev.diagnoses.filter((item) => item.id !== id),
    }))
  }

  const addTreatment = (item) => {
    setData((prev) => ({
      ...prev,
      treatments: [...prev.treatments, { ...item, id: `tx-${Date.now()}` }],
    }))
  }

  const updateTreatment = (id, updates) => {
    setData((prev) => ({
      ...prev,
      treatments: prev.treatments.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }))
  }

  const deleteTreatment = (id) => {
    setData((prev) => ({
      ...prev,
      treatments: prev.treatments.filter((item) => item.id !== id),
    }))
  }

  const addItem = (listKey, item) => {
    setData((prev) => ({
      ...prev,
      [listKey]: [...(prev[listKey] || []), { ...item, id: `${listKey.slice(0, 3)}-${Date.now()}` }],
    }))
  }

  const updateItem = (listKey, id, updates) => {
    setData((prev) => ({
      ...prev,
      [listKey]: (prev[listKey] || []).map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }))
  }

  const deleteItem = (listKey, id) => {
    setData((prev) => ({
      ...prev,
      [listKey]: (prev[listKey] || []).filter((item) => item.id !== id),
    }))
  }

  const value = {
    diagnoses: data.diagnoses,
    treatments: data.treatments,
    addDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
    addTreatment,
    updateTreatment,
    deleteTreatment,
    masterLists: {
      genders: data.genders || [],
      twins: data.twins || [],
      roomOrigins: data.roomOrigins || [],
      birthProcess: data.birthProcess || [],
      referrals: data.referrals || [],
      bornAt: data.bornAt || [],
      followUp: data.followUp || [],
      serviceStatus: data.serviceStatus || [],
      resuscitation: data.resuscitation || [],
      breathingAid: data.breathingAid || [],
      allergies: data.allergies || [],
      congenitalAbnormalities: data.congenitalAbnormalities || [],
      pregnancyAge: data.pregnancyAge || [],
      departureTime: data.departureTime || [],
      phlebitis: data.phlebitis || [],
      macrosomia: data.macrosomia || [],
      lbBmk: data.lbBmk || [],
    },
     addItem,
    updateItem,
    deleteItem,
    loading,
    isRemoteData,
  }

  return <MasterContext.Provider value={value}>{children}</MasterContext.Provider>
}

export function useMaster() {
  const context = useContext(MasterContext)
  if (!context) {
    throw new Error('useMaster must be used within a MasterProvider')
  }
  return context
}
