import type { ReactNode } from 'react'
import { Sidebar } from '../organisms/Sidebar'

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
