'use client';

import { interview } from '@/app/types/interview';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Delete02Icon,PencilEdit02Icon} from "hugeicons-react";
import Spinner from './Spinner';
import axiosInstance from '@/app/utils/axiosInstance';
import { AlertDialogButton } from './AlertDialogButton';
import { Input } from './ui/input';
import { Button } from './ui/button';
import debounce from "lodash/debounce";
import { ArrowUp01Icon } from 'hugeicons-react';
import { ArrowDown02Icon } from 'hugeicons-react';
import InfiniteScroll from 'react-infinite-scroller';
export default function InterviewList({ initialInterviews }: { initialInterviews: interview[] }) {
  const [interviews, setInterviews] = useState([...initialInterviews]);
  const router = useRouter()
  const [loading,setLoading] = useState(false)
  const [editing,setEditing] = useState(false)
  const [editedValue,setEditedValue] = useState("")
  const [editingId,setEditingId] = useState(-1)
  const [index,setIndex] = useState(0)
  const pageSize = 10

  const [searchText,setSearchText] = useState("")
  const [nameSort, setNameSort] = useState("")
  const [dateSort,setDateSort] = useState("")




  const updateDebouncedValue = useCallback(
    debounce((newValue:string) => {
      search(dateSort,nameSort,newValue)
      setSearchText(newValue)
    }, 500),
    []
  );


  const getMoreInterviews = async ()=> {
    debugger
    const response = await axiosInstance.get("/Interview/interviewList",{
      params: {
        startIndex:index+pageSize,
        pageSize:pageSize,
        ...(nameSort && nameSort.length && {nameSort} ),
        ...(dateSort && dateSort.length && {dateSort} ),
        ...(searchText && searchText.length && {name:searchText} )
      }
    }
    )
    setIndex(index+1)

    const newInterviews = [...interviews,...response.data]
    setInterviews(newInterviews)

  }


  const search = async(dateSort:string,nameSort:string,searchText:string)=> {
    
    setLoading(true)

    const response = await axiosInstance.get("/Interview/interviewList",{
      params: {
        startIndex:0,
        pageSize:pageSize,
        ...(nameSort && nameSort.length && {nameSort} ),
        ...(dateSort && dateSort.length && {dateSort} ),
        ...(searchText && searchText.length && {name:searchText} )
      }
    }
    )

    setLoading(false)
  
    const newInterviews = [...response.data]
    setIndex(0)
    setInterviews(newInterviews)
   
  }


  const filterChangeDate = ()=> {
    let sendVar = ""
    if(dateSort === "ASC") {
      setDateSort("DESC")
      sendVar = "DESC"
    }
    else if(dateSort === "DESC") {
      setDateSort("ASC")
      sendVar = "ASC"
    }
    else if(dateSort === "") {
      setDateSort("ASC")
      sendVar = "ASC"

    }
    setNameSort("")
    search(sendVar,"",searchText)

  }

  const filterChangeName= ()=> {
    let sendVar = ""
    if(nameSort === "ASC") {
      setNameSort("DESC")
      sendVar = "DESC"
    }
    else if(nameSort === "DESC") {
      setNameSort("ASC")
      sendVar = "ASC"
    }
    else if(nameSort === "") {
      setNameSort("ASC")
      sendVar = "ASC"

    }
    setDateSort("")
    search("",sendVar,searchText)

  }


  

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

  const renderInterview = (item:interview)=> {

   
     return (<li key={item.id} className='border-black border-2 p-3 mt-1 flex flex-col space-y-2 w-96 hover:cursor-pointer'>
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
      </li>)
    

  }
  const textSearchChange = (e)=> {
    const newValue = e.target.value;
    setSearchText(newValue)
    updateDebouncedValue(newValue)
  }

  return (
    <div className="flex items-center justify-center h-100 flex-col mt-4">
      <h1 className="text-4xl font-bold mb-3">Interviews</h1>
      <div></div>
      { !loading ? 
        <div>
         <div className='flex flex-row items-center justify-center space-x-4'>
          <Button onClick={()=> filterChangeDate()}>Sort by date {dateSort === "ASC" ? <ArrowDown02Icon color='white'/> : dateSort === "DESC" && <ArrowUp01Icon color='white'/>  } </Button>
          <Button onClick={()=> filterChangeName()}>Sort by name {nameSort === "ASC" ? <ArrowDown02Icon color='white'/> : nameSort === "DESC" && <ArrowUp01Icon color='white'/>  } </Button>
          <Input placeholder='Search by name' onChange={textSearchChange}></Input>
          </div>
          <div className='h-auto overflow-auto'>
        
    
          <ul className='space-y-4 w-96'>
          {interviews.map(renderInterview)}
          </ul>
        
         

        </div>
        </div>
      : <Spinner></Spinner>
    }
  
    </div>
    
  );
}