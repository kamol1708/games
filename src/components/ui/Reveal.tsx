import type { HTMLMotionProps } from 'framer-motion'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

type RevealProps = HTMLMotionProps<'div'> & {
  delay?: number
}

export function Reveal({ children, delay = 0, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      animate={reducedMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

