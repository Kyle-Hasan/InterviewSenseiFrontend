'use client'
import { AuthContext } from '@/app/contexts/AuthContext'
import Link from 'next/link'
import React, { useContext, useState } from 'react'
import { Menu01Icon, Cancel01Icon } from 'hugeicons-react'

export const Navbar = () => {
  const { username } = useContext(AuthContext)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
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
        <span>{username}</span>
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
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
