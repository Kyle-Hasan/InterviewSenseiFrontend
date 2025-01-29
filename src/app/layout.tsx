import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";

import {

  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import Footer from "@/components/Footer";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Interview Sensei",
  description: "Interview Sensei",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  

 
  
  
  return (
    <html className="" lang="en">
      <body
        className="h-100 flex flex-col"
      >
       
      <AuthProvider>
        {children}
        <Footer/>
        </AuthProvider>
      
      </body>
    </html>
  );
}
