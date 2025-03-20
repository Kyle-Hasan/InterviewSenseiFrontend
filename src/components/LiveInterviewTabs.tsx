import { message } from "@/app/types/message";
import React, { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Spinner from "./Spinner";
import LiveInterviewTranscript from "./LiveInterviewTranscript";
import { interviewFeedback } from "@/app/types/interviewFeedback";
import FeedbackTab from "./FeedbackTab";
import { TabsProps } from "@radix-ui/react-tabs";

interface LiveInterviewTabsProps {
  transcripts?: message[];
  loadingTranscript?: boolean;
  loadingMessage: boolean;
  loadingInitial: boolean;
  feedback: interviewFeedback | null;
  switchToTranscript:boolean;
  
  loadingFeedback:boolean;
  
}

export default function LiveInterviewTabs({
  transcripts,
  loadingTranscript,
  loadingMessage,
  loadingInitial,
  feedback,
  switchToTranscript,
  loadingFeedback
  
}: LiveInterviewTabsProps) {

    const [activeTab,setActiveTab] = useState(feedback ? "feedback" : "transcript")

    // change tab to feedback if changes to a non null
    useEffect(()=> {
        if(feedback && loadingFeedback) {
            setActiveTab("feedback");
        }
        else if(switchToTranscript) {
          setActiveTab("transcript")
        }

    }, [feedback,switchToTranscript,loadingFeedback]);


    return (
      <div className="flex flex-col items-center border-2 border-black p-5 xl:w-2/3 w-1/3 h-full overflow-auto mx-5">
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
