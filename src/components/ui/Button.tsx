import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type SharedProps = {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

type ButtonProps = SharedProps &
  (
    | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  )

const base =
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] disabled:pointer-events-none disabled:opacity-60'

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm sm:text-base',
  lg: 'h-12 px-5 text-sm sm:text-base',
}

const variants = {
  primary:
    'shine-button bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 text-white shadow-[0_10px_40px_rgba(79,70,229,.35)] hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(79,70,229,.45)]',
  secondary:
    'glass-card text-white/90 hover:bg-white/10 hover:scale-[1.01]',
  ghost: 'text-white/80 hover:text-white hover:bg-white/5',
}

export function Button(props: ButtonProps) {
  const { className, variant = 'primary', size = 'md', children } = props
  const classes = cn(base, sizes[size], variants[variant], className)

  if ('href' in props && props.href) {
    const {
      href,
      className: _className,
      variant: _variant,
      size: _size,
      children: _children,
      ...anchorRest
    } = props as SharedProps & { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <a href={href} className={classes} {...anchorRest}>
        {children}
      </a>
    )
  }

  const {
    className: _className,
    variant: _variant,
    size: _size,
    children: _children,
    ...buttonRest
  } = props as SharedProps & ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button className={classes} {...buttonRest}>
      {children}
    </button>
  )
}
