'use client'

import React from 'react'
import { motion } from 'framer-motion'

// Professional loading skeleton components for different UI elements
export function MetricCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="metric-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="skeleton h-4 w-24 mb-2"></div>
          <div className="skeleton h-8 w-32 mb-1"></div>
          <div className="skeleton h-3 w-16"></div>
        </div>
        <div className="flex-shrink-0">
          <div className="skeleton h-12 w-12 rounded-lg"></div>
        </div>
      </div>
    </motion.div>
  )
}

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

export function TableSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="data-table"
    >
      <div className="px-6 py-4 border-b border-slate-200/50">
        <div className="skeleton h-6 w-48"></div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="skeleton h-4 w-32"></div>
              <div className="skeleton h-4 w-20"></div>
              <div className="skeleton h-4 w-24"></div>
              <div className="skeleton h-6 w-16 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function CardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card"
    >
      <div className="skeleton h-6 w-48 mb-4"></div>
      <div className="space-y-3">
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-3/4"></div>
        <div className="skeleton h-4 w-1/2"></div>
      </div>
    </motion.div>
  )
}

export function NavigationSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3">
          <div className="skeleton h-5 w-5 rounded"></div>
          <div className="skeleton h-4 w-20"></div>
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header skeleton */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="skeleton h-8 w-64"></div>
            <div className="flex space-x-4">
              <div className="skeleton h-8 w-8 rounded"></div>
              <div className="skeleton h-8 w-20"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section skeleton */}
        <div className="mb-8">
          <div className="skeleton h-8 w-96 mb-2"></div>
          <div className="skeleton h-4 w-64"></div>
        </div>

        {/* Metrics grid skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, index) => (
            <MetricCardSkeleton key={index} />
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        {/* Table skeleton */}
        <TableSkeleton />
      </div>
    </div>
  )
}

// Pulse animation for loading states
export function PulseLoader() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="flex items-center space-x-2"
    >
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
    </motion.div>
  )
}

// Spinner component
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClasses[size]} border-2 border-blue-200 border-t-blue-600 rounded-full`}
    />
  )
}

// Loading overlay
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-slate-600 font-medium">{message}</p>
      </div>
    </motion.div>
  )
}

// Shimmer effect for text
export function ShimmerText({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton h-4 ${className}`}></div>
  )
}

// Progress bar skeleton
export function ProgressSkeleton() {
  return (
    <div className="w-full">
      <div className="skeleton h-2 w-full rounded-full mb-2"></div>
      <div className="flex justify-between text-xs text-slate-500">
        <div className="skeleton h-3 w-16"></div>
        <div className="skeleton h-3 w-12"></div>
      </div>
    </div>
  )
}

// List skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3">
          <div className="skeleton h-10 w-10 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4"></div>
            <div className="skeleton h-3 w-1/2"></div>
          </div>
          <div className="skeleton h-6 w-16 rounded-full"></div>
        </div>
      ))}
    </div>
  )
}
