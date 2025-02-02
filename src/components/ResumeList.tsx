import { resume } from '@/app/types/resume'
import React, { useState } from 'react'
import ResumeDisplay from './ResumeDisplay'


interface ResumeListProps { 
    resumes: resume[],
    selectedResumeUrl:string,
    setSelectedResumeUrl:(newValue:string)=>void
  
}

export default function ResumeList({resumes,setSelectedResumeUrl,selectedResumeUrl}:ResumeListProps) {

  

  const handleCheckedChange = (url:string,checked:boolean) => {
    if(checked) {
      setSelectedResumeUrl(url)
    } else {
      setSelectedResumeUrl("")
    }
    
  }

  const heightClass =
  resumes.length >= 3 ? 'h-64' :
  resumes.length === 2 ? 'h-48' :
  resumes.length === 1 ? 'h-16' :
  'max-h-0';

  return (
   
  
<div className={`${heightClass} w-auto`}> 
 
  <div 
    className={`w-auto h-full p-4 rounded border border-black overflow-y-auto flex flex-col space-y-4`}
    style={{ 
      contentVisibility: 'auto', // CSS containment
      contain: 'strict', // Isolates layout calculations
    }}
  >
    {resumes.map((resume, index) => (
      <ResumeDisplay 
        key={index} 
        resume={resume} 
        checked={resume.url === selectedResumeUrl} 
        onCheckedChange={handleCheckedChange}
      />
    ))}
  </div>
</div>
  
  )
}
