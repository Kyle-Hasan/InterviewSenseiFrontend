'use client'
import VideoRecord from '@/components/VideoRecord'
import React, { useEffect, useState } from 'react'


import axiosInstance from '../app/utils/axiosInstance'
import Spinner from '@/components/Spinner'
import { question } from '@/app/types/interview'
import { useQuestionStore } from '@/app/hooks/useQuestions'

interface InterviewRecordProps {
  question:question,
  disabled:boolean,
  setUnsavedVideo: (recording:boolean) => void,
  secondsPerAnswer:number
  
}

export default function InterviewRecord({question,setUnsavedVideo,secondsPerAnswer}:InterviewRecordProps) {

  const [blob,setBlob] = useState<Blob>()
  const [reviewGood,setReviewGood] = useState<string[]>([])
  const [reviewBad,setReviewBad] = useState<string[]>([])
  const [recording,setRecording] = useState(false)
  const [loadingResponse,setLoadingResponse] = useState(false)
  const [response,setResponse] = useState("")
  const updateQuestion = useQuestionStore((state)=> state.updateQuestion)
  

  useEffect((
    ()=> {
      setBlob(undefined)
      setRecording(false)
      setLoadingResponse(false)
      setReviewBad([])
      setReviewGood([])
      if(question.feedback && question.feedback.length > 0) {
      convertToGoodAndBad(question.feedback)
      }
      setResponse(question.response)
      
    }
  ), [question])

  const convertToGoodAndBad = (feedback:string)=> {
  
    const feedbackArray = feedback.split('@u5W$')
    if(feedbackArray.length == 1) {
      setReviewBad([feedbackArray[0]])
    }
    else {
    let goodArr = feedbackArray[1].split("...")
    if(goodArr.length > 0) {
     goodArr[0] =  goodArr[0].replace("Good: ", "")
     goodArr = goodArr.map(x => x.replace("$","")).filter(x=> x.length > 0)
    }
    
    let badArr = feedbackArray[2].split("...")
    if(badArr.length > 0) {
      badArr[0] = badArr[0].replace("Needs Improvement: ","")
      badArr = badArr.map(x => x.replace("$","")).filter(x=> x.length > 0)
    }
    setReviewGood(goodArr)
    setReviewBad(badArr)
  }
  }
  
  const sendForReview = async()=> {

    
    try {
    if(blob) {
      setLoadingResponse(true)

      const formData = new FormData();
      formData.append("video",blob,"video.webm")
      formData.append("question", question.body )
      formData.append("questionId",question.id.toString())

    const response = await axiosInstance.post("/Interview/rateAnswer",formData,{
      headers: {
        'Content-Type':'multipart/form-data'
      }
    });
    setUnsavedVideo(false)
    setLoadingResponse(false)
    const data:question = response.data
    convertToGoodAndBad(data.feedback)
    setResponse(data.response)
    updateQuestion(data)
  }
  
    
  }
  catch(e) {
    alert("Error " + e)
  }
  finally {
    setLoadingResponse(false)
    setUnsavedVideo(false)

  }

}
  return (
    <div className='flex items-center flex-col justify-center h-screen w-full'>
  <h2 className='text-2xl font-bold text-center mb-5 w-full'>Record Interview</h2>
  <h2 className='font-bold text-center mb-5 w-2/3 whitespace-normal break-words'>Question: {question.body}</h2>
  
  <div className='flex justify-center items-start space-x-10 w-full h-2/3 xl:h-[80%] lg:h-[78%]'>
    {/* Record Section */}
    <div className='flex flex-col items-center border-2 border-black p-5 xl:w-2/5 w-1/3  h-full'>
      <h2 className='text-xl font-bold mb-4'>Record</h2>
      <VideoRecord secondsPerAnswer={secondsPerAnswer} question={question.body} setUnsavedVideo={setUnsavedVideo} videoLink={question.videoLink} responseLoading={loadingResponse} setBlob={setBlob} setRecording={setRecording} recording={recording} sendForReview={sendForReview} />
      
    </div>
    
    {/* Review Section */}
    <div className='flex flex-col items-center border-2 border-black p-5 xl:w-2/5 w-1/3 h-full overflow-scroll'>
      <h2 className='text-xl font-bold mb-4'>Review</h2>
      { !loadingResponse ? 
      
      <>
      <div className='mb-2 mt-1'>
      <h3 className='font-bold text-center underline mb-2'>Your Response</h3>
      <p>{response}</p>
      </div>
      {reviewGood && reviewGood.length > 0 && (
        <div className='w-full'>
          <h3 className='font-bold text-center underline mb-2'>Good</h3>
          <ul className='list-disc pl-5 space-y-1'>
            {reviewGood.map(x => <li key={x}>{x}</li>)}
          </ul>
        </div>
      )}
      
      {reviewBad && reviewBad.length > 0 && (
        <div className='w-full mt-4'>
          <h3 className='font-bold text-center underline mb-2'>Bad</h3>
          <ul className='list-disc pl-5 space-y-1'>
            {reviewBad.map(x => <li key={x}>{x}</li>)}
          </ul>
        </div>
      )}
      </> :
      <Spinner/>
    }
    </div>
  </div>
</div>

  )

  }