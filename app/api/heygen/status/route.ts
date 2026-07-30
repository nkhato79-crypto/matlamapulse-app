import { NextRequest, NextResponse } from 'next/server'

const HEYGEN_STATUS_URL = 'https://api.heygen.com/v1/video_status.get'

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

  const videoId = req.nextUrl.searchParams.get('video_id')
  if (!videoId) {
    return NextResponse.json({ error: 'video_id query parameter is required' }, { status: 400 })
  }

  const response = await fetch(`${HEYGEN_STATUS_URL}?video_id=${encodeURIComponent(videoId)}`, {
    headers: { 'X-Api-Key': heygenKey },
  })

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: 'HeyGen API error', details: data },
      { status: response.status }
    )
  }

  const videoData = data.data
  return NextResponse.json({
    video_id: videoId,
    status: videoData?.status,
    video_url: videoData?.video_url ?? null,
    thumbnail_url: videoData?.thumbnail_url ?? null,
    duration: videoData?.duration ?? null,
  })
}
