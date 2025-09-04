// Production-safe logging utility
const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(message, error)
    } else {
      // In production, you might want to send to a logging service
      // For now, we'll just log the message without sensitive details
      console.error(message)
    }
  },
  
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(message, data)
    }
  },
  
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.info(message, data)
    }
  },
  
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.debug(message, data)
    }
  }
}
