'use client'

import ClientNavbar from '@/components/client/ClientNavbar'
import ClientFooter from '@/components/client/ClientFooter'
import { AuthProvider } from '@/contexts/AuthContext'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#2D2D2D' }}>
        <ClientNavbar />
        <main className="flex-grow">{children}</main>
        <ClientFooter />
      </div>
    </AuthProvider>
  )
}

