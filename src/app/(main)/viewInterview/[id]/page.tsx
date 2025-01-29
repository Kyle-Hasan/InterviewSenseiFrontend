import ViewInterviewClient from "@/components/ViewInterviewClient";
import serverAxiosInstance from "@/app/utils/serverAxiosInstance";

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

  

  const interview = await fetchInterview(id);

  return (
    <div className="mb-4">
      <ViewInterviewClient interview={interview} />
    </div>
  );
}
