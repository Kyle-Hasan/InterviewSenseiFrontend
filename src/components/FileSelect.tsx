import React, { useState } from 'react'
interface fileSelectProps {
    files:File[],
    setFiles:(newValue:File[])=> void
    disabled:boolean
}
export default function FileSelect({files,setFiles,disabled}:fileSelectProps) {

    
    const [error,setError] = useState("")
    const [dragging,setDragging] = useState(false)

    const handleDrop = (e: React.DragEvent<HTMLElement>)=> {
        setDragging(false)
        e.preventDefault()
        if(e.dataTransfer.files) {
            eventToFile(e.dataTransfer.files)
        }

    }


    const handleDrag = (e: React.DragEvent<HTMLElement>)=> {
        e.preventDefault()
        setDragging(true)
    }


  
   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>)=> {
        setDragging(false)
        if(event.target.files) {
            eventToFile(event.target.files)
        }

   }

   const eventToFile = (fileList:FileList)=> {
    const files = Array.from(fileList)
            const pdfFiles = files.filter(x=> x.type=== 'application/pdf')
            if(pdfFiles.length === 1) {
                setFiles(pdfFiles)
            }
            else if(pdfFiles.length === 2) {
                setFiles([pdfFiles[0]])
                setError("Only 1 file allowed")
            }
            else {
                setError("Only PDF files allowed")
            }

   }
  return (
    
    <div className='space-y-4 flex flex-col'>
    {!disabled && 
    <div onDrop={handleDrop} onDragOver={handleDrag} className={`flex flex-col items-center space-x-2 px-4 py-5 transition border-black border-dotted border-2 p-3 hover:bg-gray-200 ${dragging  ? 'bg-gray-200' : 'bg-gray-50'}`}>
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
        }
        {error.length > 0 && <p className='text-red-600'>{error}</p>}
        {files.length > 0 && <ul>
            {files.map(x=> <li key={x.name}>{x.name}</li>)}
            </ul>}
        </div>
  )
}
