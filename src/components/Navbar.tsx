'use client'
import { AuthContext } from '@/app/contexts/AuthContext'
import Link from 'next/link'
import React, { useContext, useState } from 'react'
import { Menu01Icon, Cancel01Icon } from 'hugeicons-react'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/app/utils/axiosInstance'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from './ui/navigation-menu'

export const Navbar = () => {
  const username = sessionStorage.getItem("username")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const logout = async()=> {
    await axiosInstance.get("/Auth/logout")
    router.push("/login")

  }

  return (
    <nav className="flex items-center justify-between bg-black text-white p-4">
      
      <div className="hidden md:flex space-x-4">
        <div className="text-lg font-bold">
        <Link href={"/"}>Interview Sensei</Link>
      </div>
        <Link href={"/generateInterviewForm"}>New Interview</Link>
        <Link href={"/viewInterviews"}>View Interviews</Link>
      </div>
      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          aria-label="Toggle Menu"
          className="text-white text-2xl"
        >
          {isMenuOpen ? <Cancel01Icon color='white' /> : <Menu01Icon color='white' />}
        </button>
      </div>
      <div className="hidden md:block">
      <NavigationMenu className='mr-9'>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger className='bg-black text-white hover:bg-black'>{username}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink className='p-5 bg-black text-white cursor-pointer hover:bg-gray-700 border-none' onClick={logout}>Logout</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
      </div>

      {isMenuOpen && (
        <div className="absolute top-14 left-0 w-full bg-black text-white shadow-lg md:hidden">
          <ul className="flex flex-col items-center space-y-4 p-4">
            <li>
              <Link href={"/generateInterviewForm"} onClick={toggleMenu}>New Interview</Link>
            </li>
            <li>
              <Link href={"/viewInterviews"} onClick={toggleMenu}>View Interviews</Link>
            </li>
            <li>
              <span>{username}</span>
              <span onClick={logout} className='cursor-pointer'>Logout</span>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
