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

interface LiveInterviewRecordProps {
  interviewId: number;
  videoLink: string;
}

export default function LiveInterviewRecord({
  interviewId,
  videoLink,
}: LiveInterviewRecordProps) {
  // State variables

  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [transcripts, setTranscripts] = useState<message[]>([]);
  const [feedback, setFeedback] = useState<interviewFeedback | null>(null);

  const [unsavedVideo, setUnsavedVideo] = useState(false);
  const [blob, setBlob] = useState<Blob>();
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  const fetchData = async () => {
    const { data } = await axiosInstance.get<{feedback:interviewFeedback; messages:message[]}>(`/Interview/getFeedbackAndMessages?interviewId=${interviewId}`);
    setTranscripts(data.messages);
    setFeedback(data.feedback)
    return data;
  };
  const { data, isLoading, error } = useQuery({
    queryKey: ['interviewFeedbackandMessages',interviewId],
    queryFn: fetchData,
  });

  if (isLoading) return <Spinner></Spinner>;
  if (error) return <div>Error: {error.message}</div>;


  

  const convertDataToBlob = (data: any[]) => {
    return new Blob(data, { type: "video/webm" });
  };

  const textToSpeech = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (blob: Blob) => {
    if (!blob) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("audio", blob, "audio.wav");
      formData.append("interviewId", interviewId.toString());

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
      textToSpeech(aiMessage.content);
      setLoadingMessage(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessage(false);
    }
  };

  const endInterview = async (videoChunks: any[]) => {
    const recordedBlob = convertDataToBlob(videoChunks);
    setBlob(recordedBlob);
   

    const formData = new FormData();
    formData.append("video", recordedBlob, "video.webm");
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

    //  queryClient.setQueryData(["interviewFeedback", interviewId], response.data);
  };

  const startInterview = async () => {
    setLoadingInitial(true);

    try {
      const initialMessage = await axiosInstance.get<message>(
        `/Message/initalizeInterview/${interviewId}`
      );
      textToSpeech(initialMessage.data.content);
      setTranscripts([...transcripts, initialMessage.data]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingInitial(false);
    }
  };

  return (
    <div className="flex items-center flex-col justify-center h-screen w-full">
      <h2 className="text-2xl font-bold text-center mb-5 w-full">
        Live Interview
      </h2>

      <div className="flex justify-center items-start space-x-10 w-full h-2/3 xl:h-[80%] lg:h-[78%]">
        {/* Live Video Record Section */}

        <LiveInterviewVideoRecord
          setUnsavedVideo={setUnsavedVideo}
          setBlob={setBlob}
          sendMessage={sendMessage}
          endInterview={endInterview}
          startInterview={startInterview}
          videoLink=""
        ></LiveInterviewVideoRecord>

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
            ></LiveInterviewTabs>
          </>
        )}
      </div>
    </div>
  );
}
