'use client'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import Link from "next/link";
import axiosInstance from "../../utils/axiosInstance";
import { User } from "../../types/userType";
import { AuthContext } from "../../contexts/AuthContext";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [username,setUsername] = useState("")
  const [password, setPassword] = useState("");
  const authContext = useContext(AuthContext)
  const router = useRouter();
  const [errors,setErrors] = useState("")
  

  const handleSubmit = async (e: React.FormEvent) => {
    setErrors("")
    e.preventDefault();

    if(username.length === 0 || password.length === 0 ) {
      setErrors("Username and password are required")
      return
    }

    try {

    const response = await axiosInstance.post("/Auth/register",{email,username,password})

    const userData:User = response.data
    if (userData) {
      
      authContext?.setLogin(userData)
      router.push("/viewInterviews")
    }

  }
  catch(e) {
    setErrors("sign up failed, please try again ")
  }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="space-y-4 w-80 p-6 bg-white shadow rounded">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          
          required
        />
        <Button type="submit" className="w-full">Sign Up</Button>
        <Link 
        href="/login" 
        className="text-blue-500 hover:text-blue-700 font-medium underline mt-4"
        >
        Login
      </Link>
      {errors && <p className="text-red-600 mt-1 mb-1">{errors}</p>}
      </form>
    </div>
  );
};

export default SignupPage;
