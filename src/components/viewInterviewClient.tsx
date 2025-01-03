'use client'
import React, { useState } from 'react'
import { InterviewQuestions } from './InterviewQuestions'
import { interview } from '@/app/types/interview'
import { InterviewForm } from './InterviewForm'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
interface ViewInterviewClientProps {
  interview:interview
}
const ViewInterviewClient = ({interview}:ViewInterviewClientProps) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log(interview)
  const router = useRouter()
  const convertInterviewToInitialData = ()=> {
    const name = interview.name
    const jobDescription = interview.jobDescription
    const additionalDescription = interview.additionalDescription
    
    let numberOfTechnical = 0
    let numberOfBehavioral = 0
    interview.questions.sort((a,b)=> a.id-b.id)
    interview.questions.forEach((x)=> {
      if(x.type.toLowerCase()=== 'technical') {
        numberOfTechnical++;
      }
      else {
        numberOfBehavioral++;
      }
    })
    return {name:name,jobDescription:jobDescription,resume:null,numberOfTechnical:numberOfTechnical,numberOfBehavioral:numberOfBehavioral, secondsPerAnswer:interview.secondsPerAnswer,additionalDescription}
  }
  
  // create link to view resume if it exists
  const [initialData,setInitialData] = useState(convertInterviewToInitialData())
  const convertUrlToName = (pdfUrl:string)=> {
    const serverUrlCut = interview.resumeLink.replace(apiUrl+"/Interview/getPdf/","")
    return serverUrlCut.substring(serverUrlCut.indexOf("_")+1)
  }

  const goToQuestions = ()=> {
   
    router.replace(`/interviews/${interview.id}/questions/${interview.questions[0].id}`)
  }
  return (
    <div className='flex flex-col h-full items-center justify-center'>

    <Button onClick={()=> {goToQuestions()}} className="ml-4 m-2">{ "Go to Questions"} </Button>

    <div className='w-full'>
    <InterviewForm initialResumeUrl={interview.resumeLink} initialResumeName={interview.resumeLink ? convertUrlToName(interview.resumeLink): ""}  initialData={initialData} disabled={true}></InterviewForm> </div>
 
    
    </div>
  )
}

export default ViewInterviewClient