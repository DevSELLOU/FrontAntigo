import { describe, expect, it } from 'vitest'
import { parseVideoUrl } from './parse-video-url.util'

describe('parseVideoUrl', () => {
  it('returns null for empty input', () => {
    expect(parseVideoUrl(undefined)).toBeNull()
    expect(parseVideoUrl(null)).toBeNull()
    expect(parseVideoUrl('   ')).toBeNull()
  })

  describe('YouTube', () => {
    it('reads every share shape the site hands out', () => {
      const expected = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'

      expect(parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')?.embedUrl).toBe(expected)
      expect(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ')?.embedUrl).toBe(expected)
      expect(parseVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')?.embedUrl).toBe(expected)
      expect(parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')?.embedUrl).toBe(expected)
      expect(parseVideoUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ')?.embedUrl).toBe(expected)
    })

    it('keeps the id and drops the rest of the query', () => {
      const parsed = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=PLabc')

      expect(parsed).toEqual({
        provider: 'youtube',
        id: 'dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
      })
    })

    it('rejects an id that is not exactly 11 safe characters', () => {
      expect(parseVideoUrl('https://www.youtube.com/watch?v=short')).toBeNull()
      expect(parseVideoUrl('https://www.youtube.com/watch?v=abcdefghijk"onload="x')).toBeNull()
    })
  })

  describe('Vimeo', () => {
    it('reads both the page and the player link', () => {
      expect(parseVideoUrl('https://vimeo.com/123456789')?.embedUrl).toBe('https://player.vimeo.com/video/123456789')
      expect(parseVideoUrl('https://player.vimeo.com/video/123456789')?.embedUrl).toBe(
        'https://player.vimeo.com/video/123456789'
      )
    })

    it('rejects a non-numeric id', () => {
      expect(parseVideoUrl('https://vimeo.com/channels/staffpicks')).toBeNull()
    })
  })

  describe('Google Drive', () => {
    it('turns a share link into the preview embed', () => {
      expect(parseVideoUrl('https://drive.google.com/file/d/1A2b3C4d5E6f7G8h/view?usp=sharing')?.embedUrl).toBe(
        'https://drive.google.com/file/d/1A2b3C4d5E6f7G8h/preview'
      )
    })

    it('also accepts the open?id= shape', () => {
      expect(parseVideoUrl('https://drive.google.com/open?id=1A2b3C4d5E6f7G8h')?.provider).toBe('drive')
    })
  })

  describe('refuses anything it does not recognise', () => {
    it('rejects other hosts', () => {
      expect(parseVideoUrl('https://example.com/video.mp4')).toBeNull()
      expect(parseVideoUrl('https://tiktok.com/@user/video/123')).toBeNull()
    })

    it('rejects lookalike hosts that merely contain a known one', () => {
      expect(parseVideoUrl('https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ')).toBeNull()
      expect(parseVideoUrl('https://notyoutube.com/watch?v=dQw4w9WgXcQ')).toBeNull()
      expect(parseVideoUrl('https://drive.google.com.evil.test/file/d/1A2b3C4d5E6f/view')).toBeNull()
    })

    it('rejects non-http schemes', () => {
      expect(parseVideoUrl('javascript:alert(1)')).toBeNull()
      expect(parseVideoUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
    })

    it('rejects text that is not a URL at all', () => {
      expect(parseVideoUrl('dQw4w9WgXcQ')).toBeNull()
      expect(parseVideoUrl('veja o vídeo no youtube')).toBeNull()
    })
  })
})
