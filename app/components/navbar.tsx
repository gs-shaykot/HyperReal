'use client'
import React from 'react'
import { Search, Sun, User, ShoppingBag, Moon } from "lucide-react"
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import LogoutButton from '@/app/components/LogoutButton'

export const Navbar = () => {
    const { data: session } = useSession();
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
                <div className="navbar text-white shadow-sm px-3 md:px-6">
                    <div className="navbar-start w-[30%] md:w-[50%]">
                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                                </svg>
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content bg-main/95 rounded-box z-1 mt-3 w-52 p-2 shadow">
                                {navLinks}
                            </ul>
                        </div>
                        <ul className="menu menu-horizontal px-1 hidden lg:flex">
                            {navLinks}
                        </ul>
                    </div>
                    <div className="navbar-center">
                        <Link href="/" className="text-xl md:text-3xl font-bold">
                            HYPER<span className="text-second">REAL</span>
                        </Link>
                    </div>
                    <div className="navbar-end gap-2">
                        <button className="">
                            <label className="swap swap-rotate">
                                {/* this hidden checkbox controls the state */}
                                <input type="checkbox" className="theme-controller" value="synthwave" />

                                {/* sun icon */}
                                <Sun size={20} strokeWidth={1.2} className='swap-off fill-current' />

                                {/* moon icon */}
                                <Moon size={20} strokeWidth={1.2} className='swap-on fill-current' />
                            </label>
                        </button> 
                        <div className="dropdown dropdown-end flex items-center gap-2 justify-center">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                <div className="indicator">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /> </svg>
                                    <span className="badge badge-xs indicator-item">8</span>
                                </div>
                            </div>
                            {
                                session?.user ?
                                    (
                                        <div>
                                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar bg-transparent! border-none! shadow-none! ">
                                                <div className="w-7 h-7 rounded-full">
                                                    <img
                                                        alt="User avatar"
                                                        src={session?.user?.image} />
                                                </div>
                                            </div>
                                            <ul
                                                tabIndex={-1}
                                                className="menu menu-sm dropdown-content bg-main border border-gray-500/85 rounded-box z-1 mt-3 w-52 p-2 shadow space-y-1">
                                                <li><a>{session?.user?.name}</a></li>
                                                <li>
                                                    {
                                                        session?.user ? <Link href="/profile">Profie</Link> : <Link href="/login">Login</Link>
                                                    }
                                                </li>
                                                <li>
                                                    <LogoutButton />
                                                </li>
                                            </ul>
                                        </div>
                                    ) : (
                                        <Link href="/login" className="btn btn-ghost btn-circle btn-sm">
                                            <User size={20} strokeWidth={1.2} />
                                        </Link>
                                    )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
