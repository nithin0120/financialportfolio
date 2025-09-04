'use client'

// Reusable back button component for navigation
// Provides consistent back navigation across all pages
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

// Props interface for the BackButton component
interface BackButtonProps {
  href?: string        // Optional specific URL to navigate to
  label?: string       // Custom label text (defaults to 'Back')
  className?: string   // Additional CSS classes for styling
}

export default function BackButton({ href, label = 'Back', className = '' }: BackButtonProps) {
  const router = useRouter()

  // Handle button click - either navigate to specific href or go back in history
  const handleClick = () => {
    if (href) {
      // Navigate to a specific page
      router.push(href)
    } else {
      // Go back to the previous page in browser history
      router.back()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center space-x-2 text-sm text-dark-600 hover:text-dark-900 transition-colors ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )
}
