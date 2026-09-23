export function showToast(message, icon = 'check_circle') {
  const toast = document.getElementById('action-toast')
  const toastText = document.getElementById('toast-text')
  const toastIcon = document.getElementById('toast-icon')
  if (!toast || !toastText || !toastIcon) return

  toastText.innerText = message
  toastIcon.innerText = icon
  toast.classList.remove('opacity-0', 'pointer-events-none')
  toast.classList.add('opacity-100')

  clearTimeout(window.toastTimeout)
  window.toastTimeout = setTimeout(() => {
    hideToast()
  }, 3500)
}

export function hideToast() {
  const toast = document.getElementById('action-toast')
  if (toast) {
    toast.classList.remove('opacity-100')
    toast.classList.add('opacity-0', 'pointer-events-none')
  }
}
