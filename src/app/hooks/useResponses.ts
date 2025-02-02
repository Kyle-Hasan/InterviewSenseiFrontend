import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

import { response } from '../types/response';

export const useResponses = (questionId: number, sendForReviewFn:Function, postUpdate:Function) => {
  const queryClient = useQueryClient();

  
  const { data: responses, isLoading, isError } = useQuery<response[]>(
   {queryKey: [ 'responses', questionId] ,
   queryFn: async () => {
      const { data } = await axiosInstance.get(`/Response/byQuestion?questionId=${questionId}`);
   
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
}
  );

  
  const addResponse = useMutation({
   mutationFn: async () => {
    const newResponse = await sendForReviewFn();
   
    return newResponse;
    },
      onSuccess: (newResponse:response) => {
        queryClient.setQueryData(['responses', questionId], (oldData:response[]) => {
         
          const updated = oldData ? [...oldData, newResponse] : [newResponse];
          return updated
        });
        postUpdate()
      },
        }
  );

  return { responses, isLoading, isError, addResponse };
};