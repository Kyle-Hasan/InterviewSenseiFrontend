import { interviewFeedback } from '@/app/types/interviewFeedback';
import axiosInstance from '@/app/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';

export default function ViewFeedback() {
  const router = useRouter();
  const { interviewId } = router.query;
  // should be in the cache if it redirects from the live interview record, otherwise grab from endpoint
  const {
    data: question,
    isLoading,
    isError,
  } = useQuery<interviewFeedback>({
    queryKey: ["interviewFeedback", interviewId ? +interviewId : -1],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/Feedback/feedbackByInterviewId/${interviewId}`);
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  return <div>Interview ID: {interviewId}</div>;
}
