'use client'
import React from 'react'
import { Search, Sun, User, ShoppingBag } from "lucide-react"
import Link from 'next/link'

export const Navbar = () => {

    const navLinks =
        <>
            <li><a className="text-white hover:text-second">Shop All</a></li>
            <li><a className="text-white hover:text-second">New Arrivals</a></li>
            <li><a className="text-white hover:text-second">LookBook</a></li>
        </>

    return (
        <>

            {/* <div>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Odit, rem.</p>
            </div> */}
            {/*  */}
            <div className='border-b border-zinc-800 bg-main/80  backdrop-blur-xs sticky top-0 z-50 transition-colors duration-300'>
                <div className="navbar text-white shadow-sm px-6">
                    <div className="navbar-start">
                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                                </svg>
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content bg-main/85 rounded-box z-1 mt-3 w-52 p-2 shadow">
                                {navLinks}
                            </ul>
                        </div>
                        <ul className="menu menu-horizontal px-1 hidden lg:flex">
                            {navLinks}
                        </ul>
                    </div>
                    <div className="navbar-center">
                        <Link href="/" className="text-2xl font-bold">
                            HYPER<span className="text-second">REAL</span>
                        </Link>
                    </div>
                    <div className="navbar-end gap-2">

                        <button className="btn btn-ghost btn-circle btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <button className="btn btn-ghost btn-circle btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </button>
                        <button className="btn btn-ghost btn-circle btn-sm">
                            <Link href='/login'>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </Link>
                        </button>
                        <button className="btn btn-ghost btn-circle btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
