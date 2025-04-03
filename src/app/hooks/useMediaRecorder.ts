import { useRef, useState } from "react";

export const useMediaRecorder= (maxRecordingLength = 5 * 60 * 1000)=> {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);
    const [recording, setRecording] = useState(false);
  
    const startRecording = async (stream: MediaStream, onStop: (blob: Blob) => void) => {
      if (!stream) return null;
      
      try {
        setRecording(true);
        
        mediaRecorderRef.current = new MediaRecorder(stream);
        const data: Blob[] = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => data.push(event.data);
        mediaRecorderRef.current.start();
        
        // Set up promise to handle recording stop
        const stopped = new Promise<Blob[]>((resolve, reject) => {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = () => resolve(data);
            mediaRecorderRef.current.onerror = (event: ErrorEvent) => reject(event);
          }
        });
        
        // Auto-stop recording after maximum time
        timeoutId.current = setTimeout(() => {
          if (mediaRecorderRef.current?.state === "recording") {
            stopRecording();
          }
        }, maxRecordingLength);
        
        // Wait for recording to stop and return blob
        const recordedChunks = await stopped;
        const recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
        onStop(recordedBlob);
        
        return recordedBlob;
      } catch (error) {
        console.error("Error during recording:", error);
        setRecording(false);
        return null;
      }
    };
    
    const stopRecording = () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
      
      setRecording(false);
    };
    
    return {
      recording,
      startRecording,
      stopRecording
    };
  }