'use client'
import { interview } from '@/app/types/interview'
import axiosInstance from '@/app/utils/axiosInstance'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Input } from './ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import Spinner from '@/components/Spinner'
import FileSelect from './FileSelect'
import { Button } from './ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setServers } from 'dns'
import { useInterviewStore } from '@/app/hooks/useInterviews'

interface interviewFormData {
    resume:File | null,
    numberOfBehavioral:number,
    numberOfTechnical:number,
    jobDescription:string,
    name:string
}

interface interviewFormProps {
    initialData:interviewFormData,
    disabled:boolean
}

export const InterviewForm = ({initialData,disabled}:interviewFormProps) => {
    const [formData,setFormData] = useState<interviewFormData>(initialData)
    const [files,setFiles] = useState<File[]>([])
    const [loading,setLoading] = useState(false)
    const router = useRouter()
    const [errors,setErrors] = useState("")

    const queryClient = useQueryClient()
    const {setInterview} = useInterviewStore()

    

    const handleSubmit = async()=> {


      setErrors("")

      if(formData.numberOfBehavioral + formData.numberOfTechnical === 0 ) {
        setErrors("Need more than 1 question")
        return
      }
      try {
        setLoading(true)
        // add form validation here
        const formBody = {...formData,resume: files && files.length > 0 ? files[0]: null}
        const response = await axiosInstance.post("/Interview/generateInterview",formBody,{
            headers: {
              'Content-Type':'multipart/form-data'
            }
          });
         
        const data:interview = response.data
        setInterview(data)
        setLoading(false)
        router.push("/interviewQuestions/"+data.id)
      }
      catch(e) {
        setErrors("Errors : " + e)
      }
      finally {
        setLoading(false)
        setErrors("")
      }
        
    }

    const submitMutation = useMutation({
      mutationFn: handleSubmit,
      onSuccess: ()=> {queryClient.invalidateQueries()}
    })

  return ( !loading ? <div className="flex flex-col items-center h-screen mt-5">
         <h2 className='text-2xl font-bold text-center mb-5 w-full'>{ !disabled ? "Generate Interview Questions" : "Interview Information"} </h2>
         <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center space-y-4 xl:w-2/3 p-6 bg-white shadow rounded">
         <p>Name </p>
         <Input
          placeholder="name"
          value={formData.name}
          className='w-1/4'
          onChange={(e) => setFormData({...formData,name:e.target.value})}
          disabled={disabled}
          required
        />
        <p>Number of behavioral questions </p>
         <Select disabled={disabled} value={formData.numberOfBehavioral.toString()} onValueChange={(value)=> {setFormData({...formData,numberOfBehavioral:+value})}}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder=" Select the number of behavioral questions " />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Number of behavioral questions</SelectLabel>
          <SelectItem value="0">0</SelectItem>
          <SelectItem value="1">1</SelectItem>
          <SelectItem value="2">2</SelectItem>
          <SelectItem value="3">3</SelectItem>
          <SelectItem value="4">4</SelectItem>
          <SelectItem value="5">5</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    <p>Number of technical questions </p>
         <Select disabled={disabled} value={formData.numberOfTechnical.toString()} onValueChange={(value)=> {setFormData({...formData,numberOfTechnical:+value})}}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder=" Select the number of technical questions " />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Number of technical questions</SelectLabel>
          <SelectItem value="0">0</SelectItem>
          <SelectItem value="1">1</SelectItem>
          <SelectItem value="2">2</SelectItem>
          <SelectItem value="3">3</SelectItem>
          <SelectItem value="4">4</SelectItem>
          <SelectItem value="5">5</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    <p>Job Description </p>
    <Textarea disabled={disabled} onChange={(e)=> {setFormData({...formData,jobDescription:e.target.value})}}></Textarea>
    <p>Resume</p>
    <FileSelect disabled={disabled} files={files} setFiles={setFiles}></FileSelect>

    {!disabled && <Button type='submit' className='mt-2' onClick={()=> {submitMutation.mutate()} }>Submit</Button>}
         </form>
         {errors && <p className="text-red-600 mt-1 mb-1">{errors}</p>}
    </div> : <Spinner/>
  )
}
