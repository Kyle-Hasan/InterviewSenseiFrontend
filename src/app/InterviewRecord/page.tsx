'use client'
import VideoRecord from '@/components/VideoRecord'
import React, { useState } from 'react'
import { ratingResponse } from '../types/ratingResponse'

import axiosInstance from '../utils/axiosInstance'

export default function InterviewRecord() {

  const [blob,setBlob] = useState<Blob>()
  const [reviewGood,setReviewGood] = useState<string[]>([])
  const [reviewBad,setReviewBad] = useState<string[]>([])
  const [recording,setRecording] = useState(false)
  const [question,setQuestion] = useState("How do you prioritize tasks when working on multiple projects with tight deadlines?")
  const [loadingResponse,setLoadingResponse] = useState(false)


  
  const sendForReview = async()=> {

    

    if(blob) {
      setLoadingResponse(true)

      const formData = new FormData();
      formData.append("video",blob,"video.webm")
      formData.append("question", "How do you prioritize tasks when working on multiple projects with tight deadlines?" )

    const response = await axiosInstance.post("/Interview/rateAnswer",formData,{
      headers: {
        'Content-Type':'multipart/form-data'
      }
    });
    setLoadingResponse(false)
    const data:ratingResponse = response.data

    const goodArr = data.good.split("..")
    goodArr.pop()
   
    const badArr = data.bad.split('...')
    badArr.pop()
   
    setReviewGood(goodArr)
    setReviewBad(badArr)

    }
  }
  return (
    <div className='flex flex-col h-screen space-y-10 mt-2'>
  <h2 className='text-2xl font-bold text-center mb-5 w-full'>Record Interview</h2>
  <h2 className='font-bold text-center mb-5 w-full'>Question: {question}</h2>
  
  <div className='flex justify-center items-start space-x-10 w-full h-2/3 xl:h-[80%] lg:h-[78%]'>
    {/* Record Section */}
    <div className='flex flex-col items-center border-2 border-black p-5 xl:w-2/5 w-1/3  h-full'>
      <h2 className='text-xl font-bold mb-4'>Record</h2>
      <VideoRecord responseLoading={loadingResponse} setBlob={setBlob} setRecording={setRecording} recording={recording} sendForReview={sendForReview} />
      
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
      <div className="flex justify-center items-center h-screen">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    }
    </div>
  </div>
</div>

  )

}