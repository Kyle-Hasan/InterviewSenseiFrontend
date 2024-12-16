import { create } from 'zustand'
import { question } from '../types/question';


interface QuestionState {
  questions: question[]
  setQuestion: (questions:question[]) => void
  updateQuestion: (updatedQuestion:question) => void
}



export const useQuestionStore = create<QuestionState>((set) => ({
  questions: [],
  setQuestion: (questions:question[]) => set({ questions: questions.sort((a,b)=> {return a.id - b.id}) }),
  updateQuestion: (updatedQuestion:question) =>
    set((state:QuestionState) => ({
      questions: state.questions.map((q) =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      ).sort((a,b)=> {return a.id - b.id})

    })),
}));