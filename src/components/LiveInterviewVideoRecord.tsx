import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
interface LiveInterviewVideoRecordProps {
  setBlob: (blob: Blob) => void;
  sendMessage: (audioChunks: any[]) => void;
  endInterview: (videoChunks: any[]) => void;
  startInterview: () => void;
  videoLink: string;
  setUnsavedVideo: (unsavedVideo: boolean) => void;
}
export default function LiveInterviewVideoRecord({
  sendMessage,
  endInterview,
  startInterview,
  videoLink,
  setUnsavedVideo,
  setBlob,
}: LiveInterviewVideoRecordProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // this so that we can differientiate between the first recording and the subsequent ones
  const [hasVideo, setHasVideo] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);

  // State variables
  const [recording, setRecording] = useState(false);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [transcript, setTranscript] = useState("");
  const MAX_INTERVIEW_LENGTH = 300;

  const handleStream = async (stream: MediaStream) => {
    mediaRecorder.current = new MediaRecorder(stream as MediaStream);
    // uses events from mediaRecorder.current to function
    if (mediaRecorder.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any[] = [];

      mediaRecorder.current.ondataavailable = (event) => data.push(event.data);

      mediaRecorder.current.start();
      // when the onstop event is fired, resolve, if theres an error reject.
      const stopped = new Promise((resolve, reject) => {
        if (mediaRecorder.current) {
          mediaRecorder.current.onstop = resolve;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mediaRecorder.current.onerror = (event: any) => reject(event.name);
        }
      });

      // force stop recording after maximum time as specified by timeout

      // wait until its stopped
      await stopped;

      return data;
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertDataToBlob = (data: any[]) => {
    return new Blob(data, { type: "video/webm" });
  };

  const startRecording = async () => {
    setUnsavedVideo(true);
    try {
      setRecording(true);
      setHasVideo(true);
      mediaStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current && mediaStream.current) {
        videoRef.current.srcObject = mediaStream.current;
        videoRef.current.muted = true;
        videoRef.current.play();
      }

      const recordedChunks = await handleStream(mediaStream.current);

      // make file for video
      if (videoRef.current && recordedChunks) {
        const recordedBlob = convertDataToBlob(recordedChunks);

        const url = URL.createObjectURL(recordedBlob);
        setBlob(recordedBlob);

        videoRef.current.src = url;
        videoRef.current.srcObject = null;
        videoRef.current.controls = true;
      }
    } catch (error) {
      console.error("Error during recording:", error);
      setRecording(false);
    }
  };

  // Mock function to handle starting a live interview session
  const startLiveInterview = async () => {
    await startInterview();
    setRecording(true);
    startRecording();

    // Additional logic for starting the actual recording will be added later
  };

  // Mock function to end live interview
  const endLiveInterview = async () => {
    setRecording(false);
    setLoadingTranscript(true);
    await endInterview([]);

    // Simulate processing delay
    setTimeout(() => {
      setTranscript(
        "This is a placeholder transcript for the interview. The actual transcript will be generated from the recorded session."
      );
      setLoadingTranscript(false);
    }, 2000);
  };
  return (
    <div className="flex flex-col items-center border-2 border-black p-5 xl:w-2/5 w-1/3 h-full mx-5">
      <h2 className="text-xl font-bold mb-4">Live Interview</h2>
      <div className="">
        {hasVideo || (videoLink && videoLink.length > 0) ? (
          <video className="" ref={videoRef} controls muted></video>
        ) : (
          <p className="text">Press start recording to show video</p>
        )}
      </div>

      <div className="flex space-x-4 mt-4">
        {!recording ? (
          <Button
            onClick={startLiveInterview}
            className="text-white px-4 py-2 rounded-md"
            disabled={loadingTranscript}
          >
            Start Interview
          </Button>
        ) : (
          <Button
            onClick={endLiveInterview}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            End Interview
          </Button>
        )}
      </div>
    </div>
  );
}
