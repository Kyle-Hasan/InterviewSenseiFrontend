import { response } from "./response"

export interface question {
    body:string,
    responses: response[]
    type:string,
   
    id:number,
    interviewId:number,
    secondsPerAnswer:number,
    nextQuestionId ?: number,
    previousQuestionId ?: number
}