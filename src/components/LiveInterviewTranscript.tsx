

import React, { useState } from 'react';
import Spinner from '@/components/Spinner';
import { message } from '@/app/types/message';
import DisplayMessage from './DisplayMessage';

interface LiveInterviewTranscriptProps {
  transcripts?: message[];
  loadingTranscript?: boolean;
  loadingMessage:boolean;
  loadingInitial:boolean;
}

export default function LiveInterviewTranscript({ 
  transcripts = [], 
  loadingTranscript = false,
  loadingInitial,
  loadingMessage
}: LiveInterviewTranscriptProps) {

  const aiLoadingMessage:message = {
    interviewId:0,
    content:"",
    fromAI:true
  };
  const userLoadingMessage:message = {
    interviewId:0,
    content:"",
    fromAI:false
  };
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 text-center">Transcript</h2>
      
      {loadingTranscript ? (
        <Spinner />
      ) : (
        <>
          {transcripts ? (
           <div className="w-full">
           {transcripts.map((message, index) => (
             <DisplayMessage key={index} message={message} loading= {false} />
           ))}

           {
            loadingMessage && (<DisplayMessage key={-1} message={userLoadingMessage} loading={true}></DisplayMessage>)
           }
           {
            loadingInitial && (<DisplayMessage key={-2} message={aiLoadingMessage} loading={true}></DisplayMessage>)
           }

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