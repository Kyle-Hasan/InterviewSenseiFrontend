'use client'
import { createContext, ReactNode, useState } from "react";
import { User } from "../types/userType";



interface AuthContextType {
    username: string | null;
    setUsername: (username:string | null) => void,
    userId: number | null;
    setUserId: (userId:number | null) => void,
    setLogin: (user:User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const AuthProvider = ({children}: {children:ReactNode})=> {
    const [username,setUsername] = useState<string | null>(null)
    const [userId,setUserId] = useState<number | null>(null)

    const setLogin = (user:User) => {
       
        localStorage.setItem("accessToken",user.accessToken)
        localStorage.setItem("refreshToken",user.refreshToken)
        
        sessionStorage.setItem("username",user.username)
        sessionStorage.setItem("userId",user.id?.toString())
        setUserId(user.id)
    }

    return <AuthContext.Provider value={{username,setUsername,userId,setUserId,setLogin}}>{children}</AuthContext.Provider>

}


export {AuthProvider,AuthContext}