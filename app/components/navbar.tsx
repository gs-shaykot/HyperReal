'use client'
import React from 'react'
import { Search, Sun, User, ShoppingBag, Moon } from "lucide-react"
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import LogoutButton from '@/app/components/LogoutButton'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '@/app/redux/Slices/ThemeSlice'

 
export const Navbar = () => {
    const { data: session } = useSession();
    const theme = useSelector((state: any) => state.themeToggle.mode);
    const dispatch = useDispatch();
    console.log(theme)
    const navLinks =
        <>
            <li><a className={`${theme === 'light' ? 'text-white' : 'text-zinc-900'} hover:text-second bg-transparent!`}>Shop All</a></li>
            <li><a className={`${theme === 'light' ? 'text-white' : 'text-zinc-900'} hover:text-second bg-transparent!`}>New Arrivals</a></li>
            <li><a className={`${theme === 'light' ? 'text-white' : 'text-zinc-900'} hover:text-second bg-transparent!`}>LookBook</a></li>
        </>

    return (
        <>
            {/* <div>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Odit, rem.</p>
                </div> */}

            {/*  */}
            <div className={`${theme === 'light' ? 'bg-main/80 border-zinc-800' : 'bg-halfWhite border-gray-300/85 shadow'} border-b    backdrop-blur-xs sticky top-0 z-50 transition-colors duration-300`}>
                <div className={`navbar ${theme === 'light' ? 'text-white' : 'text-zinc-900'} shadow-sm px-3 md:px-6`}>
                    <div className="navbar-start w-[30%] md:w-[50%]">
                        <div className="dropdown">
                            <div tabIndex={0} role="button" className={`btn btn-ghost lg:hidden ${theme === 'light' ? 'text-white hover:bg-zinc-800 border-0 shadow-none' : 'text-zinc-900'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                                </svg>
                            </div>
                            <ul
                                tabIndex={0}
                                className={`${theme === 'light' ? 'bg-zinc-900/95 border-zinc-800 border' : 'bg-halfWhite border-gray-300/85'} menu menu-sm dropdown-content rounded-box z-1 mt-3 w-52 p-2 shadow`}>
                                {navLinks}
                            </ul>
                        </div>
                        <ul className="menu menu-horizontal px-1 hidden lg:flex">
                            {navLinks}
                        </ul>
                    </div>
                    <div className="navbar-center">
                        <Link href="/" className={`${theme === 'light' ? 'text-white' : 'text-zinc-900'} text-xl md:text-3xl font-extrabold italic`}>
                            HYPER<span className="text-second">REAL</span>
                        </Link>
                    </div>
                    <div className="navbar-end gap-1">
                        <button className={`${theme === 'light' ? 'text-white' : 'text-zinc-900'}`}>
                            <label className="swap swap-rotate">
                                {/* this hidden checkbox controls the state */}
                                <input type="checkbox" className="theme-controller" value="synthwave" />

                                {/* sun icon */}
                                <Sun
                                    onClick={() => dispatch(toggleTheme())}
                                    size={20} strokeWidth={1.2} className='swap-off fill-current' />

                                {/* moon icon */}
                                <Moon
                                    onClick={() => dispatch(toggleTheme())}
                                    size={20} strokeWidth={1.2} className='swap-on fill-current' />
                            </label>
                        </button>
                        <div tabIndex={0} role="button" className={`${theme === 'light' ? 'text-white' : 'text-zinc-900'} btn btn-ghost btn-circle bg-transparent! border-none! shadow-none!`}>
                            <div className="indicator">
                                <ShoppingBag size={18} strokeWidth={1.2} />
                                <span className="badge badge-xs indicator-item border border-gray-500/85">8</span>
                            </div>
                        </div>
                        <div className="dropdown dropdown-end flex items-center gap-2 justify-center">
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
                                            <User size={20} strokeWidth={1.2} className={`${theme === 'light' ? 'text-white' : 'text-zinc-900'}`} />
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
