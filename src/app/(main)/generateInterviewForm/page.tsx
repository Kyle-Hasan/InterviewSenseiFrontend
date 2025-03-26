'use client';


import axiosInstance from "@/app/utils/axiosInstance";
import { interviewType } from "@/app/types/interviewType";
import { InterviewForm } from "@/components/InterviewForm";
import { useQuery } from "@tanstack/react-query";

function useUserResumes() {
  return useQuery(
    {
    queryKey: ["userResumes"],
    queryFn: async () => {
    const response = await axiosInstance.get("/Interview/getAllResumes");
    return response.data ? response.data : [];
  }});
}

export default function GenerateInterviewForms() {
  const { data: allResumes, isLoading, error } = useUserResumes();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading resumes</div>;

  const initialData = {
    resume: null,
    numberOfBehavioral: 0,
    numberOfTechnical: 0,
    jobDescription: "",
    name: "",
    secondsPerAnswer: 120,
    additionalDescription: "",
    resumeUrl: "",
    type: interviewType.NonLive,
  };

  return (
    <InterviewForm
      allResumes={allResumes}
      initialResumeUrl={""}
      initialResumeName={""}
      initialData={initialData}
      disabled={false}
    />
  );
}
