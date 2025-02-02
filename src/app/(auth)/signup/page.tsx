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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [errors, setErrors] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    setErrors("");
    e.preventDefault();

    if (username.length === 0 || password.length === 0 || confirmPassword.length === 0) {
      setErrors("Username and both password fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setErrors("Passwords do not match");
      return;
    }

    try {
      const response = await axiosInstance.post("/Auth/register", { username, password });
      const userData: User = response.data;
      if (userData) {
        authContext?.setLogin(userData);
        router.push("/viewInterviews");
      }
    } catch (e) {
      setErrors("Sign up failed, please try again");
    }
  };

  return (
    <div className="flex items-center justify-center h-[92%]">
      <form onSubmit={handleSubmit} className="space-y-4 w-80 p-6 bg-white shadow rounded">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        <Input
          placeholder="Username"
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
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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