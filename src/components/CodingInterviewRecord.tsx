import React, { useState, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import LiveInterview from "@/app/(main)/liveInterview/[interviewId]/page";
import LiveInterviewTabs from "./LiveInterviewTabs";
import LiveInterviewTranscript from "./LiveInterviewTranscript";
import { Switch } from "./ui/switch";
import { interviewFeedback } from "@/app/types/interviewFeedback";
import { Button } from "./ui/button";
import { Clock } from "lucide-react";
import LiveInterviewVideoRecord from "./LiveInterviewVideoRecord";
import axiosInstance from "@/app/utils/axiosInstance";
import { message } from "@/app/types/message";
import { messageResponse } from "@/app/types/messageResponse";

interface CodingInterviewRecordProps {
  interviewId: number;
}

export default function CodingInterviewRecord({interviewId}:CodingInterviewRecordProps) {
  const [voiceMode, setVoiceMode] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [feedback, setFeedback] = useState<interviewFeedback | null>(null);
  const [activeTab, setActiveTab] = useState("transcript");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [transcripts, setTranscripts] = useState<message[]>([]);
  const [playTextToSpeech, setPlayTextToSpeech] = useState(true);
  const [interviewEnded, setInterviewEnded] = useState(false);
  
  

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (interviewStarted) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [interviewStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  

  const startInterview = () => {
    setInterviewStarted(true);
    setElapsedTime(0);
  };

  const endInterview = async () => {
    setInterviewStarted(false);
  };

  const sendMessage = async (blob: Blob | null,textMessage?:string) => {
    
    setActiveTab('transcript');

    try {
      const formData = new FormData();
      formData.append("interviewId", interviewId.toString());
      if(blob) {
      formData.append("audio", blob, "audio.wav");
      
      }

      else if(textMessage) {
        formData.append("textMessage",textMessage)
      }

      setLoadingMessage(true);

      const response = await axiosInstance.post<messageResponse>(
        "/Message/addMessage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const messageResponse = response.data;
      const userMessage: message = {
        content: messageResponse.userMessage,
        fromAI: false,
        interviewId,
        id:-1
      };

      const aiMessage: message = {
        content: messageResponse.aiResponse,
        fromAI: true,
        interviewId,
        id:-2
      };

      const textToSpeech = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      };

      setTranscripts([...transcripts, userMessage, aiMessage]);
      if(playTextToSpeech) {
      textToSpeech(aiMessage.content);
      }
      setLoadingMessage(false);
      
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessage(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="p-4 border-b bg-white sticky top-0 z-10">
        <h1 className="font-bold text-xl text-center">Coding Interview</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left side: Code Editor (smaller size) */}
        <div className="border-r w-4/5 flex flex-col relative">
          {/* Control panel positioned above but separate from code editor */}
          <div className="flex items-center justify-between p-2 border-b bg-gray-50">
            <h2 className="font-medium text-gray-700">Code Editor</h2>
            
            {/* Interview Controls */}
            <div className="flex items-center gap-3">
              <div className="mb-4 mx-4">
            <LiveInterviewVideoRecord
         
         sendMessage={sendMessage}
         endInterview={endInterview}
         onlyAudio={true}
 
         interviewEnded={interviewEnded}
         interviewedStarted={interviewStarted}
         voiceMode={voiceMode}
       ></LiveInterviewVideoRecord>
       </div>
              {/* Timer */}
              <div className="flex items-center gap-1">
                <Clock size={16} className="text-gray-500" />
                <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
              </div>
              
              {/* Voice/Text Toggle */}
              <div className="flex items-center space-x-2 mx-2">
                <span className="text-xs">Text</span>
                <Switch
                  checked={voiceMode}
                  onCheckedChange={(checked) => {
                    setActiveTab("transcript");
                    setVoiceMode(checked);
                  }}
                  id="voice-mode"
                />
                <span className="text-xs">Voice</span>
              </div>
              
              {/* Start/End Interview Button */}
              {!interviewStarted ? (
                <Button 
                  size="sm"
                  onClick={startInterview}
                  className="text-xs"
                >
                  Start Interview
                </Button>
              ) : (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={endInterview}
                  className="text-xs"
                >
                  End Interview
                </Button>
              )}
            
            </div>
            
          </div>
          
          {/* Code Editor Component - now in its own div */}
          <div className="flex-1 overflow-auto p-4">
            <CodeEditor
              codeDefault="// Write code here"
              languageDefault="javascript"
            />
          
          </div>
        </div>
        
        {/* Right side: Interview Tabs */}
      
          <LiveInterviewTabs
            loadingMessage={loadingMessage}
            feedback={feedback}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loadingFeedback={loadingFeedback}
            sendMessage={(message:string)=> {sendMessage(null,message)}}
            voiceMode={voiceMode}
          />
        
      </div>
    </div>
  );
}