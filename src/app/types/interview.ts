export interface question {
    body:string,
    response:string,
    type:string,
    feedback:string,
    videoLink:string,
    id:number
}

export interface interview {
    id:number,
    questions:question[]
    name:string,
    jobDescription:string,
    resumeLink:string,
    createdDate:string
    secondsPerAnswer:number,
    additionalDescription:string
    
}

