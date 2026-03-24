import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-5 transition duration-300 hover:scale-[1.015] hover:border-white/15 hover:shadow-[0_22px_70px_rgba(2,8,23,0.75)]',
        className,
      )}
      {...props}
    />
  )
}

