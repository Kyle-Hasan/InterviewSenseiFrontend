"use client";
import React, { useEffect, useState } from "react";
import { InterviewQuestions } from "./InterviewQuestions";
import { interview } from "@/app/types/interview";
import { InterviewForm } from "./InterviewForm";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import axiosInstance from "@/app/utils/axiosInstance";
interface ViewInterviewClientProps {
  interview: interview;
}
const ViewInterviewClient = ({ interview }: ViewInterviewClientProps) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    // if we are using signed urls, get the link from the server to blob storage, otherwise just return the link(since that means the file is on the server)
    const getResumeUrl = async () => {
      if (
        process.env.NEXT_PUBLIC_SIGNED_URLS === "true" &&
        interview.resumeLink
      ) {
        const response = await axiosInstance.get(interview.resumeLink);
        debugger
        if(response.data) {
        setResumeUrl(response.data.result);
        }
      } else {
        setResumeUrl(interview.resumeLink);
      }
    };
    getResumeUrl();
  }, [interview.resumeLink]);

  const router = useRouter();
  const convertInterviewToInitialData = () => {
    const name = interview.name;
    const jobDescription = interview.jobDescription;
    const additionalDescription = interview.additionalDescription;

    let numberOfTechnical = 0;
    let numberOfBehavioral = 0;
    interview.questions.sort((a, b) => a.id - b.id);
    interview.questions.forEach((x) => {
      if (x.type.toLowerCase() === "technical") {
        numberOfTechnical++;
      } else {
        numberOfBehavioral++;
      }
    });
    return {
      name: name,
      jobDescription: jobDescription,
      resume: null,
      numberOfTechnical: numberOfTechnical,
      numberOfBehavioral: numberOfBehavioral,
      secondsPerAnswer: interview.secondsPerAnswer,
      additionalDescription,
      resumeUrl: "",
    };
  };

  // create link to view resume if it exists
  const [initialData, setInitialData] = useState(
    convertInterviewToInitialData()
  );
  // get the name of the resume from the url
  const convertUrlToName = () => {
    const serverUrlCut = interview.resumeLink.replace(
      apiUrl + "/Interview/getPdf/",
      ""
    );
    return serverUrlCut.substring(serverUrlCut.indexOf("_") + 1);
  };

  const goToQuestions = () => {
    router.replace(
      `/interviews/${interview.id}/questions/${interview.questions[0].id}`
    );
  };
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <Button
        onClick={() => {
          goToQuestions();
        }}
        className="ml-4 m-2"
      >
        {"Go to Questions"}{" "}
      </Button>

      <div className="w-full">
        <InterviewForm
          allResumes={[]}
          initialResumeUrl={resumeUrl}
          initialResumeName={interview.resumeLink ? convertUrlToName() : ""}
          initialData={initialData}
          disabled={true}
        ></InterviewForm>{" "}
      </div>
    </div>
  );
};

export default ViewInterviewClient;
