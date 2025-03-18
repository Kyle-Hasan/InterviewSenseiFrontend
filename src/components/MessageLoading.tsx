import React from 'react'

interface MessageLoadingProps {
    fromAI:boolean
}

export default function MessageLoading({fromAI}:MessageLoadingProps) {
    const cssClass = `w-3 h-3 ${fromAI ? 'bg-white':'bg-black'} rounded-full animate-pulse`
  return (
    <div className="flex space-x-2 items-center justify-center">
            <div className={cssClass} style={{ animationDelay: '0s' }}></div>
            <div className={cssClass} style={{ animationDelay: '0.2s' }}></div>
            <div className={cssClass} style={{ animationDelay: '0.4s' }}></div>
          </div>
  )
}
