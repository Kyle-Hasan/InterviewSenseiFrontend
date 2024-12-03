'use client';

import { interview } from '@/app/types/interview';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Delete02Icon,PencilEdit02Icon} from "hugeicons-react";
import Spinner from './Spinner';
import axiosInstance from '@/app/utils/axiosInstance';
import { AlertDialogButton } from './AlertDialogButton';
import { Input } from './ui/input';
import { Button } from './ui/button';

export default function InterviewList({ initialInterviews }: { initialInterviews: interview[] }) {
  const [interviews, setInterviews] = useState(initialInterviews);
  const router = useRouter()
  const [loading,setLoading] = useState(false)
  const [editing,setEditing] = useState(false)
  const [editedValue,setEditedValue] = useState("")
  const [editingId,setEditingId] = useState(-1)

  const deleteItem = async (id: number) => {

    setLoading(true)
    await axiosInstance.delete("/Interview/"+id)
    const newInterviews = interviews.filter(x=> x.id !== id)
    setInterviews(newInterviews)
    setLoading(false)

  };

  const editItem = async (id: number, name:string) => {
    setEditing(true)
    setEditedValue(name)
    setEditingId(id)
   
  };

  const submitEdit = async()=> {
    setLoading(true)
    const editedInterview = interviews.find(x=> x.id === editingId)
    const body = {...editedInterview, name:editedValue}
    const updatedInterviewResponse = await axiosInstance.put("/Interview",body)
    setInterviews(interviews.map((x)=> {
      return x.id == editingId ? updatedInterviewResponse.data : x
    }))
    setEditing(false)
    setLoading(false)
  }

  const cancelEdit = ()=> {
    setEditing(false)
  }

  const editValueChange = (e) => {
    setEditedValue(e.target.value)
  }

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
          {editing && editingId === item.id ? <Input value={editedValue} onChange={editValueChange }></Input>    : <div className='text-center font-bold' onClick={()=> {navigateToInterview(item.id)}} >
            {item.name}
            </div> }
            <div className='mt-1 mb-1 text-center'>
              {item.createdDate}
            </div>
            <div className='flex space-x-2 justify-center items-center'>
            <AlertDialogButton dialogContent='This will permanently delete this interview. Are you sure?' onConfirm={(e)=> {deleteItem(item.id)}} buttonContent={<Delete02Icon></Delete02Icon>}></AlertDialogButton>
            
         {editing &&  editingId === item.id ? <div className='flex row space-x-2'> <Button onClick={submitEdit}>Submit</Button> <Button onClick={cancelEdit} >Cancel</Button> </div>   :   <button onClick={() => editItem(item.id,item.name)}>
              <PencilEdit02Icon></PencilEdit02Icon>
            </button>}
            </div>
          </li>
        ))}
      </ul>
      : <Spinner></Spinner>
    }
    </div>
  );
}