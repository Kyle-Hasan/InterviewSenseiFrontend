'use client'
import FileSelect from '@/components/FileSelect'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import React, { useState } from 'react'
import axiosInstance from '../utils/axiosInstance'
import Spinner from '@/components/Spinner'
import { Input } from '@/components/ui/input'
import { useRouter } from "next/navigation";
import { interview } from '../types/interview'
interface interviewFormData {
    resume:File | null,
    numberOfBehavioral:number,
    numberOfTechnical:number,
    jobDescription:string,
    name:""
}

export default function generateInterviewForms() {
    
    const [formData,setFormData] = useState<interviewFormData>( {name:"",resume:null,numberOfBehavioral:0,numberOfTechnical:0,jobDescription:''})
    const [files,setFiles] = useState<File[]>([])
    const [loading,setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async()=> {
        setLoading(true)
        // add form validation here
        const formBody = {...formData,resume: files && files.length > 0 ? files[0]: null}
        const response = await axiosInstance.post("/Interview/generateInterview",formBody,{
            headers: {
              'Content-Type':'multipart/form-data'
            }
          });
          debugger
        const data:interview = response.data
        setLoading(false)
        router.push("/viewInterview/"+data.id)
        
    }

  return ( !loading ? <div className="flex flex-col items-center h-screen mt-5">
         <h2 className='text-2xl font-bold text-center mb-5 w-full'>Generate Interview Questions</h2>
         <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center space-y-4 xl:w-2/3 p-6 bg-white shadow rounded">
         <p>Name </p>
         <Input
          placeholder="name"
          value={formData.name}
          className='w-1/4'
          onChange={(e) => setFormData({...formData,name:e.target.value})}
          required
        />
        <p>Number of behavioral questions </p>
         <Select value={formData.numberOfBehavioral.toString()} onValueChange={(value)=> {setFormData({...formData,numberOfBehavioral:+value})}}>
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
         <Select value={formData.numberOfTechnical.toString()} onValueChange={(value)=> {setFormData({...formData,numberOfTechnical:+value})}}>
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
    <Textarea onChange={(e)=> {setFormData({...formData,jobDescription:e.target.value})}}></Textarea>
    <p>Resume</p>
    <FileSelect files={files} setFiles={setFiles}></FileSelect>
    <Button type='submit' className='mt-2' onClick={handleSubmit}>Submit</Button>
         </form>
    </div> : <Spinner/>
  )
}
