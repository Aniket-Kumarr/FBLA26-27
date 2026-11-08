"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HiHome,
  HiInformationCircle,
  HiBookOpen,
  HiUsers,
} from "react-icons/hi";

const navLinks = [
  { href: "/", label: "Home", icon: HiHome },
  { href: "/about", label: "About", icon: HiInformationCircle },
  { href: "/resources", label: "Resources", icon: HiBookOpen },
  { href: "/join-us", label: "Join Us", icon: HiUsers },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full px-4 py-5">
      <div className="container flex items-center justify-between h-20 px-6 mx-auto border-2 border-gray-600 shadow-2xl bg-black/95 backdrop-blur-sm rounded-3xl">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="relative">
            <Image
              src="/ctl.png"
              alt="CTL"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-white">
              CLT
            </span>
            <span className="text-xs font-medium tracking-widest text-gray-400 uppercase">
              Community Hub
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="items-center hidden gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center gap-2 px-4 py-2 font-sans text-base font-semibold text-gray-300 transition-colors border-2 border-transparent rounded-lg group hover:text-white"
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{link.label}</span>
                <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-white transition-all duration-300 group-hover:left-4 group-hover:w-[calc(100%-32px)]" />
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="items-center hidden gap-3 md:flex">
          <Link
            href="/signin"
            className="px-4 py-2 font-sans text-base font-semibold text-gray-300 transition-colors border-2 border-gray-500 rounded-lg hover:text-white hover:bg-white/10"
          >
            Sign In
          </Link>
          <Link
            href="/get-started"
            className="px-5 py-2 font-sans text-base font-semibold text-black transition-colors bg-white rounded-lg hover:bg-gray-200"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center transition-colors rounded-lg md:hidden h-9 w-9 hover:bg-white/10"
        >
          {isOpen ? (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
          <span className="sr-only">Toggle menu</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed z-40 border-2 border-gray-600 shadow-2xl md:hidden inset-x-4 top-24 bg-black/95 backdrop-blur-sm rounded-3xl">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-600">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <div className="relative">
                  <Image
                    src="/ctl.png"
                    alt="CTL"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-bold text-white">
                  CLT Community Hub
                </span>
              </Link>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 mx-2 text-gray-300 transition-colors rounded-lg hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-sans text-base font-semibold">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Actions */}
            <div className="p-4 space-y-3 border-t border-gray-600">
              <Link
                href="/signin"
                className="block w-full px-4 py-2 font-sans text-base font-semibold text-center text-gray-300 transition-colors border-2 border-gray-500 rounded-lg hover:bg-white/10 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/get-started"
                className="block w-full px-4 py-2 font-sans text-base font-semibold text-center text-black transition-colors bg-white rounded-lg hover:bg-gray-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
