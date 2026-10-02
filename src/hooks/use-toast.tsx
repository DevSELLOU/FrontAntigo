import { toast as toastify } from 'react-toastify'

interface ToastProps {
  title: string
  status: 'success' | 'error' | 'warning'
}

interface ToastContextData {
  toast: ({ title, status }: ToastProps) => void
}

export function useToast(): ToastContextData {
  const toast = ({ title, status }: ToastProps) => {
    toastify[status](title)
  }

  return { toast }
}
