"use client";

import React, { useEffect, useState } from "react";

import { question } from "@/app/types/question";
import InterviewRecord from "@/components/InterviewRecord";
import { PopupDialog } from "@/components/PopupDialog";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/app/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";

export default function DisplayQuestion() {
  const router = useRouter();
  const pathname = usePathname();

  const obj = useParams<{ id: string }>();
  const {
    data: question,
    isLoading,
    isError,
  } = useQuery<question>({
    queryKey: ["questions", obj?.id ? +obj.id : -1],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/Question/${obj?.id}`);
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  const [unsavedVideo, setUnsavedVideo] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [nextQuestionId, setNextQuestionId] = useState<number>(-1);
  const [previousQuestionId, setPreviousQuestionId] = useState<number>(-1);

  useEffect(() => {
    if (question) {
      setNextQuestionId(
        question?.nextQuestionId ? question.nextQuestionId : -1
      );
      setPreviousQuestionId(
        question?.previousQuestionId ? question.previousQuestionId : -1
      );
    }
  }, [question]);
  // force scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dialogConfirm, setDialogConfirm] = useState<(e: any) => void>(
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      console.log(e);
    }
  );
  const changeQuestion = (offset: number) => {
    const navigateAway = () => {
      if (offset == 1) {
        router.push("/questions/" + nextQuestionId);
      } else {
        router.push("/questions/" + previousQuestionId);
      }
    };
    if (unsavedVideo) {
      setDialogOpen(true);

      setDialogConfirm(() => navigateAway); // Wrap it in a function
    } else {
      setUnsavedVideo(false);
      navigateAway();
    }
  };

  const goToInterview = () => {
    router.push("/viewInterview/" + question?.interviewId);
  };

  if (isLoading) {
    return <Spinner></Spinner>;
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="mb-0 mt-3  flex justify-center space-x-4 w-screen">
        {previousQuestionId !== -1 && (
          <Button
            className="self-end ml-3"
            onClick={() => {
              changeQuestion(-1);
            }}
          >
            Go Back
          </Button>
        )}
        {nextQuestionId !== -1 && (
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
      <div className="mb-0 mt-3  flex justify-center items-c space-x-4 w-screen">
        {question?.interviewId && question.interviewId !== -1 && (
          <Button
            className=""
            onClick={() => {
              goToInterview();
            }}
          >
            View Interview Information
          </Button>
        )}
      </div>

      {question && (
        <>
          {" "}
          <InterviewRecord
            secondsPerAnswer={question.secondsPerAnswer}
            setUnsavedVideo={setUnsavedVideo}
            question={question}
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
}
