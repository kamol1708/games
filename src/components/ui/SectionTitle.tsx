import { cn } from '../../lib/utils'

type SectionTitleProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionTitleProps) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/50">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      {description ? (
        <p className={cn('mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base', align === 'center' && 'mx-auto')}>
          {description}
        </p>
      ) : null}
    </div>
  )
}

