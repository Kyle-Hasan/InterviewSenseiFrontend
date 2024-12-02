


import { interview } from "../../../types/interview";
import ViewInterviewClient from "@/components/viewInterviewClient";
import serverAxiosInstance from "@/app/utils/serverAxiosInstance";

export async function fetchInterview(id:string) {
  


  const interviewResponse = await serverAxiosInstance.get("/Interview/"+id)


  return interviewResponse.data
}



export default  async function Page({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const {id} = await paramsPromise
  
  const interview = await fetchInterview(id)

  

  return (
    <div >
     <ViewInterviewClient interview={interview} />
    </div>
  );
}

