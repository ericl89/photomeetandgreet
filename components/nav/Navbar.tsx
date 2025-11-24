'use client'
import Image from 'next/image'
import meetgreet_logo from '@/public/meetgreet_logo.png'
import React, {useRef, useState} from "react";
import Link from "next/link";
import {faHouse, faCalendar, faAddressBook, faRectangleList, faFlag, faCircleQuestion} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function Navbar({restrict}: { restrict: "admin" | "member" | "guest" }) {

    const [menu, setMenu] = useState(true);
    const [menu1, setMenu1] = useState(true)

    const main = useRef<HTMLInputElement | null>(null);
    const open = useRef<HTMLInputElement | null>(null);
    const close = useRef<HTMLInputElement | null>(null);
    const icon1 = useRef<SVGSVGElement | null>(null);


    let mobile = false;


    const showMenu1 = (flag: boolean) => {
        if (flag && icon1.current) {
            icon1.current.classList.toggle("rotate-180");
            setMenu1(prev => !prev);
        }
    };


    const toggleNav = () => {
        setMenu(prev => !prev);
        main.current?.classList.toggle("-translate-x-full");
        main.current?.classList.toggle("translate-x-0");
        main.current?.classList.toggle("position-absolute");
        open.current?.classList.toggle("hidden");
        close.current?.classList.toggle("hidden");
        mobile = !mobile;
    };

    return (
        <div className="z-100 w-full h-full fixed sm:relative">
            <div className="rounded-r bg-[rgb(37,33,50)] xl:hidden flex justify-between w-full p-6 items-center ">
                <div className="flex justify-between  items-center space-x-3">
                    <Image src={meetgreet_logo} alt="Photography Meet & Greet Logo"/>
                </div>
                <div aria-label="toggler" className="flex justify-center items-center">
                    <button aria-label="open" id="open" onClick={() => toggleNav()}
                            className={`${menu ? 'hidden' : ''} focus:outline-none focus:ring-2 `}>
                        <svg className="" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6H20" stroke="white" strokeWidth="1.5" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                            <path d="M4 12H20" stroke="white" strokeWidth="1.5" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                            <path d="M4 18H20" stroke="white" strokeWidth="1.5" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button aria-label="close" id="close" onClick={() => toggleNav()}
                            className={`${!menu ? 'hidden' : ''} focus:outline-none focus:ring-2`}>
                        <svg className="" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                            <path d="M6 6L18 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div id="main" ref={main}
                 className={`${!menu ? 'hidden' : ''} xs:block h-full xs:w-full xl:rounded-r transform  xl:translate-x-0  ease-in-out transition duration-500 flex justify-start items-start sm:w-64 bg-[rgb(37,33,50)] flex-col`}>

                <div className="hidden xl:flex justify-start p-6 items-center space-x-3">
                    <Image src={meetgreet_logo} alt="Photography Meet & Greet Logo"/>
                </div>

                <div
                    className="mt-6 flex flex-col justify-start items-center  pl-4 w-full border-gray-600 border-b space-y-3 pb-5 ">
                    <Link href="/" className="flex jusitfy-start items-center space-x-6 w-full  focus:outline-none  focus:text-indigo-400  text-white rounded ">
                    <button
                        className="flex jusitfy-start items-center space-x-6 w-full  focus:outline-none  focus:text-indigo-400  text-white rounded ">
                        <FontAwesomeIcon icon={faHouse} size="lg"/>
                        <p className="text-base leading-4 ">Home</p>
                    </button>
                    </Link>
                    <Link href="/profile" className="flex jusitfy-start items-center space-x-6 w-full  focus:outline-none  focus:text-indigo-400  text-white rounded ">
                    <button
                        className="flex jusitfy-start items-center space-x-6 w-full  focus:outline-none  focus:text-indigo-400  text-white rounded ">
                        <svg className="fill-stroke" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                strokeLinejoin="round"/>
                            <path
                                d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21"
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                strokeLinejoin="round"/>
                        </svg>
                        <p className="text-base leading-4 ">Account</p>
                    </button>
                    </Link>
                    <Link href="/faq" className="flex jusitfy-start items-center space-x-6 w-full  focus:outline-none  focus:text-indigo-400  text-white rounded ">
                    <button
                        className="flex jusitfy-start items-center space-x-6 w-full  focus:outline-none  focus:text-indigo-400  text-white rounded ">
                        <FontAwesomeIcon icon={faCircleQuestion} size="lg"/>
                        <p className="text-base leading-4 ">FAQ</p>
                    </button>
                    </Link>
                    <button
                        className="flex jusitfy-start items-center space-x-6 w-full  focus:outline-none  focus:text-indigo-400  text-white rounded ">
                        <FontAwesomeIcon icon={faFlag} size="lg"/>
                        <p className="text-base leading-4 ">Report</p>
                    </button>
                    <button
                        className="flex jusitfy-start items-center w-full  space-x-6 focus:outline-none text-white focus:text-indigo-400   rounded ">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M17 11H7C5.89543 11 5 11.8955 5 13V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V13C19 11.8955 18.1046 11 17 11Z"
                                stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path
                                d="M12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17Z"
                                stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path
                                d="M8 11V7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7V11"
                                stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p className="text-base leading-4 ">Logout</p>
                    </button>
                </div>

                {restrict === 'admin'&&
                <div className="flex flex-col justify-start items-center   px-6 border-b border-gray-600 w-full  ">
                    <button onClick={() => showMenu1(true)}
                            className="focus:outline-none focus:text-indigo-400 text-left  text-white flex justify-between items-center w-full py-5 space-x-14  ">
                        <p className="text-sm leading-5  uppercase">Admin</p>
                        <svg id="icon1" ref={icon1} className="transform" width="24" height="24" viewBox="0 0 24 24"
                             fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </button>
                    {menu1 &&
                        <div id="menu1" className="flex justify-start  flex-col w-full md:w-auto items-start pb-1 ">
                            <Link href="/admin" className="w-[18] text-center">
                                <button
                                    className="flex justify-start items-center space-x-6 hover:text-white focus:bg-gray-700 focus:text-white hover:bg-gray-700 text-gray-400 rounded px-3 py-2  w-full md:w-52">
                                    <svg className="fill-stroke " width="24" height="24" viewBox="0 0 24 24" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M9 4H5C4.44772 4 4 4.44772 4 5V9C4 9.55228 4.44772 10 5 10H9C9.55228 10 10 9.55228 10 9V5C10 4.44772 9.55228 4 9 4Z"
                                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                            strokeLinejoin="round"/>
                                        <path
                                            d="M19 4H15C14.4477 4 14 4.44772 14 5V9C14 9.55228 14.4477 10 15 10H19C19.5523 10 20 9.55228 20 9V5C20 4.44772 19.5523 4 19 4Z"
                                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                            strokeLinejoin="round"/>
                                        <path
                                            d="M9 14H5C4.44772 14 4 14.4477 4 15V19C4 19.5523 4.44772 20 5 20H9C9.55228 20 10 19.5523 10 19V15C10 14.4477 9.55228 14 9 14Z"
                                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                            strokeLinejoin="round"/>
                                        <path
                                            d="M19 14H15C14.4477 14 14 14.4477 14 15V19C14 19.5523 14.4477 20 15 20H19C19.5523 20 20 19.5523 20 19V15C20 14.4477 19.5523 14 19 14Z"
                                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                            strokeLinejoin="round"/>
                                    </svg>
                                    <p className="text-base leading-4  ">Dashboard</p>
                                </button>
                            </Link>
                            <Link href="/admin/users">
                                <button
                                    className="flex justify-start items-center space-x-6 hover:text-white focus:bg-gray-700 focus:text-white hover:bg-gray-700 text-gray-400 rounded px-3 py-2  w-full md:w-52">
                                    <FontAwesomeIcon icon={faAddressBook} size="lg"/>
                                    <p className="text-base leading-4  ">Members</p>
                                </button>
                            </Link>
                            <Link href="/admin/events">
                                <button
                                    className="flex justify-start items-center space-x-6 hover:text-white focus:bg-gray-700 focus:text-white hover:bg-gray-700 text-gray-400 rounded px-3 py-2 w-full md:w-52">
                                    <FontAwesomeIcon icon={faCalendar} size="lg"/>
                                    <p className="text-base leading-4  ">Events</p>
                                </button>
                            </Link>
                            <Link href="/admin/groups">
                                <button
                                    className="flex justify-start items-center space-x-6 hover:text-white focus:bg-gray-700 focus:text-white hover:bg-gray-700 text-gray-400 rounded px-3 py-2  w-full md:w-52">
                                    <FontAwesomeIcon icon={faRectangleList} size="lg"/>
                                    <p className="text-base leading-4  ">Groups</p>
                                </button>
                            </Link>
                            <button
                                className="flex justify-start items-center space-x-6 hover:text-white focus:bg-gray-700 focus:text-white hover:bg-gray-700 text-gray-400 rounded px-3 py-2  w-full md:w-52">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 21H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                          strokeLinejoin="round"/>
                                    <path d="M10 21V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                          strokeLinejoin="round"/>
                                    <path d="M10 4L19 8L10 12" stroke="currentColor" strokeWidth="1.5"
                                          strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <p className="text-base leading-4  ">Flags</p>
                            </button>
                        </div>
                    }
                </div>
                }


            </div>
        </div>
    )
}