import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { capitalizeFirstLetter } from './capitalize-first-letter'

export function howTimeAgo(date: Date) {
  const distanceToNow = formatDistanceToNow(date, {
    addSuffix: true,
    locale: ptBR
  })

  return capitalizeFirstLetter(distanceToNow)
}
