'use client'
import { interview, question } from '@/app/types/interview'
import React, { useState } from 'react'
import InterviewRecord from './InterviewRecord'
import { Button } from './ui/button'




interface interviewQuestionsProps {
    questions:question[]
}

export const InterviewQuestions = ({questions}:interviewQuestionsProps) => {
   
  const [currentQuestionIndex,setCurrentQuestionIndex] = useState(0)
  return (
    <div className="flex flex-col justify-center items-center">

<div className='mb-0 mt-3  flex justify-center space-x-4 w-screen'>

{currentQuestionIndex !== 0 && <Button className='self-end ml-3' onClick={()=> {setCurrentQuestionIndex(currentQuestionIndex-1)}}>Go Back</Button>}
{currentQuestionIndex !== questions.length - 1 && <Button className='self-start mr-10' onClick={()=> {setCurrentQuestionIndex(currentQuestionIndex+1)}}>Next Question</Button>}
</div>


        <InterviewRecord question={questions[currentQuestionIndex]} disabled={false}></InterviewRecord>
        
        </div>
  )
}
