export const defaultDiagnoses = [
  { id: 'dx-1', name: 'Respiratory Distress Syndrome (RDS)', category: 'Pernapasan' },
  { id: 'dx-2', name: 'Berat Bayi Lahir Rendah (BBLR/BBLSR)', category: 'Nutrisi' },
  { id: 'dx-3', name: 'Asfiksia Neonatorum Sedang-Berat', category: 'Pernapasan' },
  { id: 'dx-4', name: 'Hiperbilirubinemia / Fototerapi Intensif', category: 'Hematologi' },
  { id: 'dx-5', name: 'Sepsis Neonatorum Awaitan Dini', category: 'Infeksi' },
]

export const defaultTreatments = [
  { id: 'tx-1', name: 'Bubble CPAP', category: 'Pernapasan' },
  { id: 'tx-2', name: 'Ventilator PC-SIMV', category: 'Pernapasan' },
  { id: 'tx-3', name: 'HFNC (High Flow Nasal Cannula)', category: 'Pernapasan' },
  { id: 'tx-4', name: 'Fototerapi Intensif', category: 'Hematologi' },
  { id: 'tx-5', name: 'UVC (Umbilical Venous Catheter)', category: 'Vaskular' },
  { id: 'tx-6', name: 'TPN / Nutrisi Enteral', category: 'Nutrisi' },
  { id: 'tx-7', name: 'Antibiotik IV (Ampicillin + Gentamisin)', category: 'Infeksi' },
  { id: 'tx-8', name: 'Surfactant Replacement', category: 'Pernapasan' },
]

export const defaultMasterLists = {
  genders: [
    { id: 'gender-1', name: 'Laki-laki (L)', value: 'L' },
    { id: 'gender-2', name: 'Perempuan (P)', value: 'P' },
    { id: 'gender-3', name: 'Ganda', value: 'G' },
    { id: 'gender-4', name: 'Tidak ada jenis kelamin', value: 'N' },
  ],
  twins: [{ id: 'twin-1', name: 'Singleton' }, { id: 'twin-2', name: 'Kembar' }],
  roomOrigins: [{ id: 'origin-1', name: 'RS Ibu & Anak' }, { id: 'origin-2', name: 'RS Lain' }],
  birthProcess: [
    { id: 'bp-1', name: 'Persalihan Normal' },
    { id: 'bp-2', name: 'Pembedahan Cesar' },
    { id: 'bp-3', name: 'Forceps' },
    { id: 'bp-4', name: 'Ventouse' },
  ],
  referrals: [
    { id: 'ref-1', name: 'RS Ibu & Anak' },
    { id: 'ref-2', name: 'RS Jiwa' },
    { id: 'ref-3', name: 'RS Umum' },
    { id: 'ref-4', name: 'Puskesmas' },
  ],
  bornAt: [
    { id: 'born-1', name: 'RS Ibu & Anak' },
    { id: 'born-2', name: 'RS Lain' },
    { id: 'born-3', name: 'Di Rumah' },
    { id: 'born-4', name: 'Di Jalan' },
  ],
  followUp: [
    { id: 'fu-1', name: 'Konseling Keluarga' },
    { id: 'fu-2', name: 'Terapi Fisik' },
    { id: 'fu-3', name: 'Monitoring rutin' },
  ],
  serviceStatus: [
    { id: 'ss-1', name: 'Mandiri', group: 'BPJS' },
    { id: 'ss-2', name: 'BPJS', group: 'BPJS' },
    { id: 'ss-3', name: 'APBN', group: 'BPJS' },
    { id: 'ss-4', name: 'APBD', group: 'BPJS' },
    { id: 'ss-5', name: 'Pegawai BUMN', group: 'BPJS' },
    { id: 'ss-6', name: 'Pegawai Swasta', group: 'BPJS' },
    { id: 'ss-7', name: 'PNS', group: 'ASKES' },
    { id: 'ss-8', name: 'POLRI', group: 'ASKES' },
    { id: 'ss-9', name: 'TNI', group: 'ASKES' },
    { id: 'ss-10', name: 'P3K', group: 'UMUM' },
    { id: 'ss-11', name: 'Bayar Tunai', group: 'UMUM' },
    { id: 'ss-12', name: 'Perangkat Desa', group: 'UMUM' },
    { id: 'ss-13', name: 'Kepala Desa', group: 'BPJS' },
  ],
  resuscitation: [
    { id: 'rs-1', name: 'Alprostadiil' },
    { id: 'rs-2', name: 'Epinefrin' },
    { id: 'rs-3', name: 'Atropin' },
    { id: 'rs-4', name: 'Lokomalasi' },
  ],
  breathingAid: [
    { id: 'ba-1', name: 'CPAP' },
    { id: 'ba-2', name: 'HFNC' },
    { id: 'ba-3', name: 'Ventilator' },
    { id: 'ba-4', name: 'Oksigen Nasal Cannula' },
  ],
  allergies: [
    { id: 'al-1', name: 'Cairan IV' },
    { id: 'al-2', name: 'Antibiotik' },
    { id: 'al-3', name: 'Latex' },
    { id: 'al-4', name: 'Krim topikal' },
  ],
  congenitalAbnormalities: [
    { id: 'ca-1', name: 'Hidrokel' },
    { id: 'ca-2', name: 'Talasemia' },
    { id: 'ca-3', name: 'Hipospadias' },
    { id: 'ca-4', name: 'Kranium abnormal' },
  ],
  pregnancyAge: [
    { id: 'pa-1', name: '< 28 minggu' },
    { id: 'pa-2', name: '28-32 minggu' },
    { id: 'pa-3', name: '33-37 minggu' },
    { id: 'pa-4', name: '> 37 minggu' },
  ],
  departureTime: [
    { id: 'dt-1', name: '< 24 jam' },
    { id: 'dt-2', name: '24-48 jam' },
    { id: 'dt-3', name: '> 48 jam' },
  ],
  phlebitis: [
    { id: 'ph-1', name: 'Ya' },
    { id: 'ph-2', name: 'Tidak' },
  ],
  macrosomia: [
    { id: 'mc-1', name: 'Ya' },
    { id: 'mc-2', name: 'Tidak' },
  ],
  lbBmk: [
    { id: 'lb-1', name: 'LB' },
    { id: 'lb-2', name: 'BMK' },
    { id: 'lb-3', name: 'Normal' },
  ],
}
