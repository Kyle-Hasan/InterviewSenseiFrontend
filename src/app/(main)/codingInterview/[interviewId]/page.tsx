'use client'

import CodingInterviewRecord from '@/components/CodingInterviewRecord'
import { useParams } from 'next/navigation';
import React from 'react'

export default function CodingInterview() {
  const params = useParams<{ interviewId: string }>();
  const interviewId = params?.interviewId;
  console.log("interview id ", interviewId)
  
  return (
    <>
      {interviewId && (
        <CodingInterviewRecord interviewId={+interviewId} />
      )}
    </>
  )
}