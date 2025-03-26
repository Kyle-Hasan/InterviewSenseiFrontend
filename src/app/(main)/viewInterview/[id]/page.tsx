import ViewInterviewClient from "@/components/ViewInterviewClient";
import serverAxiosInstance from "@/app/utils/serverAxiosInstance";
import { interview } from "@/app/types/interview";

async function fetchInterview(id: string) {
  const interviewResponse = await serverAxiosInstance.get("/Interview/" + id);


  return interviewResponse.data;
}

export default async function Page({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;

  

  const interview:interview = await fetchInterview(id);
  interview.jobDescription = interview.jobDescription.replace(/\\r\\n/g, '\n');

  return (
    <div className="mb-4">
      <ViewInterviewClient interview={interview} />
    </div>
  );
}
