import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'

type GlowBorderProps = PropsWithChildren<{
  className?: string
  innerClassName?: string
}>

export function GlowBorder({ className, innerClassName, children }: GlowBorderProps) {
  return (
    <div className={cn('rounded-2xl bg-gradient-to-br from-violet-500/35 via-white/10 to-blue-500/25 p-[1px]', className)}>
      <div className={cn('rounded-2xl bg-[#0a0d14]/90', innerClassName)}>{children}</div>
    </div>
  )
}

