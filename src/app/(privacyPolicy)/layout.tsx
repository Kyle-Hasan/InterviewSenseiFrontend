
import { AuthContext } from "@/app/contexts/AuthContext";

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
