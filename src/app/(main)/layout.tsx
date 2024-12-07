
'use client';
import "../globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SignalRProvider } from "../contexts/SignalRContext";
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const queryClient =  new QueryClient(); 
  
  
  return (
    
      <>
    <QueryClientProvider client={queryClient}>
     <SignalRProvider>
      <Navbar></Navbar>
      <ReactQueryDevtools initialIsOpen={false} />
        {children}
        </SignalRProvider>
        </QueryClientProvider>
        
    
        </>
    
  );
}
