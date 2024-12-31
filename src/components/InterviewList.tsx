/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { interview } from '@/app/types/interview';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Delete02Icon,PencilEdit02Icon} from "hugeicons-react";
import Spinner from './Spinner';
import axiosInstance from '@/app/utils/axiosInstance';
import { AlertDialogButton } from './AlertDialogButton';
import { Input } from './ui/input';
import { Button } from './ui/button';
import debounce from "lodash/debounce";
import { ArrowUp02Icon } from 'hugeicons-react';
import { ArrowDown02Icon } from 'hugeicons-react';

import { PaginationParams } from '@/app/types/PaginationParams';
import VirtualScroller from './VirtualScroller';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import SignalRContext from '@/app/contexts/SignalRContext';



export default function InterviewList({ initialInterviews,totalInterviewsProp,initialLoaded}: { initialInterviews: interview[], totalInterviewsProp:number, initialLoaded:number }) {
  const [interviews, setInterviews] = useState([...initialInterviews]);
  const signalRContext = useContext(SignalRContext)
 
  const router = useRouter()
  const [loading,setLoading] = useState(false)
  const [editing,setEditing] = useState(false)
  const [editedValue,setEditedValue] = useState("")
  const [editingId,setEditingId] = useState(-1)
  const [index,setIndex] = useState(initialLoaded ? initialLoaded : 10)
  const pageSize = 10

  const [searchText,setSearchText] = useState("")
  const [nameSort, setNameSort] = useState("")
  const [dateSort,setDateSort] = useState("")
  const [totalInterviews,setTotalInterviews]= useState(totalInterviewsProp)
  const [listLoading,setListLoading] = useState(false)

  const queryClient = useQueryClient()

  const updateDebouncedValue = useCallback(
    debounce((newValue:string) => {
      handleSearch(dateSort,nameSort,newValue)
      setSearchText(newValue)
    }, 500),
    []
  );


  


  const getMoreInterviews = async ()=> {

    try {
    setListLoading(true)
  
    const result = await queryClient.fetchQuery( {
      queryKey: ['interviews', searchText, dateSort, nameSort,index,pageSize],
       queryFn: () => search(dateSort, nameSort, searchText,index),
       staleTime: 1000 * 60 * 5,
     }
     );
   
  
    setIndex(index+pageSize)

    const newInterviews = [...interviews,...result]
    
    setInterviews(newInterviews)
    setListLoading(false)
  }
  catch(e) {
    console.log(e)
  }

  finally {
    setListLoading(false)
  }

  }

  useEffect(()=> {
    const connect = async()=> {
     await signalRContext?.createConnection("/hubs/interview","interview")
    }
    connect()
    return ()=> { 
      
      signalRContext?.disconnectConnection("interview")
    
    }
  } , [])


  const search = async(dateSort:string,nameSort:string,searchText:string,startIndex:number)=> {
    
  

    const response = await axiosInstance.get("/Interview/interviewList",{
      params: {
        startIndex:startIndex,
        pageSize:pageSize,
        ...(nameSort && nameSort.length && {nameSort} ),
        ...(dateSort && dateSort.length && {dateSort} ),
        ...(searchText && searchText.length && {name:searchText} )
      }
    }
    )

   
    const paginationParams:PaginationParams = JSON.parse(response.headers["pagination"])
    setTotalInterviews(paginationParams.total)
  
    return response.data
   
  }

  const handleSearch = async(dateSort:string,nameSort:string,searchText:string) => {
    setLoading(true)
    try {
      

      const result = await queryClient.fetchQuery( {
       queryKey: ['interviews', searchText, dateSort, nameSort,0,pageSize],
        queryFn: () => search(dateSort, nameSort, searchText,0),
        staleTime: 1000 * 60 * 5,
      }
      );

    const newInterviews = [...result]
    setIndex(0)
    setInterviews(newInterviews)

    }
    catch(e) {
      console.log(e)
    }
    finally {
      setLoading(false)
    }

  }


  const filterChangeDate = async ()=> {
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
    handleSearch(sendVar,"",searchText)
    

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
    handleSearch("",sendVar,searchText)

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

  const editValueChange = (e:any) => {
    setEditedValue(e.target.value)
  }

  const navigateToInterview = (id:number)=> {
    router.push("/viewInterview/"+id)
  }

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: ()=> {queryClient.invalidateQueries({queryKey:["interviews"]})}
  })

  const editMutation = useMutation({
    mutationFn: submitEdit,
    onSuccess: ()=> {queryClient.invalidateQueries({queryKey:["interviews"]})}
  })
  const renderInterview = (item:interview)=> {

   
     return (<li key={item.id} className='border-black border-2 p-3 mt-1 flex flex-col space-y-2 w-96 hover:cursor-pointer'>
      {editing && editingId === item.id ? <Input value={editedValue} onChange={editValueChange }></Input>    : <div className='text-center font-bold' onClick={()=> {navigateToInterview(item.id)}} >
        {item.name}
        </div> }
        <div className='my-1 mx-1 text-center'>
          {item.createdDate}
        </div>
        <div className='flex space-x-2 justify-center items-center'>
        <AlertDialogButton dialogContent='This will permanently delete this interview. Are you sure?' onConfirm={(e)=> {deleteMutation.mutate(item.id)}} buttonContent={<Delete02Icon></Delete02Icon>}></AlertDialogButton>
        
     {editing &&  editingId === item.id ? <div className='flex row space-x-2'> <Button onClick={()=> {editMutation.mutate()}}>Submit</Button> <Button onClick={cancelEdit} >Cancel</Button> </div>   :   <button onClick={() => editItem(item.id,item.name)}>
          <PencilEdit02Icon></PencilEdit02Icon>
        </button>}
        </div>
      </li>)
    

  }
  const textSearchChange = (e:any)=> {
    const newValue = e.target.value;
    setSearchText(newValue)
    updateDebouncedValue(newValue)
  }

  return (
    <div className="flex items-center justify-center h-full flex-col mt-4 mb-12 ">
      <h1 className="text-4xl font-bold mb-3 mt-5">Interviews</h1>
      <div></div>
      { !loading ? 
        <div className='h-full'>
         <div className='flex flex-row items-center justify-center space-x-4'>
          <Button onClick={()=> filterChangeDate()}>Sort by date {dateSort === "ASC" ? <ArrowDown02Icon color='white'/> : dateSort === "DESC" && <ArrowUp02Icon color='white'/>  } </Button>
          <Button onClick={()=> filterChangeName()}>Sort by name {nameSort === "ASC" ? <ArrowDown02Icon color='white'/> : nameSort === "DESC" && <ArrowUp02Icon color='white'/>  } </Button>
          <Input placeholder='Search by name' onChange={textSearchChange} value={searchText}></Input>
          </div>
          <div className='h-full mb-4'>
        
    
          <div
          className='h-full overflow-auto'
          >
            <VirtualScroller listLoading={listLoading} totalItems={totalInterviews} numberRendered={interviews.length} refreshFunction={getMoreInterviews}>
              {interviews.map(renderInterview)}
            </VirtualScroller>

          </div>
        
         

        </div>
        </div>
      : <Spinner></Spinner>
    }
  
    </div>
    
  );
}