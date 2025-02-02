
import InterviewList from '@/components/InterviewList';
import serverAxiosInstance from '../../utils/serverAxiosInstance';
import { PaginationParams } from '@/app/types/PaginationParams';
export const dynamic = 'force-dynamic';
const initialPageSize = 10


export default async function viewInterviews() {
  



  return <InterviewList  />;
}
