"use client";
import React, { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";

import { Button } from "./ui/button";
import LiveInterviewVideoRecord from "./LiveInterviewVideoRecord";
import { message } from "@/app/types/message";
import LiveInterviewTranscript from "./LiveInterviewTranscript";
import axiosInstance from "@/app/utils/axiosInstance";

interface LiveInterviewRecordProps {
  interviewId:number,
  videoLink:string,
}

export default function LiveInterviewRecord({
  interviewId,
  videoLink
}: LiveInterviewRecordProps) {
  // State variables

  

  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [transcripts, setTranscripts] = useState<message[]>([
   
  ]);

  const [unsavedVideo,setUnsavedVideo] = useState(false);
  const [blob, setBlob] = useState<Blob>();


  useEffect(()=> {
    // load transcripts here
  } , []);


  



  const sendMessage = async (audioChunks:any[])=> {

  }

  const endInterview = async (videoChunks:any[])=> {

  }

  const startInterview = async ()=> {
    debugger

    const initialMessage = await axiosInstance.get(`/Message/initalizeInterview/${interviewId}`)

    setTranscripts([...transcripts,initialMessage.data])

  }
  

  return (
    <div className="flex items-center flex-col justify-center h-screen w-full">
      <h2 className="text-2xl font-bold text-center mb-5 w-full">
        Live Interview
      </h2>

      <div className="flex justify-center items-start space-x-10 w-full h-2/3 xl:h-[80%] lg:h-[78%]">
        {/* Live Video Record Section */}

        <LiveInterviewVideoRecord setUnsavedVideo={setUnsavedVideo} setBlob={setBlob} sendMessage={sendMessage} endInterview={endInterview} startInterview={startInterview} videoLink=""></LiveInterviewVideoRecord>
        

        {/* Transcript Section */}
       
          
          {loadingTranscript ? (
            <Spinner />
          ) : (
            <>
              <LiveInterviewTranscript transcripts={transcripts}/>
            </>
          )}
      
      </div>
    </div>
  );
}