'use client'
import VideoRecord from '@/components/VideoRecord'
import React, { useEffect, useState } from 'react'
import { ratingResponse } from '../app/types/ratingResponse'

import axiosInstance from '../app/utils/axiosInstance'
import Spinner from '@/components/Spinner'
import { question } from '@/app/types/interview'

interface InterviewRecordProps {
  question:question
}

export default function InterviewRecord({question}:InterviewRecordProps) {

  const [blob,setBlob] = useState<Blob>()
  const [reviewGood,setReviewGood] = useState<string[]>([])
  const [reviewBad,setReviewBad] = useState<string[]>([])
  const [recording,setRecording] = useState(false)
  const [loadingResponse,setLoadingResponse] = useState(false)

  useEffect((
    ()=> {
      setBlob(undefined)
      setRecording(false)
      setLoadingResponse(false)
    }
  ), [question])

  const convertToGoodAndBad = (feedback:string)=> {
    const feedbackArray = feedback.split('@u5W$')
    const goodArr = feedbackArray[1].split("...")
    const badArr = feedbackArray[2].split("...")
    setReviewGood(goodArr)
    setReviewBad(badArr)
  }
  
  const sendForReview = async()=> {

    

    if(blob) {
      setLoadingResponse(true)

      const formData = new FormData();
      formData.append("video",blob,"video.webm")
      formData.append("question", question.body )
      formData.append("id",question.id.toString())

    const response = await axiosInstance.post("/Interview/rateAnswer",formData,{
      headers: {
        'Content-Type':'multipart/form-data'
      }
    });
    setLoadingResponse(false)
    const data:question = response.data
    convertToGoodAndBad(data.feedback)



    }
  }
  return (
    <div className='flex items-center flex-col justify-center h-screen w-full'>
  <h2 className='text-2xl font-bold text-center mb-5 w-full'>Record Interview</h2>
  <h2 className='font-bold text-center mb-5 w-full whitespace-normal break-words'>Question: {question.body}</h2>
  
  <div className='flex justify-center items-start space-x-10 w-full h-2/3 xl:h-[80%] lg:h-[78%]'>
    {/* Record Section */}
    <div className='flex flex-col items-center border-2 border-black p-5 xl:w-2/5 w-1/3  h-full'>
      <h2 className='text-xl font-bold mb-4'>Record</h2>
      <VideoRecord videoLink={question.videoLink} responseLoading={loadingResponse} setBlob={setBlob} setRecording={setRecording} recording={recording} sendForReview={sendForReview} />
      
    </div>
    
    {/* Review Section */}
    <div className='flex flex-col items-center border-2 border-black p-5 xl:w-2/5 w-1/3 h-full overflow-scroll'>
      <h2 className='text-xl font-bold mb-4'>Review</h2>
      { !loadingResponse ? 
      
      <>
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