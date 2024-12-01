
'use client'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import Link from "next/link";
import axiosInstance from "../../app/utils/axiosInstance";
import { User } from "../../app/types/userType";
import { AuthContext } from "../../app/contexts/AuthContext";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [username,setUsername] = useState("")
  const [password, setPassword] = useState("");
  const authContext = useContext(AuthContext)
  const router = useRouter();
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await axiosInstance.post("/Auth/register",{email,username,password})

    const userData:User = response.data
    if (userData) {
      
      authContext?.setLogin(userData)
      router.push("/viewInterviews")
    } else {
      alert("Signup failed");
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
      </form>
    </div>
  );
};

export default SignupPage;
