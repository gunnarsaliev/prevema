import { NextResponse } from 'next/server'

// OG image generation endpoint
// This endpoint is currently disabled
export async function GET() {
  // Return a simple 404 or you could return a static fallback image
  return new NextResponse('OG image generation is disabled', {
    status: 404,
  })
}
