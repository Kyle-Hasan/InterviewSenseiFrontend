import React, { useState, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import LiveInterviewTabs from "./LiveInterviewTabs";
import LiveInterviewVideoRecord from "./LiveInterviewVideoRecord";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Clock } from "lucide-react";
import axiosInstance from "@/app/utils/axiosInstance";
import { interviewFeedback } from "@/app/types/interviewFeedback";
import { message } from "@/app/types/message";
import { messageResponse } from "@/app/types/messageResponse";

interface CodingInterviewRecordProps {
  interviewId: number;
}

export default function CodingInterviewRecord({
  interviewId,
}: CodingInterviewRecordProps) {
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
  const [userCode,setUserCode] = useState("//write code here");
  const [codeLanguageName,setCodeLanguageName] = useState("javascript");
  const [questionBody,setQuestionBody] = useState("");


  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (interviewStarted) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [interviewStarted]);

  useEffect(()=> {

    const getData = async()=>{

      try{
      setLoadingFeedback(true);
    const body = {
      id:interviewId,
      fields: ['messages','feedback','codelanguagename','usercode']
    }

    const response = await axiosInstance.post<{
          feedback: interviewFeedback;
          messages: message[];
          userCode:string;
          codeLanguageName:string;
          questionBody:string
        }>("/Interview/getCodingInterviewInfo",body)

        setFeedback(response.data.feedback);
        setTranscripts(response.data.messages);
        setUserCode(response.data.userCode);
        setCodeLanguageName(response.data.codeLanguageName);
        

      }
      catch(error) {
        console.error(error);
      }
      finally {
        setLoadingTranscript(false);

      }
      }
      getData();

  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startInterview = () => {
    setInterviewStarted(true);
    setElapsedTime(0);
  };

  const endInterview = async () => {
    setInterviewStarted(false);
  };

  const sendMessage = async (blob: Blob | null, textMessage?: string) => {
    setActiveTab("transcript");
    try {
      const formData = new FormData();
      formData.append("interviewId", interviewId.toString());
      if (blob) {
        formData.append("audio", blob, "audio.wav");
      } else if (textMessage) {
        formData.append("textMessage", textMessage);
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
        id: -1,
      };
      const aiMessage: message = {
        content: messageResponse.aiResponse,
        fromAI: true,
        interviewId,
        id: -2,
      };

      const textToSpeech = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      };

      setTranscripts([...transcripts, userMessage, aiMessage]);
      if (playTextToSpeech) {
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
        {/* Column 1: Controls */}
        <div className="w-1/4 border-r p-4 overflow-auto">
          <h2 className="font-medium text-gray-700 mb-4">Interview Controls</h2>
          <div className="flex flex-col gap-4">
            {/* Live Interview Video Record */}
            <LiveInterviewVideoRecord
              sendMessage={sendMessage}
              endInterview={endInterview}
              onlyAudio={true}
              interviewEnded={interviewEnded}
              interviewedStarted={interviewStarted}
              voiceMode={voiceMode}
            />
            {/* Timer */}
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-gray-500" />
              <span className="font-mono text-sm">
                {formatTime(elapsedTime)}
              </span>
            </div>
            {/* Voice/Text Toggle */}
            <div className="flex items-center space-x-2">
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
            <div className="flex justify-center">
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
          <div>
            <h2 className="font-bold mb-1">Question </h2>
            <div>
            {questionBody}
            </div>
          </div>
        </div>

        {/* Column 2: Code Editor */}
        <div className="w-1/2 border-r p-4 overflow-auto">
          <h2 className="font-medium text-gray-700 mb-4">Code Editor</h2>
          <CodeEditor
            interviewId={interviewId}
            codeDefault={userCode}
            languageDefault={codeLanguageName}
          />
        </div>

        {/* Column 3: Transcript */}
        <div className="w-1/4 p-4 overflow-auto">
          <h2 className="font-medium text-gray-700 mb-4">Transcript</h2>
          <LiveInterviewTabs
            loadingMessage={loadingMessage}
            feedback={feedback}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loadingFeedback={loadingFeedback}
            sendMessage={(message: string) => {
              sendMessage(null, message);
            }}
            voiceMode={voiceMode}
          />
        </div>
      </div>
    </div>
  );
}
