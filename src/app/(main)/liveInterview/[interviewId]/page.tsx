
"use client";
import LiveInterviewRecord from '@/components/LiveInterviewRecord';
import { useParams } from 'next/navigation';
import React from 'react';

export default function LiveInterview() {
  const params = useParams<{ interviewId: string }>();
  const interviewId = params?.interviewId;
  
  return (
    <div>
      {interviewId && (
        <LiveInterviewRecord 
          interviewId={+interviewId}
          videoLink=''
          
        />
      )}
    </div>
  );
}