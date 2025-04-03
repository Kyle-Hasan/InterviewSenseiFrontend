import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useMicVAD, utils } from "@ricky0123/vad-react";
import { send } from "process";
import axiosInstance from "@/app/utils/axiosInstance";
import { useMediaStream } from "@/app/hooks/useMediaStream";
import { useMediaRecorder } from "@/app/hooks/useMediaRecorder";
import { useAudioAnalyzer } from "@/app/hooks/useAudioAnalyzer";
import { useVideoLink } from "@/app/hooks/useVideoLink";
interface LiveInterviewVideoRecordProps {
  sendMessage: (blob: Blob | null) => void;
  endInterview: (blob: Blob) => void;

  videoLink?: string;
  setUnsavedVideo?: (unsavedVideo: boolean) => void;
  interviewedStarted: boolean;
  interviewEnded: boolean;
  voiceMode: boolean;
  onlyAudio?: boolean;
}
export default function LiveInterviewVideoRecord({
  sendMessage,
  endInterview,
  videoLink,
  setUnsavedVideo,
  interviewedStarted,
  interviewEnded,
  voiceMode,
  onlyAudio = false
}: LiveInterviewVideoRecordProps) {
  // Use our custom hooks
  const { videoRef, hasVideo, setHasVideo, mediaStreamRef, startStream, stopStream } = 
    useMediaStream(onlyAudio);
  const { recording, startRecording, stopRecording } = useMediaRecorder();
  const { circleRef, initializeAnalyzer, getAmplitudeRMS } = useAudioAnalyzer();
  const { getVideoLink } = useVideoLink();
  
  // VAD hook from library
  const vad = useMicVAD({
    startOnLoad: false,
    redemptionFrames: 20,
    onFrameProcessed(probabilities, frame) {
      if (probabilities.isSpeech > 0.8) {
        const rms = getAmplitudeRMS();
        
        if (circleRef.current) {
          const scale = Math.min(1 + rms * 100, 1.4);
          circleRef.current.style.transform = `scale(${scale})`;
        }
      } else if (circleRef.current) {
        circleRef.current.style.transform = `scale(1)`;
      }
    },
    onSpeechEnd: async (audio) => {
      const wavBuffer = utils.encodeWAV(audio);
      const recordedBlob = new Blob([wavBuffer], { type: "audio/wav" });
      await sendMessage(recordedBlob);
    }
  });
  
  // Event handler for starting interview
  const handleInterviewStart = async () => {
    if (setUnsavedVideo) {
      setUnsavedVideo(true);
    }
    
    const stream = await startStream();
    if (!stream) return;
    
    vad.start();
    initializeAnalyzer(stream);
    
    startRecording(stream, (recordedBlob) => {
      if (videoRef.current) {
        const url = URL.createObjectURL(recordedBlob);
        videoRef.current.src = url;
        videoRef.current.srcObject = null;
        videoRef.current.controls = true;
      }
      endInterview(recordedBlob);
    });
  };
  
  // Event handler for ending interview
  const handleInterviewEnd = () => {
    stopRecording();
    stopStream();
    vad.pause();
  };
  
  // Event handler for loading video
  const handleLoadVideo = async () => {
    if (!videoRef.current || !videoLink) return;
    
    videoRef.current.pause();
    
    if (videoLink.length > 0) {
      try {
        const url = await getVideoLink(videoLink);
        videoRef.current.src = url;
        videoRef.current.load();
        videoRef.current.currentTime = 0;
        videoRef.current.muted = false;
      } catch (error) {
        console.error("Error loading video:", error);
        setHasVideo(false);
      }
    } else {
      setHasVideo(false);
    }
  };


  useEffect(() => {
    if (interviewedStarted && !recording) {
      handleInterviewStart();
    }
    
    return () => {
      if (recording) {
        handleInterviewEnd();
      }
    };
  }, [interviewedStarted]);
  
  useEffect(() => {
    if (!voiceMode) {
      handleInterviewEnd();
    } else if (voiceMode && interviewedStarted && !recording) {
      handleInterviewStart();
    }
    
    return () => {
      if (!voiceMode && recording) {
        handleInterviewEnd();
      }
    };
  }, [voiceMode]);
  
  useEffect(() => {
    if (interviewEnded) {
      handleInterviewEnd();
    }
  }, [interviewEnded]);
  
  useEffect(() => {
    handleLoadVideo();
    
    return () => {
      if (recording) {
        handleInterviewEnd();
      }
    };
  }, [videoLink]);
  
  // Don't render if voice mode is off
  if (!voiceMode) {
    return <></>;
  }
  
  return (
    <div className="">
      <div className="">
        {!onlyAudio &&
          (hasVideo || videoLink ? (
            <video className="" ref={videoRef} controls muted></video>
          ) : (
            <p className="text">Press start recording to show video</p>
          ))}
      </div>
      {recording && (
        <div className="mt-3 justify-center flex gap-10">
          <div className="flex justify-center items-center relative mt-5 mb-1 ml-5">
            {/* expanding/contracting circle */}
            <div
              ref={circleRef}
              className="absolute w-16 h-16 border-2 border-green-500 rounded-full transition-transform duration-10"
            ></div>
            {/* microphone icon */}
            <div className="relative z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}