'use client'

import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'
import { useRef } from 'react'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export default function Page() {
  const contentRef = useRef<HTMLDivElement>(null)

  const handleDownloadImage = () => {
    alert('Download feature coming soon!')
  }

  const handleShareOnX = () => {
    const text = encodeURIComponent('Check out my 2025 Wrapped from 1UI.dev!')
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}`
    window.open(shareUrl, '_blank', 'width=550,height=420')
  }

  return (
    <div
      className={`${plusJakarta.variable} ${spaceGrotesk.variable} font-[family-name:var(--font-plus-jakarta)] w-full`}
    >
      <div className="text-white flex justify-center">
        <div ref={contentRef} className="w-full max-w-[1200px] flex flex-col gap-6">
          <header className="flex justify-between items-center py-4 sm:py-5 mb-4 sm:mb-5">
            <h1 className="text-default-foreground text-3xl leading-9 font-bold">Dashboard</h1>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto gap-4 sm:gap-6">
            <div className="md:col-span-2 bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-black rounded-[32px] p-6 sm:p-8 relative overflow-hidden flex flex-col justify-end min-h-[380px] border border-[#262626] transition-all hover:border-[#404040] hover:-translate-y-0.5">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7928ca]/10 via-transparent to-[#ccf381]/5"></div>
              <div className="relative z-10">
                <div className="text-xl sm:text-2xl text-[#ccf381] mb-2 font-medium">
                  Your Year Wrapped
                </div>
                <div className="font-[family-name:var(--font-space-grotesk)] text-7xl sm:text-8xl lg:text-[120px] font-bold leading-[0.8] tracking-tighter text-white -ml-1 sm:-ml-1.5">
                  2025
                </div>
                <div className="mt-6 bg-white/10 backdrop-blur-md border-t border-white/20 p-4 sm:p-5 rounded-2xl">
                  <p className="text-sm sm:text-base font-medium opacity-90">
                    You're in the top 1% of UI creators this year. You didn't just design; you
                    shipped.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 sm:p-8 flex flex-col justify-between min-h-[380px] border border-[#262626] transition-all hover:border-[#404040] hover:-translate-y-0.5">
              <div>
                <div className="text-xs sm:text-sm text-[#a1a1aa] uppercase tracking-wider font-semibold mb-2">
                  Total Components Used
                </div>
                <div className="font-[family-name:var(--font-space-grotesk)] text-5xl sm:text-6xl font-bold leading-none mb-0 bg-gradient-to-br from-[#7928ca] to-[#ff0080] bg-clip-text text-transparent">
                  1,492
                </div>
              </div>

              <div className="mt-8">
                <div className="text-xs sm:text-sm text-[#a1a1aa] uppercase tracking-wider font-semibold mb-2">
                  Lines of Code Copied
                </div>
                <div className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl font-bold leading-none text-white mb-3">
                  84.5k
                </div>
                <div className="inline-flex items-center gap-1 bg-[#ccf381]/10 text-[#ccf381] px-3 py-1 rounded-full text-xs font-semibold">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="w-3 h-3"
                  >
                    <path d="M18 15l-6-6-6 6"></path>
                  </svg>
                  +240% vs 2024
                </div>
              </div>
            </div>

            <div className="bg-white text-black rounded-[32px] p-6 sm:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[380px] border border-[#262626] transition-all hover:border-[#404040] hover:-translate-y-0.5">
              <div className="flex justify-between items-start mb-6">
                <span className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold">
                  Design Persona
                </span>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <circle cx="12" cy="12" r="2"></circle>
                  <circle cx="19" cy="12" r="2"></circle>
                  <circle cx="5" cy="12" r="2"></circle>
                </svg>
              </div>

              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-10 h-10 sm:w-12 sm:h-12"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                </div>
                <div className="text-sm font-semibold uppercase mb-2 opacity-60 tracking-wide">
                  You are a
                </div>
                <div className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-[36px] font-bold leading-tight tracking-tight mb-6">
                  System
                  <br />
                  Architect
                </div>
              </div>

              <div className="text-sm leading-relaxed font-medium border-t border-black/10 pt-5">
                Consistency is your currency. You love atomic design and reusable tokens.
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 sm:p-8 border border-[#262626] transition-all hover:border-[#404040] hover:-translate-y-0.5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl sm:text-2xl font-bold">
                  Top Tech Stack
                </h3>
                <span className="text-sm text-[#a1a1aa]">Based on exports</span>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#61DAFB]/10 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="#61DAFB" className="w-6 h-6">
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-white">React</span>
                      <span className="text-xs font-semibold text-white">68%</span>
                    </div>
                    <div className="h-2 bg-[#262626] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#61DAFB] rounded-full"
                        style={{ width: '68%' }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#06B6D4]/10 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="#06B6D4" className="w-6 h-6">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-white">Tailwind CSS</span>
                      <span className="text-xs font-semibold text-white">82%</span>
                    </div>
                    <div className="h-2 bg-[#262626] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#06B6D4] rounded-full"
                        style={{ width: '82%' }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#3178C6]/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-[#3178C6] font-mono text-sm">TS</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-white">TypeScript</span>
                      <span className="text-xs font-semibold text-white">54%</span>
                    </div>
                    <div className="h-2 bg-[#262626] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3178C6] rounded-full"
                        style={{ width: '54%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-[#FF6B35] via-[#FF8C42] to-[#F7931E] rounded-[32px] p-6 sm:p-8 overflow-hidden flex flex-col justify-between min-h-[320px] sm:min-h-[380px] border border-[#262626] transition-all hover:-translate-y-0.5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
              <div className="relative z-10">
                <div className="font-bold text-sm uppercase mb-1 text-black">Top Category</div>
                <div className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl font-bold text-black">
                  Dashboards
                </div>
              </div>

              <div className="relative z-10">
                <div className="font-semibold text-sm mb-3 text-black">Favorite Palette</div>
                <div className="flex gap-2">
                  <div className="w-12 h-12 rounded-full bg-black border-2 border-black"></div>
                  <div className="w-12 h-12 rounded-full bg-[#7928ca] border-2 border-black"></div>
                  <div className="w-12 h-12 rounded-full bg-[#ccf381] border-2 border-black"></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-[32px] p-6 sm:p-8 border border-[#262626] transition-all hover:border-[#404040] hover:-translate-y-0.5">
              <div className="text-xs sm:text-sm text-[#a1a1aa] uppercase tracking-wider font-semibold mb-2">
                Peak Productivity
              </div>
              <div className="text-2xl sm:text-[28px] font-bold text-white mb-1">
                Tuesday, 10 PM
              </div>
              <div className="text-sm text-[#a1a1aa] mb-6">You are a night owl.</div>

              <div className="grid grid-cols-7 gap-1.5">
                {[
                  1, 2, 1, 3, 2, 1, 1, 2, 3, 3, 3, 3, 2, 1, 1, 2, 3, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2,
                  1, 1, 2, 2, 3, 2, 1, 2,
                ].map((level, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded ${
                      level === 1
                        ? 'bg-[#262626]'
                        : level === 2
                          ? 'bg-[#7928ca]/40'
                          : 'bg-[#7928ca]'
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-4 bg-gradient-to-r from-[#1a1a1a] to-[#262626] rounded-[32px] p-6 sm:p-8 lg:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 min-h-[200px] sm:min-h-[240px] border border-[#404040] transition-all hover:border-[#ccf381]/40 hover:-translate-y-0.5 shadow-lg">
              <div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-white">
                  Share your 2025 Wrapped
                </h3>
                <p className="text-[#d4d4d8] text-sm sm:text-base font-medium">
                  Show the world what you've built with 1UI.dev
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <button
                  onClick={handleDownloadImage}
                  className="bg-transparent text-white border-2 border-white/40 px-6 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base transition-all hover:scale-105 hover:border-white hover:bg-white/5 whitespace-nowrap"
                >
                  Download Image
                </button>
                <button
                  onClick={handleShareOnX}
                  className="bg-[#ccf381] text-black px-6 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base transition-all hover:scale-105 hover:bg-white flex items-center justify-center gap-2 whitespace-nowrap shadow-lg"
                >
                  Share on
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
