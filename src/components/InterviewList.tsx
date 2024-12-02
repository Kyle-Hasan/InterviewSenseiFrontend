'use client';

import { interview } from '@/app/types/interview';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Delete02Icon,PencilEdit02Icon} from "hugeicons-react";
import Spinner from './Spinner';
import axiosInstance from '@/app/utils/axiosInstance';

export default function InterviewList({ initialInterviews }: { initialInterviews: interview[] }) {
  const [interviews, setInterviews] = useState(initialInterviews);
  const router = useRouter()
  const [loading,setLoading] = useState(false)

  const deleteItem = async (id: number) => {

    setLoading(true)
    await axiosInstance.delete("/Interview/"+id)
    const newInterviews = interviews.filter(x=> x.id !== id)
    setInterviews(newInterviews)
    setLoading(false)

  };

  const editItem = async (id: number, newName: string) => {
   
  };

  const navigateToInterview = (id:number)=> {
    router.push("/viewInterview/"+id)
  }

  return (
    <div className="flex items-center justify-center h-100 flex-col mt-4">
      <h1 className="text-4xl font-bold mb-3">Interviews</h1>
      { !loading ? 
      <ul className='space-y-4 w-96'>
        {interviews.map((item) => (
          <li key={item.id} className='border-black border-2 p-3 mt-1 flex flex-col space-y-2 w-96 hover:cursor-pointer'>
            <div className='text-center font-bold' onClick={()=> {navigateToInterview(item.id)}} >
            {item.name}
            </div>
            <div className='mt-1 mb-1'>
              {item.createdDate}
            </div>
            <div className='flex space-x-2 justify-center items-center'>
            <button onClick={() => deleteItem(item.id)}><Delete02Icon></Delete02Icon></button>
            <button onClick={() => editItem(item.id, prompt('Enter new name:') || item.name)}>
              <PencilEdit02Icon></PencilEdit02Icon>
            </button>
            </div>
          </li>
        ))}
      </ul>
      : <Spinner></Spinner>
    }
    </div>
  );
}