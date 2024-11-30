'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axiosInstance from '../utils/axiosInstance'
import { interview } from '../types/interview'
import InterviewRecord from '@/components/InterviewRecord'
import { InterviewQuestions } from '@/components/interviewQuestions'
export default function viewInterview2() {
  const router = useRouter()
  const [interview,setInterview] = useState<interview>({name:"",questions:[],jobDescription:"",resumeLink:"",id:-1,}) 
  useEffect(()=> {

    const getData = async()=> {
      
   
      const response = await axiosInstance.get(`/Interview/+${7}`)
      const data:interview  = response.data
      setInterview(data)
      debugger
      
    }

    getData()

  }, [])
  return (
    <div className='flex items-center flex-col justify-center'>{interview.questions.length > 0 && <InterviewQuestions questions={interview.questions} ></InterviewQuestions>}</div>
  )
}
