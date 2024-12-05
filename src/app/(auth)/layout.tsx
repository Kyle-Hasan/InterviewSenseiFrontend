
import "../globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { Navbar } from "@/components/Navbar";



export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  
  return (
    
      <>
     
      
        {children}
     
        </>
    
  );
}
