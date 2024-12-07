
import { InterviewForm } from "@/components/InterviewForm"



export default function generateInterviewForms() {
    
    const initialData = {
      resume:null,
      numberOfBehavioral:0,
      numberOfTechnical:0,
      jobDescription:"",
      name: ""
    }
  
  return ( <InterviewForm initialData={initialData} disabled={false}></InterviewForm>
  )
}
