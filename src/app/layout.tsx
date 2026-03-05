import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import Sidebar from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'PropManage Pro | Enterprise Dashboard',
    description: 'Agentic-driven property management platform.',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <div className="flex min-h-screen bg-black">
                        <Sidebar />
                        <main className="ml-64 flex-1 px-8 py-8">
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    )
}
