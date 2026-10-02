'use client'

import { MapContainer, TileLayer, Circle, Popup, Tooltip } from 'react-leaflet'
import type { GeoDataItem } from '@/interfaces/dashboard/dashboard-v2.types'

const STATE_COORDS: Record<string, [number, number]> = {
  AC: [-9.0, -70.0], AL: [-9.6, -36.7], AP: [1.0, -52.0], AM: [-4.0, -63.0],
  BA: [-12.0, -42.0], CE: [-5.0, -39.0], DF: [-15.8, -47.9], ES: [-19.5, -40.5],
  GO: [-16.0, -49.0], MA: [-5.0, -45.0], MT: [-13.0, -56.0], MS: [-20.0, -54.0],
  MG: [-18.0, -44.0], PA: [-4.0, -53.0], PB: [-7.0, -36.0], PR: [-25.0, -51.0],
  PE: [-8.0, -37.0], PI: [-7.0, -42.0], RJ: [-22.0, -42.0], RN: [-6.0, -36.0],
  RS: [-30.0, -53.0], RO: [-11.0, -63.0], RR: [2.0, -61.0], SC: [-27.0, -50.0],
  SP: [-22.5, -48.5], SE: [-10.5, -37.5], TO: [-10.0, -48.0],
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function radiusFromRevenue(revenue: number): number {
  if (revenue > 10_000_000) return 28
  if (revenue > 5_000_000) return 22
  if (revenue > 1_000_000) return 17
  if (revenue > 500_000) return 13
  if (revenue > 100_000) return 10
  return 7
}

interface CoverageMapProps {
  items: GeoDataItem[]
  focusLabel?: string
}

export function CoverageMap({ items, focusLabel = 'Brasil' }: CoverageMapProps) {
  const points = items
    .filter((i) => {
      if (i.latitude && i.longitude) {
        const lat = parseFloat(i.latitude)
        const lng = parseFloat(i.longitude)
        return !isNaN(lat) && !isNaN(lng)
      }
      return !!STATE_COORDS[i.state]
    })
    .map((i) => {
      if (i.latitude && i.longitude) {
        return { ...i, coords: [parseFloat(i.latitude), parseFloat(i.longitude)] as [number, number] }
      }
      return { ...i, coords: STATE_COORDS[i.state] }
    })
    .slice(0, 1000)

  if (typeof window === 'undefined') {
    return (
      <div className='h-[550px] bg-surface-muted rounded-lg flex items-center justify-center text-text-muted text-body border border-border'>
        Carregando mapa…
      </div>
    )
  }

  return (
    <div className='h-[550px] rounded-lg overflow-hidden border border-border relative'>
      <div className='absolute top-3 left-3 z-[1000] bg-surface/90 rounded-md px-3 py-1.5 text-caption font-semibold text-text-body shadow-pop border border-border'>
        {focusLabel}
      </div>

      <div className='absolute bottom-6 right-3 z-[1000] bg-surface/90 rounded-md px-3 py-2 text-caption shadow-pop border border-border space-y-1.5'>
        <div className='flex items-center gap-2'>
          <span className='inline-block w-3 h-3 rounded-full bg-[#18b08f]' />
          <span className='text-text-muted'>Com venda</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='inline-block w-3 h-3 rounded-full bg-[#ff6b6f]' />
          <span className='text-text-muted'>Sem venda</span>
        </div>
      </div>

      <MapContainer
        center={[-14.235, -51.925]}
        zoom={4}
        className='h-full w-full'
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {points.map((item, i) => (
          <Circle
            key={`${item.city}-${item.state}-${i}`}
            center={item.coords}
            radius={radiusFromRevenue(item.revenue)}
            pathOptions={{
              color: item.hasSale ? '#18b08f' : '#ff6b6f',
              fillColor: item.hasSale ? '#18b08f' : '#ff6b6f',
              fillOpacity: 0.5,
              weight: 1.5,
            }}
          >
            <Tooltip direction='top' offset={[0, -10]} opacity={0.95}>
              <span className='text-xs font-medium'>
                {item.city}/{item.state}
              </span>
            </Tooltip>
            <Popup>
              <div className='text-caption space-y-1 min-w-[140px]'>
                <p className='font-semibold text-body'>{item.city}/{item.state}</p>
                <div className='border-t border-border my-1' />
                <p className='flex justify-between'>
                  <span className='text-text-muted'>Faturamento:</span>
                  <span className='font-medium text-text'>{formatMoney(item.revenue)}</span>
                </p>
                <p className='flex justify-between'>
                  <span className='text-text-muted'>Status:</span>
                  <span className={item.hasSale ? 'text-success-foreground font-medium' : 'text-danger-foreground font-medium'}>
                    {item.hasSale ? 'Com venda' : 'Sem venda'}
                  </span>
                </p>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  )
}
