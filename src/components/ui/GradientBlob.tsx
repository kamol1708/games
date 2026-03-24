import { cn } from '../../lib/utils'

type GradientBlobProps = {
  className?: string
  color?: 'violet' | 'blue' | 'mixed'
}

const colorMap = {
  violet: 'from-violet-500/40 to-fuchsia-500/10',
  blue: 'from-blue-500/35 to-cyan-400/10',
  mixed: 'from-violet-500/35 via-indigo-500/25 to-blue-500/20',
}

export function GradientBlob({ className, color = 'mixed' }: GradientBlobProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute rounded-full bg-gradient-to-br blur-3xl',
        colorMap[color],
        className,
      )}
    />
  )
}

