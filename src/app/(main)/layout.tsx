
'use client';
import "../globals.css";
import { AuthContext, AuthProvider } from "../contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SignalRProvider } from "../contexts/SignalRContext";
import { useContext } from "react";
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 10, // 10 minutes
      },
    },
  });

  const authContext = useContext(AuthContext)

  
  
  
  return (
    
      <>
    
    <QueryClientProvider client={queryClient}>

  <SignalRProvider>
    <Navbar />
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </SignalRProvider>
</QueryClientProvider>

        
        
    
        </>
    
  );
}
