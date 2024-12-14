
import { question } from "./question"
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

