
import InterviewList from '@/components/InterviewList';
import serverAxiosInstance from '../../utils/serverAxiosInstance';
import { PaginationParams } from '@/app/types/PaginationParams';


async function fetchInterviews() {
  try{
  
  const response = await serverAxiosInstance.get("/Interview/interviewList",{
    params: {
      startIndex:0,
      pageSize:10,
      
    }
  }
  )
  const paginationParams:PaginationParams = JSON.parse(response.headers["pagination"])
  const total = paginationParams.total
  return {total,interviews:response.data}
  }
  catch(e) {
    console.error(e)
  }

}

export default async function viewInterviews() {
  const interviewsObj = await fetchInterviews();


  return <InterviewList initialInterviews={interviewsObj?.interviews} totalInterviewsProp={interviewsObj?.total ? interviewsObj.total : 0} />;
}
