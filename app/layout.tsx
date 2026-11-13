import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: {
    default: 'CLT CommunityHub',
    template: '%s · CLT CommunityHub',
  },
  description:
    "CLT CommunityHub is a digital resource management platform for Charlotte, NC: one searchable, mapped directory of the clubs, non-profits, events, and services people need, plus reviews and requests to join.",
}

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
}

// Applies saved accessibility settings before the first paint (no flash of the wrong size/contrast).
const a11yBootScript = `try{var p=JSON.parse(localStorage.getItem('clt-a11y-prefs')||'{}'),m={largeText:'a11y-large-text',reduceMotion:'a11y-reduce-motion',highContrast:'a11y-high-contrast',underlineLinks:'a11y-underline-links',readableFont:'a11y-readable-font'};for(var k in m){if(p[k])document.documentElement.classList.add(m[k])}}catch(e){}`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: a11yBootScript }} />
        <link rel="icon" href="/ctl.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router: fonts in layout.tsx are correct */}
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
