'use client'
import React, { useRef, useState } from 'react';
import { Button } from './ui/button';


interface VideoRecordProps {
  setBlob: (blob:Blob)=> void,
  recording: boolean
  setRecording: (recording:boolean) => void
}
export default function VideoRecord({recording,setRecording,setBlob}:VideoRecordProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [hasVideo,setHasVideo] = useState(false)
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const mediaRecorder =  useRef<MediaRecorder | null>(null)
  const mediaStream = useRef<MediaStream | null>(null)
  



  async function handleStream(stream:MediaStream) {
    mediaRecorder.current = new MediaRecorder(stream as MediaStream)
    if(mediaRecorder.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data:any[] = []
        mediaRecorder.current.ondataavailable = (event) => data.push(event.data)
  
        mediaRecorder.current.start()
  
        const stopped = new Promise((resolve, reject) => {
            if(mediaRecorder.current) {
            mediaRecorder.current.onstop = resolve;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mediaRecorder.current.onerror = (event:any) => reject(event.name);
            }
          });
          
        
          
          await stopped;
          debugger
          return data;
  
      }
      return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertDataToBlob = (data:any[])=> {
    return new Blob(data, {type: "video/webm"})
  }

  const startRecording = async () => {
    
    try {
      setRecording(true);
      setHasVideo(true)
      mediaStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current && mediaStream.current) {
        videoRef.current.srcObject = mediaStream.current;
        videoRef.current.play();
      }

      const recordedChunks = await handleStream(mediaStream.current);
      

      if (videoRef.current && downloadRef.current && recordedChunks) {
        const recordedBlob = convertDataToBlob(recordedChunks)
        
        const url = URL.createObjectURL(recordedBlob);
        setBlob(recordedBlob)
        
        videoRef.current.src = url;
        videoRef.current.srcObject = null;
        videoRef.current.controls = true;

        downloadRef.current.href = url;
        downloadRef.current.download = 'RecordedVideo.webm';
        downloadRef.current.textContent = 'Download Recorded Video';
      }
    } catch (error) {
      console.error('Error during recording:', error);
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
    }
    setRecording(false);
  };

  

  return (
    <div className='space-y-4 flex flex-col items-center justify-center'>
      
      {recording ? (
        <Button onClick={stopRecording}>Stop Recording</Button>
      ) : (
        <Button onClick={startRecording}>Start Recording</Button>
      )}
      <h2 className="text-2xl font-bold mb-3">Preview</h2>
      {
        hasVideo ?
      <video className="size-auto" ref={videoRef} autoPlay muted></video> : <p className='text'>Press start recording to show video</p>
        }
      <br />
      <a ref={downloadRef} className="text-blue-500 mt-4 block"></a>
    
    </div>
  );
}
