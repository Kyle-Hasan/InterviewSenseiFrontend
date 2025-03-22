import React, { useState } from 'react'
import Editor from '@monaco-editor/react';
import { Select } from '@radix-ui/react-select';
import { SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import CodeResult from './CodeResult';


interface CodeEditorProps { 
    codeDefault:string;
    languageDefault:string;
}
export default function CodeEditor({codeDefault,languageDefault}:CodeEditorProps) {

  const [code,setCode] = useState(codeDefault);

  const languages = ['python','javascript','java'];
  const [selectedLanguage,setSelectedLanguage] = useState(languageDefault);

  const handleEditorChange = (value:string | undefined,event:any)=> {
    setCode(value ?? "");
  }

  const runCode = ()=> {

  };
  return (
    <div className='h-full w-full'>
        <div className='mb-5 flex gap-10 '>
      <Select
         
          value={selectedLanguage}
          onValueChange={(value:string) => {
            setSelectedLanguage(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              
              {
                languages.map((x)=> <SelectItem key={x} value={x}>{x}</SelectItem>)
              }
           
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button onClick={(e)=> {runCode()} }>Run Code</Button>

        
        </div>
        
  <Editor
    height="53vh"
    language={selectedLanguage}
    theme="vs-dark"
    
    onChange={handleEditorChange}
    value={code}
  />

  <CodeResult output='' error=''>

  </CodeResult>

  </div>
  )
  
}
