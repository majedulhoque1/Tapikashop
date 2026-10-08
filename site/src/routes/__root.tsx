// Root layout: the HTML shell, head tags (noindex while this is a prototype) and global CSS. Wraps every route.
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from '../styles.css?url'
import { SiteChrome } from '../components/SiteChrome'
import { MOTION_HEAD_SCRIPT } from '../lib/motion'

function RootError({ error }: { error: unknown }) {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-2xl font-black">Something went wrong.</p>
      <p className="text-sm opacity-70">{error instanceof Error ? error.message : 'Unknown error.'}</p>
      <a href="/" className="mt-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white">
        Back to home
      </a>
    </div>
  )
}

export const Route = createRootRoute({
  errorComponent: RootError,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Tapika - Gifts from Nepal to Australia' },
      { name: 'description', content: 'Send a little love to Australia. Gifts prepared in Nepal, delivered across Australia.' },
      // Prototype: keep it out of search results until launch.
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Young+Serif&family=Kalam:wght@400;700&family=Mukta:wght@400;500;600;700;800&display=swap' },
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_HEAD_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="antialiased">
        <SiteChrome>{children}</SiteChrome>
        <Scripts />
      </body>
    </html>
  )
}
