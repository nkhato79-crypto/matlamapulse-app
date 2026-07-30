import { NextRequest, NextResponse } from 'next/server'

const HEYGEN_API_URL = 'https://api.heygen.com/v2/video/generate'

function authenticateRequest(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key')
  return !!apiKey && apiKey === process.env.MAKE_API_KEY
}

export async function POST(req: NextRequest) {
  if (!authenticateRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const heygenKey = process.env.HEYGEN_API_KEY
  if (!heygenKey) {
    return NextResponse.json({ error: 'HeyGen API key not configured' }, { status: 500 })
  }

  const body = await req.json()
  const {
    script,
    avatar_id = process.env.HEYGEN_DEFAULT_AVATAR_ID || 'Angela-inTshworwear-20220820',
    voice_id = process.env.HEYGEN_DEFAULT_VOICE_ID || '1bd001e7e50f421d891986aad5c8bbd2',
    width = 1920,
    height = 1080,
    test = false,
  } = body

  if (!script || typeof script !== 'string') {
    return NextResponse.json({ error: 'script is required' }, { status: 400 })
  }

  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id,
          avatar_style: 'normal',
        },
        voice: {
          type: 'text',
          input_text: script,
          voice_id,
        },
      },
    ],
    dimension: { width, height },
    test,
  }

  const response = await fetch(HEYGEN_API_URL, {
    method: 'POST',
    headers: {
      'X-Api-Key': heygenKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: 'HeyGen API error', details: data },
      { status: response.status }
    )
  }

  return NextResponse.json({
    video_id: data.data?.video_id,
    status: 'pending',
    message: 'Video generation started',
  })
}
