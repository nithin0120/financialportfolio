'use client'

import React from 'react'
import { motion } from 'framer-motion'

// Simple chart skeleton for loading states
export function ChartSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="chart-container"
    >
      <div className="skeleton h-6 w-48 mb-4"></div>
      <div className="space-y-3">
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-5/6"></div>
        <div className="skeleton h-4 w-4/5"></div>
        <div className="skeleton h-4 w-3/4"></div>
        <div className="skeleton h-4 w-2/3"></div>
      </div>
    </motion.div>
  )
}
