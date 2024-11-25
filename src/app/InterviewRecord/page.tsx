'use client'
import VideoRecord from '@/components/VideoRecord'
import React, { useState } from 'react'
import { ratingResponse } from '../types/ratingResponse'
import { Button } from '@/components/ui/button'
import axiosInstance from '../utils/axiosInstance'

export default function InterviewRecord() {

  const [blob,setBlob] = useState<Blob>()
  const [reviewGood,setReviewGood] = useState<string[]>([])
  const [reviewBad,setReviewBad] = useState<string[]>([])
  const [recording,setRecording] = useState(false)
  const [question,setQuestion] = useState("How do you prioritize tasks when working on multiple projects with tight deadlines?")


  
  const sendForReview = async()=> {

    

    if(blob) {

      const formData = new FormData();
      formData.append("video",blob,"video.webm")
      formData.append("question", "How do you prioritize tasks when working on multiple projects with tight deadlines?" )

    const response = await axiosInstance.post("/Interview/rateAnswer",formData,{
      headers: {
        'Content-Type':'multipart/form-data'
      }
    });
    const data:ratingResponse = response.data

    const goodArr = data.good.split(".")
    goodArr.pop()
   
    const badArr = data.bad.split('.')
    badArr.pop()
   
    setReviewGood(goodArr)
    setReviewBad(badArr)

    }
  }
  return (
    <div className='flex items-center justify-center h-100 flex-col'>
    
        <h2 className='text-2xl font-bold text-center mb-5 w-screen'>Record Interview</h2>
        <h2 className='font-bold text-center mb-5 w-screen mb-1'>{question}</h2>
        <VideoRecord setBlob={setBlob} setRecording={setRecording} recording={recording} />

        { !recording && <Button className='mt-2' onClick={sendForReview}>Send for review</Button> }
      <h2 className='text-2xl font-bold'>Review</h2>
      { reviewGood && reviewGood.length > 0 && 
      <div className='space-y-4 flex flex-col  text-align-left w-1/2'>
        <h2 className='font-bold mb-1 text-center underline'>Good</h2>
        <ul className='list-disc'>
        {
          reviewGood.map(x=> {
            return <li key={x}>{x}</li>
          })
        }
        </ul> </div>}
        { reviewBad && reviewBad.length > 0 && 
        <div className='flex flex-col  text-align-left w-1/2'> 
        <h2 className='font-bold mb-1 text-center underline'>Bad</h2>
          <ul className='list-disc'>
        {
          reviewBad.map(x=> {
            return <li key={x}>{x}</li>
          })
        }
        </ul> </div> }
      
    </div>
  )

}