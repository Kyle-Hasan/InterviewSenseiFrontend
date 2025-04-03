"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import axiosInstance from "@/app/utils/axiosInstance";
import { useVideoLink } from "@/app/hooks/useVideoLink";
import { useMediaStream } from "@/app/hooks/useMediaStream";
import { useMediaRecorder } from "@/app/hooks/useMediaRecorder";


interface VideoRecordProps {
  setBlob: (blob: Blob) => void;
  recording: boolean;
  setRecording: (recording: boolean) => void;
  sendForReview: Function;
  responseLoading: boolean;
  videoLink: string | null;
  setUnsavedVideo: (recording: boolean) => void;
  question: string;
  secondsPerAnswer: number;
}

export default function VideoRecord({
  recording,
  setRecording,
  setBlob,
  sendForReview,
  responseLoading,
  videoLink,
  setUnsavedVideo,
  question,
  secondsPerAnswer,
}: VideoRecordProps) {
  const TIMEOUT = secondsPerAnswer * 1000;
  const [firstRecording, setFirstRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIMEOUT / 1000);
  const [minutes, setMinutes] = useState(
    Math.floor(secondsPerAnswer / 60).toString().padStart(2, "0")
  );
  const [seconds, setSeconds] = useState(
    (secondsPerAnswer % 60).toString().padStart(2, "0")
  );
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const { getVideoLink } = useVideoLink();
  const { videoRef, mediaStreamRef, hasVideo, setHasVideo, startStream, stopStream } =
    useMediaStream();
  const { recording: isRecording, startRecording: record, stopRecording: stopRec } =
    useMediaRecorder(TIMEOUT);

  useEffect(() => {
    return () => {
      if (intervalId.current) { 
        clearInterval(intervalId.current);
      }
      if (timeoutId.current) { 
        clearTimeout(timeoutId.current);
      }
      stopRec();
      stopStream();
    };
  }, []);

  useEffect(() => {
    setHasVideo(false);
    setFirstRecording(false);
    (async () => {
      if (videoRef.current) {
        videoRef.current.pause();
        if (videoLink) {
          const src = await getVideoLink(videoLink);
          videoRef.current.src = src || "";
          videoRef.current.load();
          videoRef.current.currentTime = 0;
          videoRef.current.muted = false;
        }
      }
    })();
  }, [question, videoLink]);

  const startRecProcess = async () => {
    setUnsavedVideo(true);
    setRecording(true);
    setHasVideo(true);
    const stream = await startStream();
    if (stream) {
      videoRef.current!.srcObject = stream;
      videoRef.current!.muted = true;
      await videoRef.current!.play();
      intervalId.current = setInterval(() => {
        setTimeRemaining((t) => {
          const newT = t - 1;
          const minNum = Math.floor(newT / 60);
          const secNum = newT % 60;
          setMinutes(minNum.toString().padStart(2, "0"));
          setSeconds(secNum.toString().padStart(2, "0"));
          return newT;
        });
      }, 1000);
      timeoutId.current = setTimeout(() => {
        if (isRecording) {
          endRecProcess();
        }
      }, TIMEOUT);
      await record(stream, (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setBlob(blob);
        videoRef.current!.srcObject = null;
        videoRef.current!.src = url;
        videoRef.current!.controls = true;
      });
    } else {
      setRecording(false);
    }
  };

  const endRecProcess = () => {
    setRecording(false);
    setFirstRecording(true);
    stopRec();
    stopStream();
    if (intervalId.current) clearInterval(intervalId.current);
    if (timeoutId.current) clearTimeout(timeoutId.current);
    setTimeRemaining(TIMEOUT / 1000);
  };

  return (
    <div className="space-y-4 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-3">Preview</h2>
      {hasVideo || (videoLink && videoLink.length > 0) ? (
        <video ref={videoRef} controls muted />
      ) : (
        <p className="text">Press start recording to show video</p>
      )}
      {recording ? (
        <>
          <div className="mb-2">
            Time remaining: {minutes}:{seconds}
          </div>
          <div className="flex flex-row space-x-4">
            <Button onClick={endRecProcess}>Stop Recording</Button>
          </div>
        </>
      ) : (
        <div className="flex flex-row space-x-4">
          {firstRecording && (
            <Button onClick={() => sendForReview()} disabled={responseLoading}>
              Send for review
            </Button>
          )}
          <Button onClick={startRecProcess} disabled={responseLoading}>
            Start Recording
          </Button>
        </div>
      )}
    </div>
  );
}
