import type { ReactNode } from 'react'
import { Button } from '../atoms/Button'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-md p-6 shadow-xl border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <Button variant="ghost" onClick={onClose} className="!px-2 !py-1">✕</Button>
        </div>
        {children}
      </div>
    </div>
  )
}
