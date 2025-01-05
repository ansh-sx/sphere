import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sphere',
  description: 'A real-time chat application',
  other: {
    monetag: '9dd22988c9ea6a2e288249357e753eb9'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
            <script>(function(d,z,s){s.src='https://'+d+'/400/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('vemtoutcheeg.com',8747863,document.createElement('script'))</script>
        <meta name="monetag" content="9dd22988c9ea6a2e288249357e753eb9" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

