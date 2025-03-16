
import serverAxiosInstance from "@/app/utils/serverAxiosInstance";
import { InterviewForm } from "@/components/InterviewForm"
// get the latest resume of the user to display if they have any
async function getUserLatestResume() {
  const response = await serverAxiosInstance.get("/Interview/getLatestResume");
  
  return response.data;
}
// get all the users resumes
async function getUserResumes() {
  const response = await serverAxiosInstance.get("/Interview/getAllResumes");
  
  return response.data ? response.data : [];
}


export default async function generateInterviewForms() {
    
    const initialData = {
      resume:null,
      numberOfBehavioral:0,
      numberOfTechnical:0,
      jobDescription:"",
      name: "",
      secondsPerAnswer:120,
      additionalDescription:"",
      resumeUrl: "",
      isLive:false
    }

    

   
    const allResumes = await getUserResumes();
  

    
  
  return ( <InterviewForm allResumes={allResumes} initialResumeUrl={""} initialResumeName={""}  initialData={initialData} disabled={false}></InterviewForm>
  )
}
