import { create } from 'zustand'
import { interview } from '../types/interview'


interface InterviewState {
  interview: interview | null
  setInterview: (interview:interview) => void
  
}



export const useInterviewStore = create<InterviewState>((set) => ({
  interview: null,
  setInterview: (interview:interview)  => set({ interview }),
  
}));