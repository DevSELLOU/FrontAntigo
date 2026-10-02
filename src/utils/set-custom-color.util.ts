import { getForegroundColor } from './get-foreground-color.util'

export function setCustomColor(customColor: string) {
  document.documentElement.style.setProperty('--custom-color', `#${customColor}`)
  document.documentElement.style.setProperty('--custom-text-color', getForegroundColor(`#${customColor}`))
}
