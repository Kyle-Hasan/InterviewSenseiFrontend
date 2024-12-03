



import serverAxiosInstance from "@/app/utils/serverAxiosInstance";
import { InterviewQuestions } from "@/components/interviewQuestions";

export async function fetchInterview(id:string) {
  


  const interviewResponse = await serverAxiosInstance.get("/Interview/"+id)


  return interviewResponse.data
}



export default  async function Page({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const {id} = await paramsPromise
  
  const interview = await fetchInterview(id)

  

  return (
    <div >
     <InterviewQuestions questionsProp={interview.questions} />
    </div>
  );
}

