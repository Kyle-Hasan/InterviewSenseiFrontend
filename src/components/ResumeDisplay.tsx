import React from "react";
import { Checkbox } from "./ui/checkbox";
import { resume } from "@/app/types/resume";
interface ResumeDisplayProps {
  resume:resume
  checked: boolean;
    onCheckedChange: (url:string,checked:boolean) => void;
}
export default function ResumeDisplay({
  resume,
  checked,
 onCheckedChange,
}: ResumeDisplayProps) {
  return (
    <div className="flex space-y-2 p-3 border-2 border-black rounded-sm  ">
      {" "}
      <Checkbox
        className="mr-2"
        checked={checked}
        onCheckedChange={(checkedArg)=> onCheckedChange(resume.url,checkedArg ? true : false)}
        />
      <a
        href={resume.url}
        target="_blank"
        
        rel="noopener noreferrer"
        className="underline text-blue-500 mr-2"
      >
        {resume.fileName}
      </a>
        <p className="text-gray-500">{resume.date}</p>
    </div>
  );
}
