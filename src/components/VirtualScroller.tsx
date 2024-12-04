'use client'
import React, { ReactNode, useRef } from 'react'
interface VirtualScrollerProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list:any[],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    refreshFunction:Function,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-explicit-any
    displayFunction: (item:any)=>ReactNode,



}
const VirtualScroller = ({refreshFunction,list,displayFunction}:VirtualScrollerProps) => {

  const divRef = useRef<HTMLDivElement>(null)


  const handleScroll = async()=> {
    

    const reachedBottom = divRef.current && divRef.current.scrollHeight > divRef.current.clientHeight + divRef.current.scrollTop
 
    if(reachedBottom) { 
        
        await refreshFunction()
      
    }

  }
  
  return (
    
      <div
        className="overflow-scroll h-1/3 w-auto space-y-4"
        ref={divRef}
        onScroll={handleScroll}
      >
        {list.map(displayFunction)}
      </div>
    
  );
  
}

export default VirtualScroller