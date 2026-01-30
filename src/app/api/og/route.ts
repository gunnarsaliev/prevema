import { NextResponse } from 'next/server'

// Override Payload's OG endpoint to prevent Workers from hanging
// This endpoint uses canvas/node APIs that aren't compatible with Cloudflare Workers
export async function GET() {
  // Return a simple 404 or you could return a static fallback image
  return new NextResponse('OG image generation is disabled in Workers runtime', {
    status: 404,
  })
}
