
import { InterviewForm } from "@/components/InterviewForm"



export default function generateInterviewForms() {
    
    const initialData = {
      resume:null,
      numberOfBehavioral:0,
      numberOfTechnical:0,
      jobDescription:"",
      name: "",
      secondsPerAnswer:120,
      additionalDescription:""
    }
  
  return ( <InterviewForm initialResumeUrl="" initialResumeName="" initialData={initialData} disabled={false}></InterviewForm>
  )
}
