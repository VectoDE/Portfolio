"use client"

import { Children, type ReactNode } from "react"
import { motion } from "framer-motion"

interface AnimatedListProps {
  children: ReactNode
  className?: string
  initialDelay?: number
  stagger?: number
}

const containerVariants = {
  hidden: {},
  visible: ({ initialDelay = 0, stagger = 0.08 }: { initialDelay?: number; stagger?: number }) => ({
    transition: {
      delayChildren: initialDelay,
      staggerChildren: stagger,
    },
  }),
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

export function AnimatedList({ children, className, initialDelay = 0, stagger = 0.08 }: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      custom={{ initialDelay, stagger }}
      variants={containerVariants}
    >
      {Children.toArray(children).map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
