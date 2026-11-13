"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { HiHome, HiInformationCircle, HiBookOpen, HiUsers, HiDocumentText } from "react-icons/hi";
import { useDialog } from "@/lib/useDialog";

const dashboardNavLinks = [
    { id: "home", href: "/dashboard", label: "Home", icon: HiHome },
    { id: "about2", href: "/dashboard/about", label: "About", icon: HiInformationCircle },
    { id: "resources2", href: "/dashboard/resources", label: "Resources", icon: HiBookOpen },
    { id: "join-us", href: "/dashboard/join-us", label: "Join Us", icon: HiUsers },
    { id: "sources", href: "/dashboard/sources", label: "Sources", icon: HiDocumentText },
];

export default function DashboardNavbar() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const pathname = usePathname();
    const logoutRef = useDialog<HTMLDivElement>(showLogoutConfirm, () => setShowLogoutConfirm(false));

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen]);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        router.push("/");
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <header className="fixed top-0 z-50 w-full px-4 py-5">
            <div className="container flex items-center justify-between h-20 px-6 mx-auto border-2 border-gray-600 shadow-2xl bg-black/95 backdrop-blur-sm rounded-3xl">
                {/* Logo */}
                <Link href="/dashboard" aria-label="CLT CommunityHub dashboard home" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                    <div className="relative">
                        <Image
                            src="/ctl.png"
                            alt=""
                            width={48}
                            height={48}
                            className="object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-sans text-2xl font-bold tracking-tight text-white">CLT</span>
                        <span className="font-sans text-xs font-medium tracking-widest text-gray-400 uppercase">Community Hub</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav aria-label="Dashboard" className="items-center hidden gap-1 lg:flex">
                    {dashboardNavLinks.map((link) => {
                        const Icon = link.icon;
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.id}
                                href={link.href}
                                aria-current={active ? "page" : undefined}
                                className={`relative flex items-center gap-2 px-4 py-2 font-sans text-base font-semibold transition-colors border-2 rounded-lg group hover:text-white hover:border-gray-400 ${active ? "text-white border-gray-500 bg-white/5" : "text-gray-300 border-transparent"}`}
                            >
                                <Icon aria-hidden="true" className="w-5 h-5" />
                                <span className="font-semibold">{link.label}</span>
                                <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-white transition-all duration-300 group-hover:left-4 group-hover:w-[calc(100%-32px)]" />
                            </Link>
                        );
                    })}
                </nav>

                {/* Desktop Actions */}
                <div className="items-center hidden gap-3 lg:flex">
                    <button
                        type="button"
                        onClick={handleLogout}
                        aria-haspopup="dialog"
                        className="px-4 py-2 font-sans text-base font-semibold text-gray-300 transition-colors border-2 border-gray-500 rounded-lg hover:text-white hover:bg-white/10"
                    >
                        Log Out
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-controls="dashboard-mobile-menu"
                    className="flex items-center justify-center transition-colors rounded-lg lg:hidden h-11 w-11 hover:bg-white/10"
                >
                    {isOpen ? (
                        <svg aria-hidden="true" className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg aria-hidden="true" className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                    <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div id="dashboard-mobile-menu" className="fixed z-40 border-2 border-gray-600 shadow-2xl lg:hidden inset-x-4 top-24 bg-black/95 backdrop-blur-sm rounded-3xl">
                    <div className="flex flex-col h-full">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-600">
                            <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                                <div className="relative">
                                    <Image
                                        src="/ctl.png"
                                        alt=""
                                        width={32}
                                        height={32}
                                        className="object-contain"
                                    />
                                </div>
                                <span className="font-sans text-lg font-bold text-white">CLT Community Hub</span>
                            </Link>
                        </div>

                        {/* Mobile Navigation */}
                        <nav aria-label="Dashboard mobile" className="flex-1 py-4 overflow-y-auto">
                            {dashboardNavLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.id}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        aria-current={pathname === link.href ? "page" : undefined}
                                        className="flex items-center gap-3 px-4 py-3 mx-2 font-sans text-gray-300 transition-colors rounded-lg hover:bg-white/10 hover:text-white"
                                    >
                                        <Icon aria-hidden="true" className="w-6 h-6" />
                                        <span className="text-base font-semibold">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Mobile Actions */}
                        <div className="p-4 space-y-3 border-t border-gray-600">
                            <button
                                type="button"
                                onClick={() => {
                                    handleLogout();
                                    setIsOpen(false);
                                }}
                                className="block w-full px-4 py-2 font-sans text-base font-semibold text-center text-gray-300 transition-colors border-2 border-gray-500 rounded-lg hover:bg-white/10 hover:text-white"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Popup */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={cancelLogout}>
                    <div
                        ref={logoutRef}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="logout-title"
                        aria-describedby="logout-desc"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md p-8 mx-4 bg-black border-2 border-gray-700 shadow-2xl rounded-3xl"
                    >
                        <h2 id="logout-title" className="mb-4 font-sans text-2xl font-bold text-center text-white md:text-3xl">
                            Are you sure you want to log out?
                        </h2>
                        <p id="logout-desc" className="mb-8 font-sans text-center text-gray-300">
                            You will be redirected to the home page.
                        </p>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                data-autofocus
                                onClick={cancelLogout}
                                className="flex-1 px-6 py-3 font-sans font-semibold text-white transition-all duration-300 border-2 border-gray-600 hover:bg-gray-900 hover:border-gray-500 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmLogout}
                                className="flex-1 px-6 py-3 font-sans font-semibold text-black transition-all duration-300 bg-white border-2 border-white hover:bg-gray-200 rounded-xl"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

