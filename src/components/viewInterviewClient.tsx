'use client'
import React, { useState } from 'react'
import { InterviewQuestions } from './interviewQuestions'
import { interview } from '@/app/types/interview'
import { InterviewForm } from './InterviewForm'
import { Button } from './ui/button'
interface ViewInterviewClientProps {
  interview:interview
}
const ViewInterviewClient = ({interview}:ViewInterviewClientProps) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log(interview)
  const convertInterviewToInitialData = ()=> {
    const name = interview.name
    const jobDescription = interview.jobDescription
    const additionalDescription = interview.additionalDescription
    
    let numberOfTechnical = 0
    let numberOfBehavioral = 0
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
  
  const [showQuestions,setShowQuestions] = useState(false)
  const [initialData,setInitialData] = useState(convertInterviewToInitialData())
  const convertUrlToName = (pdfUrl:string)=> {
    const serverUrlCut = interview.resumeLink.replace(apiUrl+"/Interview/getPdf/","")
    return serverUrlCut.substring(serverUrlCut.indexOf("_")+1)
  }
  return (
    <div className='flex flex-col h-full items-center justify-center'>

    <Button onClick={()=> {setShowQuestions(!showQuestions)}} className="ml-4 m-2">{showQuestions ? "Go to interview info" : "Go to Questions"} </Button>
    { !showQuestions ? 
    <div className='w-full'>
    <InterviewForm initialResumeUrl={interview.resumeLink} initialResumeName={interview.resumeLink ? convertUrlToName(interview.resumeLink): ""}  initialData={initialData} disabled={true}></InterviewForm> </div> :
    <InterviewQuestions secondsPerAnswer={interview.secondsPerAnswer} questionsProp={interview.questions} />
    }
    </div>
  )
}

export default ViewInterviewClient