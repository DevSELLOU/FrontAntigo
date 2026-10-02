export const formatPercentageValue =
  (onChange: (...event: any[]) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (value === '') {
      onChange('')
      return
    }

    if (!/^\d*[.,]?\d{0,2}$/.test(value)) {
      return
    }

    onChange(value)
  }
