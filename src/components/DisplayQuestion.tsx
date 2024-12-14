'use client'

import React, { useEffect, useState } from 'react'
import InterviewRecord from './InterviewRecord'
import { Button } from './ui/button'
import { PopupDialog } from './PopupDialog'
import { useQuestionStore } from '@/app/hooks/useQuestions'
import { question } from '@/app/types/question'




interface DisplayQuestionProps {
    question:question,
    secondsPerAnswer:number
  
}

export const DisplayQuestion = ({questionId,secondsPerAnswer}:DisplayQuestionProps) => {
   
  
  const [unsavedVideo,setUnsavedVideo] = useState(false)
  const [dialogOpen,setDialogOpen] = useState(false)
  const setQuestions = useQuestionStore((state)=> state.setQuestion)
  const [question,setQuestion] = useState<question>()
  

  const questions = useQuestionStore((state)=> state.questions)

  useEffect(()=> {
    setQuestions(questionsProp)
  } , [questionsProp,setQuestions])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dialogConfirm,setDialogConfirm] = useState((e:any)=> {console.log(e)})
  const changeQuestion = (offset:number) => {
    ;
    if (unsavedVideo) {
      setDialogOpen(true);
      const confirmFunction = (e) => {
        ;
       
        setUnsavedVideo(false);
        setDialogOpen(false);
      };
      setDialogConfirm(() => confirmFunction); // Wrap it in a function
    }
    
    else {
 
      setUnsavedVideo(false)
    }
  }
  return (
    <div className="flex flex-col justify-center items-center">

<div className='mb-0 mt-3  flex justify-center space-x-4 w-screen'>

{currentQuestionIndex !== 0 && <Button className='self-end ml-3' onClick={()=> {changeQuestion(-1)}}>Go Back</Button>}
{currentQuestionIndex !== questions.length - 1 && <Button className='self-start mr-10' onClick={()=> {changeQuestion(1)}}>Next Question</Button>}
</div>

        {questions && questions.length > 0 && 
       <> <InterviewRecord secondsPerAnswer={secondsPerAnswer} setUnsavedVideo={setUnsavedVideo} question={questions[currentQuestionIndex]} disabled={false}></InterviewRecord>
        <PopupDialog open={dialogOpen} setOpen={setDialogOpen}  onConfirm={dialogConfirm} description={"Your response has not been saved, if you proceeed it will be lost"} title={"Unsaved response"}></PopupDialog></>}
        </div>
  )
}
