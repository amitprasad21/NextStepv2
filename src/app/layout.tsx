import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { QueryProvider } from '@/components/providers/query-provider'
import './globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const playfair = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'NextStep — College Discovery & Admission Guidance',
    template: '%s | NextStep',
  },
  description:
    'Navigate your college admission journey with structured guidance, counselling, and college visits.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
