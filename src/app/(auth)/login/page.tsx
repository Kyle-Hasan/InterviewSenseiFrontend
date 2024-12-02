
'use client'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import Link from "next/link";
import axiosInstance from "../../utils/axiosInstance";
import { User } from "../../types/userType";
import { AuthContext } from "../../contexts/AuthContext";
const LoginPage = () => {
  const [username,setUsername] = useState("")
  const [password, setPassword] = useState("");
  const router = useRouter();
  const authContext = useContext(AuthContext)
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await axiosInstance.post("/Auth/login", {username,password})
    const userData:User = response.data
    if (userData) {
      router.push("/viewInterviews")
      authContext?.setLogin(userData)
    } else {
      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="space-y-4 w-80 p-6 bg-white shadow rounded">
        <h1 className="text-2xl font-bold">Login</h1>
        <Input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full mb-6">Login</Button>
        <Link 
        href="/signup" 
        className="text-blue-500 hover:text-blue-700 font-medium underline mt-4"
        >
        No Account? Sign up
      </Link>
      </form>
      
    </div>
  );
};

export default LoginPage;
