import { useRef } from "react";

export const  useAudioAnalyzer = ()=> {
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const circleRef = useRef<HTMLDivElement>(null);
    
    const initializeAnalyzer = (stream: MediaStream | null) => {
      if (!stream) return;
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      
      source.connect(analyser);
      analyserRef.current = analyser;
    };
    
    const getAmplitudeRMS = (): number => {
      if (!analyserRef.current) return 0;
      
      const amplitudeArr = new Float32Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getFloatTimeDomainData(amplitudeArr);
      
      const rawRMS = amplitudeArr.reduce((sum, amp) => sum + amp, 0) / amplitudeArr.length;
      return Math.abs(rawRMS);
    };
    
    const cleanupAnalyzer = () => {
      audioContextRef.current?.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    };
    
    return {
      circleRef,
      initializeAnalyzer,
      getAmplitudeRMS,
      cleanupAnalyzer
    };
  }