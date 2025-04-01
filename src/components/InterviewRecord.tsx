"use client";
import VideoRecord from "@/components/VideoRecord";
import React, { useEffect, useState } from "react";

import axiosInstance from "../app/utils/axiosInstance";
import Spinner from "@/components/Spinner";

import { useQuestionStore } from "@/app/hooks/useQuestions";
import { question } from "@/app/types/question";
import { response } from "@/app/types/response";
import { useResponses } from "@/app/hooks/useResponses";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface InterviewRecordProps {
  question: question;
  disabled: boolean;
  setUnsavedVideo: (recording: boolean) => void;
  secondsPerAnswer: number;
}

export default function InterviewRecord({
  question,
  setUnsavedVideo,
  secondsPerAnswer,
}: InterviewRecordProps) {
  const sendForReview = async (question: question) => {
    try {
      if (blob) {
        setLoadingResponse(true);

        const formData = new FormData();
        formData.append("video", blob, "video.webm");
        formData.append("question", question.body);
        formData.append("questionId", question.id.toString());

        const response = await axiosInstance.post(
          "/Response/rateAnswer",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setUnsavedVideo(false);
        setLoadingResponse(false);
        const data: response = response.data;
        convertToGoodAndBad(data.positiveFeedback, data.negativeFeedback);
        setAnswer(data.answer);

        return data;
      }
    } catch (e) {
      alert("Error " + e);
    } finally {
      setLoadingResponse(false);
      setUnsavedVideo(false);
    }
  };

  const postUpdate = () => {
    setSelectedResponseIndex(
      responses && responses.length ? responses.length : 0
    );
  };

  const [blob, setBlob] = useState<Blob>();
  const [reviewGood, setReviewGood] = useState<string[]>([]);
  const [reviewBad, setReviewBad] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [answer, setAnswer] = useState("");

  const { isLoading, isError, responses, addResponse } = useResponses(
    question.id,
    () => {
      return sendForReview(question);
    },
    postUpdate
  );
  const [selectedResponseIndex, setSelectedResponseIndex] = useState<number>(0);

  useEffect(() => {
    setSelectedResponseIndex(0);
    if (!isLoading && !isError) {
      setBlob(undefined);
      setRecording(false);
      setLoadingResponse(false);
      setReviewBad([]);
      setReviewGood([]);

      if (responses && responses.length > 0) {
        setSelectedResponseIndex(responses?.length - 1);
        convertToGoodAndBad(
          responses[responses?.length - 1].positiveFeedback,
          responses[responses?.length - 1].negativeFeedback
        );
        setAnswer(responses[responses?.length - 1].answer);
      } else {
        setSelectedResponseIndex(0);
        setAnswer("");
      }
    }
  }, [question, isLoading, isError]);

  const convertToGoodAndBad = (
    positiveFeedback: string,
    negativeFeedback: string
  ) => {
    let processedFeedback = positiveFeedback.replace(/\\n/g, "\n");

    // split separate bullet points by splitting text at ..., remove good and needs improvement headers from display as well
    let goodArr = processedFeedback?.split(/\n\n+/);
    if (goodArr?.length > 0) {
      goodArr = goodArr
        .map((x) => x.replace("$", ""))

        .filter((x) => x.length > 10);
    }

    processedFeedback = negativeFeedback.replace(/\\n/g, "\n");

    let badArr = processedFeedback?.split(/\n+/);
    if (badArr?.length > 0) {
      badArr = badArr
        .map((x) => x.replace("$", ""))
        .filter((x) => x.length > 1);
    }
    setReviewGood(goodArr);
    setReviewBad(badArr);
  };

  const handleSelectChange = (value: string) => {
    const index = +value;
    setSelectedResponseIndex(index);
    if (responses) {
      const showResponse = responses[index];
      if (responses && responses.length > 0) {
        convertToGoodAndBad(
          showResponse.positiveFeedback,
          showResponse.negativeFeedback
        );
        setAnswer(showResponse.answer);
      }
    }
  };

  if (isLoading) {
    return <Spinner></Spinner>;
  }

  return (
    <div className="flex items-center flex-col justify-center h-screen w-full">
      <h2 className="text-2xl font-bold text-center mb-5 w-full">
        Record Interview
      </h2>
      <h2 className="font-bold text-center mb-5 w-2/3 whitespace-normal break-words">
        Question: {question.body}
      </h2>

      <div className="flex justify-center items-start space-x-10 w-full h-2/3 xl:h-[80%] lg:h-[78%]">
        {/* Record Section */}
        <div className="flex flex-col items-center border-2 border-black p-5 xl:w-2/5 w-1/3  h-full">
          <h2 className="text-xl font-bold mb-4">Record</h2>
          <VideoRecord
            secondsPerAnswer={secondsPerAnswer}
            question={question.body}
            setUnsavedVideo={setUnsavedVideo}
            videoLink={
              selectedResponseIndex >= 0 &&
              responses &&
              responses.length >= 0 &&
              selectedResponseIndex < responses.length
                ? responses[selectedResponseIndex]?.videoLink
                : ""
            }
            responseLoading={loadingResponse}
            setBlob={setBlob}
            setRecording={setRecording}
            recording={recording}
            sendForReview={() => {
              addResponse.mutate();
            }}
          />
        </div>
        {responses && responses.length > 0 ? (
          <div className="flex flex-col">
            <p className="text-center mb-1">Responses </p>
            <Select
              value={selectedResponseIndex.toString()}
              onValueChange={(e) => {
                handleSelectChange(e);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder=" Select response " />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {responses?.map((x, index) => {
                    return (
                      <SelectItem key={index} value={index.toString()}>
                        Response {index + 1}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>{" "}
          </div>
        ) : (
          <p>No responses</p>
        )}

        {/* Review Section */}
        <div className="flex flex-col items-center border-2 border-black p-5 xl:w-2/5 w-1/3 h-full overflow-scroll">
          <h2 className="text-xl font-bold mb-4">Review</h2>
          {!loadingResponse ? (
            <>
              <div className="mb-2 mt-1">
                <h3 className="font-bold text-center underline mb-2 ">
                  Your Response
                </h3>
                <p className="w-full break-normal">{answer}</p>
              </div>
              {reviewGood && reviewGood.length > 0 && (
                <div className="w-full">
                  <h3 className="font-bold text-center underline mb-2">Good</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {reviewGood.map((x,index) => (
                      <li className="break-normal" key={index}>
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {reviewBad && reviewBad.length > 0 && (
                <div className="w-full mt-4">
                  <h3 className="font-bold text-center underline mb-2">Bad</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {reviewBad.map((x,index) => (
                      <li className="break-normal" key={index}>
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {responses && responses[selectedResponseIndex] && (
                <div className="w-full mt-4">
                  <h3 className="font-bold text-center underline mb-2">
                    Example Response
                  </h3>
                  <p>
                    {responses[selectedResponseIndex]?.exampleResponse?.replace(/\\n/g, "\n")}
                  </p>
                </div>
              )}
            </>
          ) : (
            <Spinner />
          )}
        </div>
      </div>
    </div>
  );
}
