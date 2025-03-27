import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import CodeResult from "./CodeResult";
import axios from "axios";
import axiosInstance from "@/app/utils/axiosInstance";
import Spinner from "./Spinner";

interface CodeEditorProps {
  codeDefault: string;
  languageDefault: string;
  interviewId: number;
}
interface CodeSubmissionResult {
  codeSubmissionId:number;
}

interface CodeRunResult {
  stdout: string | null;
  time: string;
  memory: number;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
}

export default function CodeEditor({
  codeDefault,
  languageDefault,
  interviewId
}: CodeEditorProps) {
  const [code, setCode] = useState(codeDefault);

  const languages = ["python", "javascript", "java"];
  const [selectedLanguage, setSelectedLanguage] = useState(languageDefault);
  const [codeRunResult, setCodeRunResult] = useState<CodeRunResult | null>(null);
  const [codeRunLoading,setCodeRunLoading] = useState(false);

  const handleEditorChange = (value: string | undefined, event: unknown) => {
    setCode(value ?? "");
  };

  useEffect(()=> {
    setCode(codeDefault.replace(/\\r\\n/g, '\n'))
  }, [codeDefault])

  const runCode = async() => {
    const body = {
        sourceCode:code,
        interviewId,
        stdin:"",
        languageName:selectedLanguage
    }

    setCodeRunLoading(true);

    const submissionResult = await axiosInstance.post<CodeSubmissionResult>("/CodeRunner/submitCode",body);
    
    // poll for result
    const interval = setInterval(async() => {

      const runResult = await axiosInstance.get<CodeRunResult>(`/CodeRunner/checkSubmission?codeSubmissionId=${submissionResult.data.codeSubmissionId}`);
      if(runResult) {
        setCodeRunLoading(false);
        setCodeRunResult(runResult.data);
        clearInterval(interval);
      }
      
    }, 1000);
    
    setTimeout(() => {
      clearInterval(interval);
      setCodeRunLoading(false);
    }, 5000); // stop after 5 seconds

  };
  return (
    <div className="h-full w-full">
      <div className="mb-5 flex gap-10 ">
        <Select
          value={selectedLanguage}
          onValueChange={(value: string) => {
            setSelectedLanguage(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {languages.map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        { !codeRunLoading ? (<Button
          onClick={(e) => {
            runCode();
          }}
        >
          Run Code
        </Button>) : (<Spinner></Spinner>) }
      </div>

      <Editor
        height="45vh"
        language={selectedLanguage}
        theme="vs-dark"
        onChange={handleEditorChange}
        value={code}
      />

      <CodeResult codeRunResult={codeRunResult}></CodeResult>
    </div>
  );
}
