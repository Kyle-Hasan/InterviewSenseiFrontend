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
  console.log(interview)
  const convertInterviewToInitialData = ()=> {
    const name = interview.name
    const jobDescription = interview.jobDescription
    
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
    return {name:name,jobDescription:jobDescription,resume:null,numberOfTechnical:numberOfTechnical,numberOfBehavioral:numberOfBehavioral}
  }
  const [showQuestions,setShowQuestions] = useState(false)
  const [initialData,setInitialDate] = useState(convertInterviewToInitialData())
  return (
    <div className='flex flex-col h-full items-center justify-center'>

    <Button onClick={()=> {setShowQuestions(!showQuestions)}} className="ml-4 m-2">{showQuestions ? "Go to interview info" : "Go to Questions"} </Button>
    { !showQuestions ? 
    <div className='w-full'>
    <InterviewForm initialData={initialData} disabled={true}></InterviewForm> </div> :
    <InterviewQuestions questions={interview.questions} />
    }
    </div>
  )
}

export default ViewInterviewClient