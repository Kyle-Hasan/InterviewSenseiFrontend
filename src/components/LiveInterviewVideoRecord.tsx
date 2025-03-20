import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useMicVAD, utils } from "@ricky0123/vad-react";
import { send } from "process";
import axiosInstance from "@/app/utils/axiosInstance";
interface LiveInterviewVideoRecordProps {
  sendMessage: (blob: Blob) => void;
  endInterview: (blob: Blob) => void;

  videoLink: string;
  setUnsavedVideo: (unsavedVideo: boolean) => void;
  interviewedStarted: boolean;
  interviewEnded: boolean;
}
export default function LiveInterviewVideoRecord({
  sendMessage,
  endInterview,
  videoLink,
  setUnsavedVideo,
  interviewedStarted,
  interviewEnded,
}: LiveInterviewVideoRecordProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // this so that we can differientiate between the first recording and the subsequent ones
  const [hasVideo, setHasVideo] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);

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
        console.log("rms is ", rms);
      } else {
        if (circleRef.current) {
          circleRef.current.style.transform = `scale(${1})`;
        }
      }
    },
    onSpeechEnd: async (audio) => {
      const wavBuffer = utils.encodeWAV(audio);

      const recordedBlob = convertDataToBlob([wavBuffer]);

      await sendMessage(recordedBlob);
    },
  });

  const [seconds, setSeconds] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [numSeconds, setNumSeconds] = useState(0);

  // State variables
  const [recording, setRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceStartTimeRef = useRef<number | null>(null);
  const lastCheckTime = useRef<number>(0);
  const lastVolume = useRef<number>(0);
  const lastSpokeTime = useRef<number>(0);
  const circleRef = useRef<HTMLDivElement>(null);
  // 5 minutes
  const MAX_INTERVIEW_LENGTH = 5 * 60 * 1000;
  const CHECK_INTERVAL = 200;
  let SILENCE_THRESHOLD = 0.01;
  const SILENCE_THRESHOLD_MULTIPLIER = 2.8;
  const SILENCE_DURATION_TARGET = 800; // 800 ms
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  // if we are using signed urls, get the link from the server to blob storage, otherwise just return the link(since that means the file is on the server)

  const getVideoLink = async (videoLink: string): Promise<string> => {
    if (process.env.NEXT_PUBLIC_SIGNED_URLS === "true") {
      const response = await axiosInstance.get(videoLink);
      if (response?.data) {
        return response.data.result;
      } else {
        return "";
      }
    } else {
      return Promise.resolve(videoLink);
    }
  };

  useEffect(() => {
    if (interviewedStarted) {
      startRecording();
    }
  }, [interviewedStarted]);

  useEffect(() => {
    if (interviewEnded) {
      stopRecording();
    }
  }, [interviewEnded]);

  // clean up interval
  useEffect(() => {
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, []);

  useEffect(() => {
    setHasVideo(false);

    const getVideo = async () => {
      if (videoRef.current) {
        videoRef.current.pause();

        if (videoLink && videoLink.length > 0) {
          // if we are using signed urls, get the link from the server to blob storage, otherwise just return the link(since that means the file is on the server)
          videoRef.current.src = await getVideoLink(videoLink);
          videoRef.current.load();
          videoRef.current.currentTime = 0;
          videoRef.current.muted = false;
        } else if (!videoLink || videoLink.length === 0) {
          setHasVideo(false);
        }
      }

      return () => {
        if (mediaRecorder.current) {
          stopRecording();
        }
      };
    };
    getVideo();
  }, [videoLink]);

  const handleStream = async (stream: MediaStream) => {
    mediaRecorder.current = new MediaRecorder(stream as MediaStream);

    // uses events from mediaRecorder.current to function
    if (mediaRecorder.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any[] = [];
      mediaRecorder.current.start();

      mediaRecorder.current.ondataavailable = (event) => data.push(event.data);

      //  mediaRecorder.current.start();
      // when the onstop event is fired, resolve, if theres an error reject.
      const stopped = new Promise((resolve, reject) => {
        if (mediaRecorder.current) {
          mediaRecorder.current.onstop = resolve;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mediaRecorder.current.onerror = (event: any) => reject(event.name);
        }
      });

      // force stop recording after maximum time as specified by timeout
      timeoutId.current = setTimeout(() => {
        if (
          mediaRecorder.current &&
          mediaRecorder.current.state === "recording"
        ) {
          stopRecording();
        }
      }, MAX_INTERVIEW_LENGTH);

      // wait until its stopped
      await stopped;
      return data;
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertDataToBlob = (data: any[], audio = true) => {
    return new Blob(data, { type: audio ? "audio/wav" : "video/webm" });
  };

  const startRecording = async () => {
    setUnsavedVideo(true);
    try {
      setRecording(true);
      setHasVideo(true);
      setMinutes("00");
      setSeconds("00");

      let mediaConstraints = { video: true, audio: true };
      let stream = null;
      //first try with audio and video, if that fails, fall back to only audio, if that doesnt work just give up
      try {
        stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      } catch (videoAudioError) {
        console.warn("Video and audio not available, trying audio-only...");

        try {
          mediaConstraints = { video: false, audio: true };
          stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
          setHasVideo(false);
        } catch (audioError) {
          console.error("No audio or video available:", audioError);
          setRecording(false);
          return;
        }
      }

      mediaStream.current = stream;
      vad.start();

      // set timer
      intervalId.current = setInterval(() => {
        setNumSeconds((prevNumSeconds) => {
          const newNumSeconds = prevNumSeconds + 1;
          setSeconds((newNumSeconds % 60).toString().padStart(2, "0"));
          setMinutes(
            Math.floor(newNumSeconds / 60)
              .toString()
              .padStart(2, "0")
          );
          return newNumSeconds;
        });
      }, 1000);

      if (videoRef.current && mediaStream.current) {
        if (mediaConstraints.video) {
          videoRef.current.srcObject = mediaStream.current;
          videoRef.current.muted = true;
          await videoRef.current.play();
        }
      }

      // we switch to VAD for now, keep other code in case we cant use that library for some reason
      // initializeSilenceDetection();
      // for the animated speaking pulse, to make it change based on volume
      initializeAudioAnalyzer();

      // records until its stopped, afterwards process video propertly

      const recordedChunks = await handleStream(mediaStream.current);

      // make file for video
      if (videoRef.current && recordedChunks) {
        const recordedBlob = convertDataToBlob(recordedChunks ?? [], false);
        endInterview(recordedBlob);

        const url = URL.createObjectURL(recordedBlob);

        videoRef.current.src = url;
        videoRef.current.srcObject = null;
        videoRef.current.controls = true;
      }
    } catch (error) {
      console.error("Error during recording:", error);
      setRecording(false);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();

    console.log(mediaRecorder.current?.state);

    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    setRecording(false);
  };

  const initializeAudioAnalyzer = () => {
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(
      mediaStream.current as MediaStream
    );
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 1024; // Increased for better frequency analysis
    source.connect(analyser);

    analyserRef.current = analyser;
  };

  const initializeSilenceDetection = async () => {
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(
      mediaStream.current as MediaStream
    );
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
          requestAnimationFrame(sampleNoise);
        } else {
          // filter out initial 0's/ quietness, even if it really is just mostly 0, this wont effect the avg too much since its default 0
          noiseSamples.splice(0, 3);

          const noiseSampleAvg =
            noiseSamples.reduce((sum, sample) => sum + sample, 0) /
            noiseSamples.length;
          resolve(noiseSampleAvg);
        }
      };

      sampleNoise();
    });
  };

  const getAmplitudeRMS = (): number => {
    const amplitudeArr = new Float32Array(
      analyserRef.current?.frequencyBinCount ?? 0
    );
    analyserRef.current?.getFloatTimeDomainData(amplitudeArr);

    // Calculate raw RMS from frequency data (get)
    const rawRMS =
      amplitudeArr.reduce((sum, amp) => sum + amp, 0) / amplitudeArr.length;
    return Math.abs(rawRMS) ?? 0;
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

  return (
    <div className="">
      <h2 className="text-xl font-bold mb-4">Live Interview</h2>
      <div className="">
        {hasVideo || videoLink ? (
          <video className="" ref={videoRef} controls muted></video>
        ) : (
          <p className="text">Press start recording to show video</p>
        )}
      </div>
      {recording && (
        <div className="mt-3 flex gap-10">
          <div>
            <p>Interview Time</p>
            <div>
              <span>{minutes}</span>:<span>{seconds}</span>
            </div>
          </div>

          <div className="flex items-center justify-center relative mt-1 mb-1 ml-5">
            {/* expanding/contracting circle */}
            <div
              ref={circleRef}
              className="absolute w-16 h-16 border-2 border-green-500 rounded-full transition-transform duration-100"
            ></div>
            {/* microphone icon from https://heroicons.com/ */}
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
