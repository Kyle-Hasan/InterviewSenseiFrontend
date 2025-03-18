"use client";
import React, { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";

import { Button } from "./ui/button";
import LiveInterviewVideoRecord from "./LiveInterviewVideoRecord";
import { message } from "@/app/types/message";
import LiveInterviewTranscript from "./LiveInterviewTranscript";
import axiosInstance from "@/app/utils/axiosInstance";
import { messageResponse } from "@/app/types/messageResponse";

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
  const [loadingMessage,setLoadingMessage] = useState(false);
  const [loadingInitial,setLoadingInitial] = useState(false)


  useEffect(()=> {
    // load transcripts here
  } , []);


  const textToSpeech = (text:string)=> {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);

  }


  



  const sendMessage = async (blob:Blob)=> {
    
    if(!blob) {
      return
    }

    
    try{
    const formData = new FormData();
    formData.append("audio", blob, "audio.wav");
    formData.append("interviewId",interviewId.toString());

    setLoadingMessage(true);

    const response = await axiosInstance.post<messageResponse>(
      "/Message/addMessage",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    

    const messageResponse = response.data
    const userMessage:message  ={
      content:messageResponse.userMessage,
      fromAI:false,
      interviewId
    };

    const aiMessage:message  ={
      content:messageResponse.aiResponse,
      fromAI:true,
      interviewId
    };

    setTranscripts([...transcripts,userMessage,aiMessage]);
    textToSpeech(aiMessage.content);
    setLoadingMessage(false);


  }
  catch(error) {
    console.error(error)
  }

    ;


  }

  const endInterview = async (videoChunks:any[])=> {

  }

  const startInterview = async ()=> {

    setLoadingInitial(true);
    

    const initialMessage = await axiosInstance.get<message>(`/Message/initalizeInterview/${interviewId}`);
    textToSpeech(initialMessage.data.content);
    setTranscripts([...transcripts,initialMessage.data]);
    setLoadingInitial(false);

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
              <LiveInterviewTranscript loadingInitial={loadingInitial} loadingMessage={loadingMessage} transcripts={transcripts}/>
            </>
          )}
      
      </div>
    </div>
  );
}