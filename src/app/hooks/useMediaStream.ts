import { useRef, useState } from "react";

export const useMediaStream = (onlyAudio = false)=> {
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasVideo, setHasVideo] = useState(false);
  
    const startStream = async () => {
      try {
        let mediaConstraints = { video: !onlyAudio, audio: true };
        let stream = null;
  
        try {
          stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
          setHasVideo(!onlyAudio);
        } catch (videoAudioError) {
          console.warn("Video and audio not available, trying audio-only...");
          
          try {
            mediaConstraints = { video: false, audio: true };
            stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
            setHasVideo(false);
          } catch (audioError) {
            console.error("No audio or video available:", audioError);
            return null;
          }
        }
  
        mediaStreamRef.current = stream;
  
        if (videoRef.current && stream && !onlyAudio) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          await videoRef.current.play();
        }
  
        return stream;
      } catch (error) {
        console.error("Error starting media stream:", error);
        return null;
      }
    };
  
    const stopStream = () => {
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  
    return {
      videoRef,
      mediaStreamRef,
      hasVideo,
      setHasVideo,
      startStream,
      stopStream
    };
  }
  