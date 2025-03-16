

import React, { useState } from 'react';
import Spinner from '@/components/Spinner';
import { message } from '@/app/types/message';
import DisplayMessage from './DisplayMessage';

interface LiveInterviewTranscriptProps {
  transcripts?: message[];
  loadingTranscript?: boolean;
}

export default function LiveInterviewTranscript({ 
  transcripts = [], 
  loadingTranscript = false 
}: LiveInterviewTranscriptProps) {
  return (
    <div className="flex flex-col items-center border-2 border-black p-5 xl:w-2/3 w-1/3 h-full overflow-scroll">
      <h2 className="text-xl font-bold mb-4">Transcript</h2>
      
      {loadingTranscript ? (
        <Spinner />
      ) : (
        <>
          {transcripts ? (
           <div className="w-full">
           {transcripts.map((message, index) => (
             <DisplayMessage key={index} message={message} />
           ))}
         </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <p className="text-gray-500">
                No transcript available. Start a live interview to generate a transcript.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}