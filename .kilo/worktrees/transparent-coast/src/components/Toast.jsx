export default function Toast() {
  const hide = () => {
    const toast = document.getElementById('action-toast')
    if (toast) {
      toast.classList.remove('opacity-100')
      toast.classList.add('opacity-0', 'pointer-events-none')
    }
  }

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-sm w-[90%] bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-lg flex items-center justify-between gap-3 opacity-0 pointer-events-none transition-all duration-300 z-50"
      id="action-toast"
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-tertiary-fixed text-[20px]" id="toast-icon">check_circle</span>
        <span className="font-body-sm text-body-sm font-medium" id="toast-text">Sensus harian berhasil diunduh.</span>
      </div>
      <button className="text-inverse-on-surface hover:text-white" onClick={hide} type="button">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  )
}
