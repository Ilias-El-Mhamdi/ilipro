import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-400">{label}</label>}
      <input
        {...props}
        className={`bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 ${className}`}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
