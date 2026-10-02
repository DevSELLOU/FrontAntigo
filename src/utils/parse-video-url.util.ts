export type VideoProvider = 'youtube' | 'vimeo' | 'drive'

export interface ParsedVideo {
  provider: VideoProvider
  /** The id extracted from the share link — never the raw user input. */
  id: string
  /** The embed address, built by us from `provider` + `id`. */
  embedUrl: string
}

/** Ids are echoed into an iframe `src`, so they are matched, never trusted as typed. */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const VIMEO_ID = /^\d+$/
const DRIVE_ID = /^[A-Za-z0-9_-]{10,}$/

function youtubeIdFrom(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '')

  if (host === 'youtu.be') return url.pathname.slice(1)

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') return url.searchParams.get('v')

    const [, section, id] = url.pathname.split('/')
    if (section === 'embed' || section === 'shorts' || section === 'v') return id ?? null
  }

  return null
}

function vimeoIdFrom(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '')

  if (host === 'vimeo.com') return url.pathname.split('/').filter(Boolean)[0] ?? null

  if (host === 'player.vimeo.com') {
    const [, section, id] = url.pathname.split('/')
    if (section === 'video') return id ?? null
  }

  return null
}

function driveIdFrom(url: URL): string | null {
  if (url.hostname.replace(/^www\./, '') !== 'drive.google.com') return null

  const [, section, id] = url.pathname.split('/')
  if (section === 'file' && id === 'd') return url.pathname.split('/')[3] ?? null

  return url.searchParams.get('id')
}

/**
 * Turns a share link the seller pasted into an embed address we construct ourselves.
 *
 * The point is that the raw string never reaches the iframe: only the host is recognised and the
 * id is pattern-matched, then the embed URL is rebuilt from scratch. A `javascript:` link, a
 * lookalike host, or an id carrying a quote all fall out as `null` rather than becoming an
 * attribute we hand to the browser.
 */
export function parseVideoUrl(value?: string | null): ParsedVideo | null {
  if (!value?.trim()) return null

  let url: URL

  try {
    url = new URL(value.trim())
  } catch {
    return null
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const youtubeId = youtubeIdFrom(url)
  if (youtubeId && YOUTUBE_ID.test(youtubeId)) {
    return {
      provider: 'youtube',
      id: youtubeId,
      // `-nocookie` so a product page does not set advertising cookies on the buyer.
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}`
    }
  }

  const vimeoId = vimeoIdFrom(url)
  if (vimeoId && VIMEO_ID.test(vimeoId)) {
    return {
      provider: 'vimeo',
      id: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`
    }
  }

  const driveId = driveIdFrom(url)
  if (driveId && DRIVE_ID.test(driveId)) {
    return {
      provider: 'drive',
      id: driveId,
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`
    }
  }

  return null
}
