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
  
}

export default function LiveInterviewTabs({
  transcripts,
  loadingTranscript,
  loadingMessage,
  loadingInitial,
  feedback
}: LiveInterviewTabsProps) {

    const [activeTab,setActiveTab] = useState("transcript")

    // change tab to feedback if changes to a non null
    useEffect(()=> {
        if(feedback) {
            setActiveTab("feedback");
        }

    }, [feedback])


  return (
    <div className="flex flex-col items-center border-2 border-black p-5 xl:w-2/3 w-1/3 h-full overflow-auto mx-5">
    <Tabs value={activeTab}  onValueChange={(value)=> {setActiveTab(value)}}>
      <TabsList>
        <TabsTrigger value="transcript">Transcript</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>
      <TabsContent value="transcript">
      
        {loadingTranscript ? (
          <Spinner />
        ) : (
          <>
            <LiveInterviewTranscript
              loadingInitial={loadingInitial}
              loadingMessage={loadingMessage}
              transcripts={transcripts}
            />
          </>
        )}
      </TabsContent>
      <TabsContent value="feedback"><FeedbackTab feedback={feedback}></FeedbackTab></TabsContent>
    </Tabs>
    </div>
  );
}
