"use client";
import React, { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";

import { Button } from "./ui/button";
import LiveInterviewVideoRecord from "./LiveInterviewVideoRecord";
import { message } from "@/app/types/message";
import LiveInterviewTranscript from "./LiveInterviewTranscript";
import axiosInstance from "@/app/utils/axiosInstance";
import { messageResponse } from "@/app/types/messageResponse";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LiveInterviewTabs from "./LiveInterviewTabs";
import { interviewFeedback } from "@/app/types/interviewFeedback";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface LiveInterviewRecordProps {
  interviewId: number;

}

export default function LiveInterviewRecord({
  interviewId,
}: LiveInterviewRecordProps) {

  
  // State variables

  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [transcripts, setTranscripts] = useState<message[]>([]);
  const [feedback, setFeedback] = useState<interviewFeedback | null>(null);

  const [unsavedVideo, setUnsavedVideo] = useState(false);

  const [loadingMessage, setLoadingMessage] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [videoLink,setVideoLink] = useState('');
  // true for video, false for text
  const [voiceMode,setVoiceMode] = useState(true);
  const [playTextToSpeech, setPlayTextToSpeech] = useState(true);
  const [activeTab,setActiveTab] = useState('transcript')
  const [loadingFeedback,setLoadingFeedback] = useState(false);

  const fetchData = async () => {
    const { data } = await axiosInstance.get<{
      feedback: interviewFeedback;
      messages: message[];
      videoLink?: string
    }>(`/Interview/getFeedbackAndMessages?interviewId=${interviewId}`);
    setTranscripts(data.messages);
    setFeedback(data.feedback);
    
    setVideoLink(data.videoLink ?? "") ;
    return data;
  };
  const { data, isLoading, error } = useQuery({
    queryKey: ["interviewFeedbackandMessages", interviewId],
    queryFn: fetchData,
  });

  if (isLoading) return <Spinner></Spinner>;
  if (error) return <div>Error: {error.message}</div>;

  const textToSpeech = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (blob: Blob | null,textMessage?:string) => {
    
    setActiveTab('transcript');

    try {
      const formData = new FormData();
      formData.append("interviewId", interviewId.toString());
      if(blob) {
      formData.append("audio", blob, "audio.wav");
      
      }

      else if(textMessage) {
        formData.append("textMessage",textMessage)
      }

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

      const messageResponse = response.data;
      const userMessage: message = {
        content: messageResponse.userMessage,
        fromAI: false,
        interviewId,
      };

      const aiMessage: message = {
        content: messageResponse.aiResponse,
        fromAI: true,
        interviewId,
      };

      setTranscripts([...transcripts, userMessage, aiMessage]);
      if(playTextToSpeech) {
      textToSpeech(aiMessage.content);
      }
      setLoadingMessage(false);
      
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessage(false);
    }
  };

  const endInterview = async (blob: Blob) => {
   
    try{
    setLoadingFeedback(true);
    // switch to feedback tab
    setActiveTab('feedback');
    
    const formData = new FormData();
    formData.append("video", blob, "video.webm");
    formData.append("interviewId", interviewId.toString());

    const response = await axiosInstance.post<interviewFeedback>(
      "/Interview/endInterview",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setFeedback(response.data);
  }

  catch(error) {
    console.error(error)
  }

  finally {
    setActiveTab('feedback');
    setLoadingFeedback(false)
  }

    //  queryClient.setQueryData(["interviewFeedback", interviewId], response.data);
  };

  const startInterview = async () => {
   
    setInterviewStarted(true);
    setLoadingInitial(true);
    setActiveTab('transcript');
  
    try {
      
      const initialMessage = await axiosInstance.get<message>(
        `/Message/initalizeInterview/${interviewId}`
      );
      if(playTextToSpeech) {
      textToSpeech(initialMessage.data.content);
      }
      setTranscripts([...transcripts, initialMessage.data]);
      
     
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingInitial(false);
     
    }
  };

  


   

  return (
    <div className="flex items-center flex-col justify-center h-screen w-full">
      <div>
      <h2 className="text-2xl font-bold text-center mb-5 w-full">
        Live Interview
      </h2>
      
      </div>

      <div className="flex justify-center items-start space-x-10 w-full h-2/3 xl:h-[80%] lg:h-[78%]">
        {/* Live Video Record Section */}
        <div className="flex flex-col items-center border-2 border-black p-5 xl:w-2/5 w-1/3 h-full mx-5">
        <div className="flex gap-5">
        <div className="flex items-center space-x-2">
          <span>Text Mode</span>
          <Switch checked={voiceMode} onCheckedChange={(checked)=> {
            setActiveTab('transcript');
            setVoiceMode(checked);
            }} id="voice-mode " className="mx-1" />
          <span>Voice Mode</span>
          </div>

          <div className="flex items-center space-x-1">
        
          <Switch id="voice-mode " className="" checked={playTextToSpeech} onCheckedChange={(checked)=> {setPlayTextToSpeech(checked)}} />
          <span>Play text to speech</span>
          </div>
          </div>

       {/* do this instead of conditional render to clean up video stuff in this component properly when switching modes  */}
        <LiveInterviewVideoRecord
          setUnsavedVideo={setUnsavedVideo}
          sendMessage={sendMessage}
          endInterview={endInterview}
          videoLink={videoLink}
          interviewEnded={interviewEnded}
          interviewedStarted={interviewStarted}
          voiceMode={voiceMode}
        ></LiveInterviewVideoRecord>
        

        <div className="flex space-x-4 mt-4">
          {!interviewStarted ? (
            <Button
              onClick={() => {
                startInterview();
              }}
              className="text-white px-4 py-2 rounded-md"
              disabled={loadingTranscript}
            >
              Start Interview
            </Button>
          ) : (
            <Button
              onClick={() => {
                setInterviewEnded(true);
              }}
              disabled={interviewEnded}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              End Interview
            </Button>
          )}
          </div>
        </div>

        {/* Transcript Section */}

        {loadingTranscript ? (
          <Spinner />
        ) : (
          <>
            <LiveInterviewTabs
              loadingInitial={loadingInitial}
              loadingMessage={loadingMessage}
              transcripts={transcripts}
              feedback={feedback}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              loadingFeedback={loadingFeedback}
              voiceMode={voiceMode}
              sendMessage={(textMessage:string)=> {sendMessage(null,textMessage)}}
            ></LiveInterviewTabs>
          </>
        )}
      </div>
    </div>
  );
}
