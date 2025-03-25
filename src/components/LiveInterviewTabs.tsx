import { message } from "@/app/types/message";
import React, { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Spinner from "./Spinner";
import LiveInterviewTranscript from "./LiveInterviewTranscript";
import { interviewFeedback } from "@/app/types/interviewFeedback";
import FeedbackTab from "./FeedbackTab";
import { TabsProps } from "@radix-ui/react-tabs";
import { sendMessage } from "@microsoft/signalr/dist/esm/Utils";

interface LiveInterviewTabsProps {
  transcripts?: message[];
  loadingTranscript?: boolean;
  loadingMessage: boolean;
  loadingInitial?: boolean;
  feedback: interviewFeedback | null;
  activeTab: string,
  setActiveTab(tab:string):void,
  loadingFeedback:boolean;
  voiceMode:boolean;
  sendMessage: (message:string)=>void;
}

export default function LiveInterviewTabs({
  transcripts,
  loadingTranscript,
  loadingMessage,
  loadingInitial,
  feedback,
  activeTab,
  setActiveTab,
  loadingFeedback,
  voiceMode,
  sendMessage
  
}: LiveInterviewTabsProps) {

    

    


    return (
      <div className="flex flex-col items-center border-2 border-black p-5 h-full overflow-auto mx-5">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)}>
          <div className="sticky top-0 left-0 right-0 bg-white z-10 shadow-md">
            <TabsList className="w-full">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="transcript">
            {loadingTranscript ? (
              <Spinner />
            ) : (
              <LiveInterviewTranscript
                loadingInitial={loadingInitial}
                loadingMessage={loadingMessage}
                transcripts={transcripts}
                voiceMode={voiceMode}
                sendMessage={sendMessage}
              />
            )}
          </TabsContent>
          <TabsContent value="feedback">
            <FeedbackTab feedback={feedback} loadingFeedback={loadingFeedback} />
          </TabsContent>
        </Tabs>
      </div>
    );
    
}
