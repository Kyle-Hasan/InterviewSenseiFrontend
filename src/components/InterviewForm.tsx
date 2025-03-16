"use client";
import { interview } from "@/app/types/interview";
import axiosInstance from "@/app/utils/axiosInstance";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Spinner from "@/components/Spinner";
import FileSelect from "./FileSelect";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useInterviewStore } from "@/app/hooks/useInterviews";
import { resume } from "@/app/types/resume";
import { Checkbox } from "./ui/checkbox";

interface interviewFormData {
  resume: File | null;
  resumeUrl: string | null;
  numberOfBehavioral: number;
  numberOfTechnical: number;
  jobDescription: string;
  name: string;
  secondsPerAnswer: number;
  additionalDescription: string;
  isLive:boolean;
}

interface interviewFormProps {
  initialData: interviewFormData;
  initialResumeUrl: string; // for old interviews
  initialResumeName: string; // for old interviews
  disabled: boolean;
  allResumes?: resume[];
}

export const InterviewForm = ({
  initialData,
  disabled,
  initialResumeName,
  initialResumeUrl,
  allResumes,
}: interviewFormProps) => {
  const [formData, setFormData] = useState<interviewFormData>(initialData);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [errors, setErrors] = useState("");
  const [resumes, setResumes] = useState<resume[] | undefined>(allResumes);
  //first resume should be selected by default since its the latest if it exists
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string>(allResumes && allResumes.length > 0 ? allResumes[0].url : "");
  // use this to differeniate between old and new resumes since theres only 1 uploaded resume allowed
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  


  const queryClient = useQueryClient();
  const { setInterview } = useInterviewStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrors("");

    if (!formData.isLive && (formData.numberOfBehavioral + formData.numberOfTechnical === 0)) {
      setErrors("Need more than 1 question");
      return;
    }

    if (formData.name.length === 0) {
      setErrors("Interview needs a name");
      return;
    }
    if (formData.secondsPerAnswer >= 300 || formData.secondsPerAnswer < 10) {
      setErrors("Seconds per answer must be between 10 and 300 ");
      return;
    }
    try {
      setLoading(true);

      // add form validation here

      const formBody = {
        ...formData,
       
      };
      // user wants to use uploaded resume
      if(uploadedFileUrl === selectedResumeUrl) {
        formBody.resume =  files && files.length > 0 ? files[0]: null
        formBody.resumeUrl = null;
      }
      // user wants to use old resume
      else if(selectedResumeUrl !== "") {
        formBody.resume = null;
        formBody.resumeUrl = selectedResumeUrl;
      }
      // no resume selected
      else {
        formBody.resume = null;
        formBody.resumeUrl = null;
      }
      
      const response = await axiosInstance.post(
        "/Interview/generateInterview",
        formBody,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const interview: interview = response.data;
      let questions = interview.questions;
      questions = questions.sort((a, b) => a.id - b.id);
      setInterview(interview);
      setLoading(false);

      debugger

      // an interview that is live has no questions to add
      if(!interview.isLive) {
      
      // set questions in the cache so we can  just load them from the cache when we navigate
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        queryClient.setQueryData(["questions", question.id], question);
        queryClient.setQueryData(["responses", question.id], []);
      }
      router.replace(
        `/interviews/${interview.id}/questions/${interview.questions[0].id}`
      );
    }

    else {  
      router.replace(
        `/liveInterview/${interview.id}`
      );

    }




    } catch (e) {
      setErrors("Errors : " + e);
    } finally {
      setLoading(false);
      setErrors("");
    }
  };

  const submitMutation = useMutation({
    mutationFn: handleSubmit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });

  return !loading ? (
    <div className="flex flex-col  items-center  mt-5">
      <h2 className="text-2xl font-bold text-center mb-5 w-full">
        {!disabled ? "Generate Interview Questions" : "Interview Information"}{" "}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-center space-y-4 xl:w-2/3 p-6 bg-white shadow rounded"
      >
        <p>Name </p>
        <Input
          placeholder="name"
          value={formData.name}
          className="w-1/4"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={disabled}
          required
        />
         <div className="flex items-center space-x-2">
      <Checkbox onCheckedChange={(checked)=> {setFormData({...formData,isLive:checked as boolean})}} checked={formData.isLive} id="live" />
      <label
        htmlFor="live"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Is this a live interview?
      </label>
    </div>
    {!formData.isLive &&  <>
        <p>Max seconds per answer</p>
        <Input
          placeholder="0"
          value={formData.secondsPerAnswer}
          className="w-1/4"
          type="number"
          max={20000}
          onChange={(e) =>
            setFormData({ ...formData, secondsPerAnswer: +e.target.value })
          }
          disabled={disabled}
          required
        />
        <p>Number of behavioral questions </p>
        <Select
          disabled={disabled}
          value={formData.numberOfBehavioral.toString()}
          onValueChange={(value) => {
            setFormData({ ...formData, numberOfBehavioral: +value });
          }}
        >
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
        <Select
          disabled={disabled}
          value={formData.numberOfTechnical.toString()}
          onValueChange={(value) => {
            setFormData({ ...formData, numberOfTechnical: +value });
          }}
        >
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
    
        </>}
        <p>Job Description </p>
        <Textarea
          disabled={disabled}
          value={formData.jobDescription}
          onChange={(e) => {
            setFormData({ ...formData, jobDescription: e.target.value });
          }}
        ></Textarea>
        <p>Additional Description </p>
        <Textarea
          disabled={disabled}
          value={formData.additionalDescription}
          onChange={(e) => {
            setFormData({ ...formData, additionalDescription: e.target.value });
          }}
        ></Textarea>
        <p>Resume</p>
        {resumes && (
          <FileSelect
            initialResumeName={initialResumeName}
            initialResumeUrl={initialResumeUrl}
            disabled={disabled}
            files={files}
            setFiles={setFiles}
            resumes={resumes}
            setResumes={setResumes}
            selectedResumeUrl={selectedResumeUrl}
            setSelectedResumeUrl={setSelectedResumeUrl}
            uploadedFileUrl={uploadedFileUrl}
            setUploadedFileUrl={setUploadedFileUrl}
          ></FileSelect>
        )}
        {errors && <p className="text-red-600 mt-1 mb-1">{errors}</p>}
        {!disabled && (
          <Button
            type="submit"
            className="mt-2"
            onClick={(e) => {
              submitMutation.mutate(e);
            }}
          >
            Submit
          </Button>
        )}
      </form>
    </div>
  ) : (
    <Spinner />
  );
};
