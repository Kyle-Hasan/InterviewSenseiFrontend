import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { useMicVAD, utils } from "@ricky0123/vad-react";
import { send } from "process";
interface LiveInterviewVideoRecordProps {
  setBlob: (blob: Blob) => void;
  sendMessage: (blob:Blob) => void;
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
  const vad = useMicVAD({
    startOnLoad: false,
    redemptionFrames:20,
    onSpeechEnd: async (audio) => {
      
      const wavBuffer = utils.encodeWAV(audio)


      const recordedBlob = convertDataToBlob([wavBuffer]);
  
      

      setBlob(recordedBlob)
      await sendMessage(recordedBlob);
      
    },
  })
  // for silence check streams( easier to extract audio only out of)

  // State variables
  const [recording, setRecording] = useState(false);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [transcript, setTranscript] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceStartTimeRef = useRef<number | null>(null);
  const lastCheckTime = useRef<number>(0);
  const lastVolume = useRef<number>(0);
  const lastSpokeTime = useRef<number>(0);

  const MAX_INTERVIEW_LENGTH = 300;
  const CHECK_INTERVAL = 200;
  let SILENCE_THRESHOLD = 0.01;
  const SILENCE_THRESHOLD_MULTIPLIER = 2.8;
  const SILENCE_DURATION_TARGET = 800; // 800 ms
  const DECAY_FACTOR = 0.60; // make volume drops faster if they stop making noise
  

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
    return new Blob(data, { type: "audio/wav" });
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
      vad.start();

      if (videoRef.current && mediaStream.current) {
        videoRef.current.srcObject = mediaStream.current;
        videoRef.current.muted = true;
        videoRef.current.play();
      }
       // we switch to VAD for now, keep other code in case we cant use that library for some reason
     // initializeSilenceDetection();

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

  const initializeSilenceDetection = async () => {
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(mediaStream.current as MediaStream);
    const analyser = audioContext.createAnalyser();
  
    analyser.fftSize = 1024; // Increased for better frequency analysis
    source.connect(analyser);
  
    analyserRef.current = analyser;
    await preWarmMicrophone(300);
    const avgBackgroundNoise = await calibrateForBackgroundNoise(500);
    SILENCE_THRESHOLD = avgBackgroundNoise * SILENCE_THRESHOLD_MULTIPLIER; // Increase threshold multiplier
  
    
  
    checkSilence();
  };

  const preWarmMicrophone = (duration = 300): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, duration));
  };
  
  const calibrateForBackgroundNoise = (duration = 300): Promise<number> => {
    const startTime = performance.now();
    const noiseSamples: number[] = [];
  
    return new Promise((resolve) => {
      const sampleNoise = () => {
        noiseSamples.push(getAmplitudeRMS());
        // remove first 3 to account for mic warming up(may need adjustments)
       
  
        if (performance.now() - startTime < duration) {
          requestAnimationFrame(sampleNoise)
        } else {
          
          // filter out initial 0's/ quietness, even if it really is just mostly 0, this wont effect the avg too much since its default 0
          noiseSamples.splice(0,3)

        
          const noiseSampleAvg =
            noiseSamples.reduce((sum, sample) => sum + sample, 0) / noiseSamples.length;
          resolve(noiseSampleAvg);
        }
      };
  
      sampleNoise();
    });
  };
  
  const getAmplitudeRMS = (): number => {
    const amplitudeArr = new Uint8Array(analyserRef.current?.frequencyBinCount ?? 0);
    analyserRef.current?.getByteFrequencyData(amplitudeArr);
  
    // Calculate raw RMS from frequency data
    const rawRMS = Math.sqrt(
      amplitudeArr.reduce((sum, amp) => sum + amp ** 2, 0) / amplitudeArr.length
    );
  
    // Dynamically choose a smoothing factor:
    // - Use a lower factor (faster decay) if rawRMS is lower than the smoothed value.
    // - Use a higher factor (slower increase) if rawRMS is higher.
    const decayFactor = rawRMS < lastVolume.current ? 0.5 : 0.9;
  
    // Apply exponential smoothing: when falling, the value drops faster; when rising, it climbs slower.
    const smoothedRMS = lastVolume.current * decayFactor + rawRMS * (1 - decayFactor);
    lastVolume.current = smoothedRMS;
  
    return smoothedRMS;
  };
  
  const checkSilence = () => {
    const now = performance.now();
    if (now - lastCheckTime.current < CHECK_INTERVAL) {
      requestAnimationFrame(checkSilence);
      return;
    }
    lastCheckTime.current = now;
  
    const avg = getAmplitudeRMS();
  
  
    // **If volume suddenly drops 60% within 500ms, assume silence**
    if (avg < lastVolume.current * 0.4 && now - lastSpokeTime.current < 500) {
     
      lastSpokeTime.current = now - SILENCE_DURATION_TARGET; // Force earlier silence detection
    }
  
    if (avg < SILENCE_THRESHOLD) {
      if (!silenceStartTimeRef.current) {
        silenceStartTimeRef.current = Date.now();
      }
      if (Date.now() - silenceStartTimeRef.current >= SILENCE_DURATION_TARGET) {
      
        silenceStartTimeRef.current = null;
      }
    } else {
      silenceStartTimeRef.current = null; // Reset if speaking
      lastSpokeTime.current = now;
    }
  
    setTimeout(checkSilence, CHECK_INTERVAL);
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
