import type { Metadata } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'
import { QueryProvider } from '@/components/providers/query-provider'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  variable: '--font-serif',
  weight: '400',
  subsets: ['latin'],
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
      className={`${inter.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
