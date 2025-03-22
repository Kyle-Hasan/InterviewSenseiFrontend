import React, { useEffect, useRef, useState } from "react";
import Spinner from "@/components/Spinner";
import { message } from "@/app/types/message";
import DisplayMessage from "./DisplayMessage";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface LiveInterviewTranscriptProps {
  transcripts?: message[];
  loadingTranscript?: boolean;
  loadingMessage: boolean;
  loadingInitial?: boolean;
  voiceMode: boolean;
  sendMessage: (message: string) => void;
}

export default function LiveInterviewTranscript({
  transcripts = [],
  loadingTranscript = false,
  loadingInitial,
  loadingMessage,
  voiceMode,
  sendMessage,
}: LiveInterviewTranscriptProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiLoadingMessage: message = {
    interviewId: 0,
    content: "",
    fromAI: true,
    id: -1,
  };
  const userLoadingMessage: message = {
    interviewId: 0,
    content: "",
    fromAI: false,
    id: -2,
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcripts, loadingInitial, loadingMessage, voiceMode]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 text-center">Transcript</h2>
      {loadingTranscript ? (
        <Spinner />
      ) : (
        <div>
          {transcripts.length > 0 ? (
            <div className="w-full">
              {transcripts.map((message) => (
                <DisplayMessage key={message.id} message={message} loading={false} />
              ))}
            </div>
          ) : !loadingInitial && !loadingMessage && (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <p className="text-gray-500">No transcript available.</p>
            </div>
          ) }
          {loadingMessage && (
            <DisplayMessage key={userLoadingMessage.id} message={userLoadingMessage} loading={true} />
          )}
          {loadingInitial && (
            <DisplayMessage key={aiLoadingMessage.id} message={aiLoadingMessage} loading={true} />
          )}
        </div>
      )}
      <div ref={messagesEndRef} />

      {!voiceMode && (
        <div className="mt-4 flex flex-col gap-2">
          <Textarea
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full"
          />
          <Button onClick={handleSendMessage} className="self-end">
            Send
          </Button>
        </div>
      )}
    </div>
  );
}