'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';


interface VideoRecordProps {
  setBlob: (blob:Blob)=> void,
  recording: boolean
  setRecording: (recording:boolean) => void,
  sendForReview: Function,
  responseLoading: boolean,
  videoLink:string | null,
  setUnsavedVideo: (recording:boolean) => void,
  question: string,
  secondsPerAnswer:number

  
}
export default function VideoRecord({recording,setRecording,setBlob,sendForReview, responseLoading,videoLink,setUnsavedVideo,question,secondsPerAnswer}:VideoRecordProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [hasVideo,setHasVideo] = useState(false)
  
  const mediaRecorder =  useRef<MediaRecorder | null>(null)
  const mediaStream = useRef<MediaStream | null>(null)
  const [firstRecording,setFirstRecording] = useState(false)
  const TIMEOUT = secondsPerAnswer * 1000
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [timeRemaining,setTimeRemaining] = useState(TIMEOUT/1000)
  const [minutes,setMinutes] = useState(Math.floor(secondsPerAnswer / 60).toString().padStart(2, '0'))
  const [seconds,setSeconds] = useState((secondsPerAnswer % 60).toString().padStart(2, '0'))
 

  const intervalId = useRef<NodeJS.Timeout | null>(null)
  const timeoutId = useRef<NodeJS.Timeout | null> (null)
// clean up interval
useEffect(()=> {

  
  return ()=> {
    if(intervalId.current) {
    clearInterval(intervalId.current)
    }
    
  }
}, [])

useEffect(()=> {
  
  setHasVideo(false)
  setFirstRecording(false)

  

  if(videoRef.current) {
  


  videoRef.current.pause()

  if( videoLink && videoLink.length > 0) {

  videoRef.current.src = videoLink
  videoRef.current.load()
  videoRef.current.currentTime = 0
  videoRef.current.muted = false
  

  }

  else if(!videoLink || videoLink.length === 0) {
    videoRef.current.src = ""
    setHasVideo(false)
  
  }
  
}



  return ()=> {
    if(mediaRecorder.current) {
    stopRecording()
    }

  
    
  }
}, [question,videoLink])



  const handleStream = async(stream:MediaStream)=> {
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


          
          intervalId.current = setInterval(() => {
            setTimeRemaining((prevTimeRemaining) => {
              const t = prevTimeRemaining - 1;
              const minNum = Math.floor(t / 60);
              const secondsNum = t % 60;
              setMinutes(minNum.toString().padStart(2, '0'));
              setSeconds(secondsNum.toString().padStart(2, '0'));
              return t;
            });
          }, 1000);
      
          


         timeoutId.current = setTimeout(()=> {

            if(mediaRecorder.current && mediaRecorder.current.state === 'recording') {
              mediaRecorder.current.stop()
            
              
              stopRecording()
            }

          }, TIMEOUT )
          
        
          
          await stopped;
         
          return data;
  
      }
      return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertDataToBlob = (data:any[])=> {
    return new Blob(data, {type: "video/webm"})
  }

  const startRecording = async () => {
    
    setUnsavedVideo(true)
    try {
      setRecording(true);
      setHasVideo(true)
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
      

      if (videoRef.current&& recordedChunks) {
        const recordedBlob = convertDataToBlob(recordedChunks)
        
        const url = URL.createObjectURL(recordedBlob);
        setBlob(recordedBlob)
        
        videoRef.current.src = url;
        videoRef.current.srcObject = null;
        videoRef.current.controls = true;

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
    
    if(intervalId.current) {
      clearInterval(intervalId.current)
    }
    if(timeoutId.current) {
      clearTimeout(timeoutId.current)
    }
    setTimeRemaining(TIMEOUT/1000)
    setRecording(false);
    setFirstRecording(true)
  };

  

  return (
    <div className='space-y-4 flex flex-col items-center justify-center'>
      
      
      <h2 className="text-2xl font-bold mb-3">Preview</h2>
      {
        hasVideo || (videoLink && videoLink.length > 0) ?
      <video className="lg:size-4/5 sm:size-auto" ref={videoRef} controls muted></video> : <p className='text'>Press start recording to show video</p>
        }
      <br />



      {recording ? (
        <>
        <div className='mb-2'> Time remaining: {minutes}:{seconds}</div>
        <div className='flex flex-row space-x-4'>
        
        <Button onClick={stopRecording}>Stop Recording</Button>
        </div>
        </>
      ) : (
        <div className='flex flex-row space-x-4'>
          {firstRecording && <Button  onClick={(e)=> {sendForReview()}} disabled={responseLoading}>Send for review</Button>}
        <Button onClick={startRecording} disabled={responseLoading}>Start Recording</Button>
        </div>
      )
      
      
      }

    
    </div>
  );
}
