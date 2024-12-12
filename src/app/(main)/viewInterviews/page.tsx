
import InterviewList from '@/components/InterviewList';
import serverAxiosInstance from '../../utils/serverAxiosInstance';
import { PaginationParams } from '@/app/types/PaginationParams';

const initialPageSize = 10
async function fetchInterviews() {
  try{
  
  const response = await serverAxiosInstance.get("/Interview/interviewList",{
    params: {
      startIndex:0,
      pageSize:initialPageSize,
      
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
  const initialPageSize = 10
  const interviewsObj = await fetchInterviews();


  return <InterviewList initialInterviews={interviewsObj?.interviews} initialLoaded={initialPageSize} totalInterviewsProp={interviewsObj?.total ? interviewsObj.total : 0} />;
}
