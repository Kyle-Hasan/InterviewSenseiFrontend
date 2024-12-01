
import InterviewList from '@/components/InterviewList';
import axiosInstance from '../utils/axiosInstance';
import { cookies } from 'next/headers';
import serverAxiosInstance from '../utils/serverAxiosInstance';


async function fetchInterviews() {
  try{
  
  const response = await serverAxiosInstance.get("/Interview/interviewList",
  )
  return response.data
  }
  catch(e) {
    console.error(e)
  }

}

export default async function viewInterviews() {
  const interviews = await fetchInterviews();


  return <InterviewList initialInterviews={interviews} />;
}
