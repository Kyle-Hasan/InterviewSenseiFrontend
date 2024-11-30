"use client";

import axiosInstance from "@/app/utils/axiosInstance";
import { useEffect, useState } from "react";
import { interview } from "../../types/interview";
import { InterviewQuestions } from "@/components/interviewQuestions";

export default function Page({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [interview, setInterview] = useState<interview>({
    name: "",
    questions: [],
    jobDescription: "",
    resumeLink: "",
    id: -1,
  });

  useEffect(() => {
    
    const unwrapParams = async () => {
      const { id } = await paramsPromise;
      setId(id);
    };

    unwrapParams();
  }, [paramsPromise]);

  useEffect(() => {
    if (id) {
      const getData = async () => {
        try {
          const response = await axiosInstance.get(`/Interview/${id}`);
          const data: interview = response.data;
          setInterview(data);
        } catch (error) {
          console.error("Failed to fetch interview data:", error);
        }
      };

      getData();
    }
  }, [id]);

  return (
    <div className="flex items-center flex-col justify-center">
      {interview.questions.length > 0 && (
        <InterviewQuestions questions={interview.questions} />
      )}
    </div>
  );
}
