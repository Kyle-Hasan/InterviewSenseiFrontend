import VideoRecord from '@/components/VideoRecord'
import React from 'react'

export default function InterviewRecord() {
  return (
    <div className='flex items-center justify-center h-screen flex-col'>
    
        <h2 className='text-2xl font-bold text-center mb-5 w-screen'>Record Interview</h2>
        <VideoRecord />
      
    </div>
  )
}
