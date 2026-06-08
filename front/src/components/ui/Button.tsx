import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'danger' | 'ghost'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variants: Record<Variant, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'bg-transparent hover:bg-gray-700 text-gray-300',
}

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    />
  )
}
