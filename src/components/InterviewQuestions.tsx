"use client";

import React, { useEffect, useState } from "react";
import InterviewRecord from "./InterviewRecord";
import { Button } from "./ui/button";
import { PopupDialog } from "./PopupDialog";
import { useQuestionStore } from "@/app/hooks/useQuestions";
import { question } from "@/app/types/question";

interface interviewQuestionsProps {
  questionsProp: question[];
  secondsPerAnswer: number;
}

export const InterviewQuestions = ({
  questionsProp,
  secondsPerAnswer,
}: interviewQuestionsProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [unsavedVideo, setUnsavedVideo] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  

  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dialogConfirm, setDialogConfirm] = useState<(e: any) => any>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      console.log(e);
    }
  );
  const changeQuestion = (offset: number) => {
    // if question is unsaved, ask them to confirm before moving on
    if (unsavedVideo) {
      setDialogOpen(true);
      const confirmFunction = () => {
        setCurrentQuestionIndex(currentQuestionIndex + offset);
        setUnsavedVideo(false);
        setDialogOpen(false);
      };
      setDialogConfirm(() => confirmFunction); // Wrap it in a function
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + offset);
      setUnsavedVideo(false);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="mb-0 mt-3  flex justify-center space-x-4 w-screen">
        {currentQuestionIndex !== 0 && (
          <Button
            className="self-end ml-3"
            onClick={() => {
              changeQuestion(-1);
            }}
          >
            Go Back
          </Button>
        )}
        {currentQuestionIndex !== questionsProp.length - 1 && (
          <Button
            className="self-start mr-10"
            onClick={() => {
              changeQuestion(1);
            }}
          >
            Next Question
          </Button>
        )}
      </div>

      {questionsProp && questionsProp.length > 0 && (
        <>
          {" "}
          <InterviewRecord
            secondsPerAnswer={secondsPerAnswer}
            setUnsavedVideo={setUnsavedVideo}
            question={questionsProp[currentQuestionIndex]}
            disabled={false}
          ></InterviewRecord>
          <PopupDialog
            open={dialogOpen}
            setOpen={setDialogOpen}
            onConfirm={dialogConfirm}
            description={
              "Your response has not been saved, if you proceeed it will be lost"
            }
            title={"Unsaved response"}
          ></PopupDialog>
        </>
      )}
    </div>
  );
};
