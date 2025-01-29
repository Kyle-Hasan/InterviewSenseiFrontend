import { resume } from "@/app/types/resume";
import React, { useState } from "react";
import ResumeList from "./ResumeList";
import { set } from "lodash";
interface fileSelectProps {
  files: File[];
  setFiles: (newValue: File[]) => void;
  disabled: boolean; //disabled when showing old interivew
  initialResumeUrl: string; //for old interviews
  initialResumeName: string; //for old interviews
  resumes: resume[]; // list of users resumes
  setResumes: (newValue: resume[]) => void;
  selectedResumeUrl: string;
  setSelectedResumeUrl: (newValue: string) => void;
  uploadedFileUrl: string; // keep track of uploaded file url to differentiate between old and new resumes
  setUploadedFileUrl: (newValue: string) => void;
}
export default function FileSelect({
  files,
  setFiles,
  resumes,
  setResumes,
  disabled,
  initialResumeUrl,
  initialResumeName,
  selectedResumeUrl,
  setSelectedResumeUrl,
  uploadedFileUrl,
  setUploadedFileUrl,
}: fileSelectProps) {
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    setDragging(false);
    e.preventDefault();
    if (e.dataTransfer.files) {
      eventToFile(e.dataTransfer.files);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDragging(false);
    if (event.target.files) {
      eventToFile(event.target.files);
    }
  };

  const eventToFile = (fileList: FileList) => {
    const files = Array.from(fileList);
    const pdfFiles = files.filter((x) => x.type === "application/pdf");
    if (pdfFiles.length === 1) {
      setFiles(pdfFiles);
      const url = URL.createObjectURL(pdfFiles[0]);
      const newResume: resume = {
        fileName: pdfFiles[0].name,
        url: url,
        date: new Date().toISOString().split("T")[0],
      };
      setResumes([newResume, ...resumes]);
      setSelectedResumeUrl(url);
      setUploadedFileUrl(url);
    } else if (pdfFiles.length === 2) {
      setFiles([pdfFiles[0]]);
      setError("Only 1 file allowed");
    } else {
      setError("Only PDF files allowed");
    }
  };
  return (
    <div className="space-y-4 flex flex-col">
      {resumes.length > 0 && (
        <ResumeList
          selectedResumeUrl={selectedResumeUrl}
          setSelectedResumeUrl={setSelectedResumeUrl}
          resumes={resumes}
        />
      )}
      {!disabled && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDrag}
          className={`flex flex-col items-center space-x-2 px-4 py-5 transition border-black border-dotted border-2 p-3 hover:bg-gray-200 ${
            dragging ? "bg-gray-200" : "bg-gray-50"
          }`}
        >
          <p className="text-gray-500">Drag & drop PDF files here</p>
          <p className="text-sm text-gray-400">(or click to select files)</p>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
            className="w-full h-full cursor-pointer opacity-0"
          />
        </div>
      )}
      {error.length > 0 && <p className="text-red-600">{error}</p>}

      {files.length == 0 && initialResumeName && initialResumeUrl && (
        <a
          href={initialResumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-500"
        >
          {initialResumeName}
        </a>
      )}
    </div>
  );
}
