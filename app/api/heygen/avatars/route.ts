import { NextRequest, NextResponse } from 'next/server'

function authenticateRequest(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key')
  return !!apiKey && apiKey === process.env.MAKE_API_KEY
}

export async function GET(req: NextRequest) {
  if (!authenticateRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const heygenKey = process.env.HEYGEN_API_KEY
  if (!heygenKey) {
    return NextResponse.json({ error: 'HeyGen API key not configured' }, { status: 500 })
  }

  const type = req.nextUrl.searchParams.get('type') ?? 'avatars'

  const url =
    type === 'voices'
      ? 'https://api.heygen.com/v2/voices'
      : 'https://api.heygen.com/v2/avatars'

  const response = await fetch(url, {
    headers: { 'X-Api-Key': heygenKey },
  })

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: 'HeyGen API error', details: data },
      { status: response.status }
    )
  }

  return NextResponse.json(data.data)
}
