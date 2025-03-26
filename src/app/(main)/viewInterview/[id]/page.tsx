"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import axiosInstance from "@/app/utils/axiosInstance";
import ViewInterviewClient from "@/components/ViewInterviewClient";
import { interview } from "@/app/types/interview";

async function fetchInterview(id: string) {
  const response = await axiosInstance.get("/Interview/" + id);
  return response.data;
}

export default function Page() {
  const { id } = useParams() as { id: string };

  const { data: interviewData, isLoading, error } = useQuery<interview>(
    {
    queryKey: ["interview", id],
    queryFn:() => fetchInterview(id)

    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading interview</div>;

  // Replace escaped carriage returns/newlines in the jobDescription
  const interviewFixed = {
    ...interviewData,
    jobDescription: interviewData!.jobDescription.replace(/\\r\\n/g, "\n"),
  };

  return (
    <div className="mb-4">
      <ViewInterviewClient interview={interviewFixed as interview} />
    </div>
  );
}