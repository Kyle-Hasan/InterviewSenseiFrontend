


import { interview } from "../../../types/interview";
import ViewInterviewClient from "@/components/viewInterviewClient";
import serverAxiosInstance from "@/app/utils/serverAxiosInstance";

async function fetchInterview(id:string) {
  


  const interviewResponse = await serverAxiosInstance.get("/Interview/"+id)
  console.log(interviewResponse.data)


  return interviewResponse.data
}



export default  async function Page({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const {id} = await paramsPromise
  
  const interview = await fetchInterview(id)
  

  

  return (
    <div className="mb-4" >
     <ViewInterviewClient interview={interview} />
    </div>
  );
}

