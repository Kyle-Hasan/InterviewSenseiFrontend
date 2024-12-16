'use client';

import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import { InterviewQuestions } from '@/components/interviewQuestions';
import { useEffect, useState } from 'react';
import { useInterviewStore } from '@/app/hooks/useInterviews';
import { interview } from '@/app/types/interview';
import Spinner from '@/components/Spinner';



export default  function InterviewPage() {
  const obj=  useParams<{ id:string }>();

 
  const [loading,setLoading] = useState(false)
  const [interview,setInterview] = useState<interview | null>(null)
  const storedValue = useInterviewStore()
  const queryClient = useQueryClient()

  const fetchInterview = async (id: string) => {
    
    
    const response = await axiosInstance.get(`/Interview/${id}`);
    setLoading(false)
    return response.data;
    
   
  };



  useEffect(()=> {
    let mounted = true
   const getData =  async()=> {
  
     
      setLoading(true)
      try{
      if(storedValue.interview) {
        setInterview(storedValue.interview)
      
      }
      else {
        const response = await queryClient.fetchQuery( {
          queryKey: ['interview',obj?.id],
           queryFn: () => fetchInterview(obj && obj.id ? obj.id : "-1"),
           staleTime: 1000 * 60 * 5,
         }
         );
        if( mounted) {
          setInterview(response)
        }
      }
  
    }
  
  catch(e) {
    console.error(e)
  }
  finally {
    setLoading(false)
  }
    
      
  }
  getData()
  return ()=> {mounted = false}
  },[])





  

  

  return (
    <div>
      { interview && !loading ? <InterviewQuestions secondsPerAnswer={interview.secondsPerAnswer} questionsProp={interview.questions}/> : <Spinner></Spinner>  }
    </div>
  );
}