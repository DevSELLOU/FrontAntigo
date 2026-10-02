import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 // 24 hours
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accessToken, user } = body

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Missing accessToken or user' }, { status: 400 })
    }

    const cookieStore = cookies()

    // Store accessToken in httpOnly cookie
    cookieStore.set('shopAccessToken', accessToken, COOKIE_OPTIONS)

    // Store user data in a non-sensitive cookie (user info is not secret, just convenience)
    cookieStore.set('shopUser', JSON.stringify(user), {
      ...COOKIE_OPTIONS,
      httpOnly: false // User info can be read by client for display purposes
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to set session' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const cookieStore = cookies()
    cookieStore.delete('shopAccessToken')
    cookieStore.delete('shopUser')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 })
  }
}
