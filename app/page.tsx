"use client";

import { useEffect } from 'react';
import Navbar from '@/components/Navbar'
import InteractiveImage from '@/components/InteractiveImage'
import { motion } from 'framer-motion'
import { HiUsers, HiMap, HiSearch, HiChat, HiViewGrid, HiGift } from 'react-icons/hi'

export default function Home() {
    useEffect(() => {
        // Ensure we stay on the landing page - clear any potential redirects
        // This prevents mobile browsers from auto-redirecting to dashboard
        if (typeof window !== 'undefined') {
            // Clear any stored redirect state
            const currentPath = window.location.pathname;
            if (currentPath === '/' || currentPath === '') {
                // We're on the landing page - stay here
                // Don't redirect even if user is authenticated
            }
        }
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-black">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-gray-900/20 via-transparent to-transparent"></div>
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-32 px-4 md:px-12 relative min-h-[95vh] flex items-center">
                <div className="relative z-10 w-full">
                    <div className="grid items-center grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                        <motion.div
                            className="text-left"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <motion.h1
                                className="text-7xl md:text-8xl lg:text-9xl font-bold text-white mb-10 leading-[1.1]"
                                style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                Welcome to{' '}
                                <span className="text-white">CLT </span>
                                <span className="text-gray-600" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 100 }}>
                                    CommunityHub
                                </span>
                            </motion.h1>
                            <motion.p
                                className="mb-12 text-2xl leading-relaxed text-gray-400 md:text-3xl lg:text-4xl"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                Your all-in-one platform for academic success, resources, and community connection
                            </motion.p>
                            <motion.div
                                className="flex flex-col justify-start gap-5 sm:flex-row"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            >
                                <a
                                    href="/get-started"
                                    className="relative px-10 py-5 font-sans text-xl font-semibold text-black transition-all duration-300 bg-white shadow-lg group hover:bg-gray-100 rounded-xl hover:shadow-xl hover:scale-105"
                                >
                                    <span className="relative z-10">Get Started</span>
                                    <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-white to-gray-100 rounded-xl group-hover:opacity-100"></span>
                                </a>
                                <a
                                    href="/about"
                                    className="px-10 py-5 font-sans text-xl font-semibold text-white transition-all duration-300 border-2 border-gray-600 group hover:border-gray-400 hover:bg-white/5 rounded-xl hover:scale-105"
                                >
                                    Learn More
                                </a>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            className="flex justify-center md:justify-end md:ml-16"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <InteractiveImage />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Decorative Line */}
            <motion.div
                className="w-full px-4 py-8 md:px-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div className="w-full border-t border-gray-800"></div>
            </motion.div>

            {/* Features Section */}
            <section id="features-section" className="relative z-10 px-4 py-24 md:px-12">
                <div className="w-full max-w-3xl mx-auto text-center">
                    <motion.h2
                        className="mb-8 text-5xl font-bold text-center text-white md:text-6xl lg:text-7xl"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        Learn & Promote Your Ideas at CLT CommunityHub
                    </motion.h2>
                    <motion.p
                        className="mb-12 text-xl leading-relaxed text-gray-400 md:text-2xl"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Share what you&apos;re building, find your people, and grow with Charlotte&apos;s community.
                    </motion.p>
                    <motion.div
                        className="flex flex-col justify-center gap-4 sm:flex-row"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <a
                            href="/get-started"
                            className="px-8 py-4 font-sans text-lg font-semibold text-black transition-all duration-300 bg-white hover:bg-gray-100 rounded-xl"
                        >
                            Get Started
                        </a>
                        <a
                            href="/join-us"
                            className="px-8 py-4 font-sans text-lg font-semibold text-white transition-all duration-300 border-2 border-gray-600 hover:border-gray-400 hover:bg-white/5 rounded-xl"
                        >
                            Join Us
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Decorative Line */}
            <motion.div
                className="w-full px-4 py-8 md:px-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div className="w-full border-t border-gray-800"></div>
            </motion.div>

            {/* Benefits Section */}
            <section className="relative z-10 px-4 py-24 md:px-12">
                <div className="w-full max-w-7xl mx-auto">
                    <motion.h2
                        className="mb-12 text-4xl font-bold text-center text-white md:text-5xl lg:text-6xl"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                    >
                        Why Choose CLT CommunityHub?
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Find Your Community',
                                description: 'Discover clubs and organizations that match your interests and connect with like-minded community members.',
                                Icon: HiUsers,
                            },
                            {
                                title: 'Interactive Map',
                                description: 'Explore club locations across Charlotte with our interactive map to find meetings near you.',
                                Icon: HiMap,
                            },
                            {
                                title: 'Easy Search',
                                description: 'Quickly find clubs by name, location, or category with our powerful search functionality.',
                                Icon: HiSearch,
                            },
                            {
                                title: 'Stay Connected',
                                description: 'Join thousands of community members building connections and growing together in the Charlotte community.',
                                Icon: HiChat,
                            },
                            {
                                title: 'All in One Place',
                                description: 'Access all club information, meeting times, locations, and member counts in one convenient dashboard.',
                                Icon: HiViewGrid,
                            },
                            {
                                title: 'Free to Join',
                                description: 'Sign up for free and start exploring all the amazing clubs and opportunities available to you.',
                                Icon: HiGift,
                            },
                        ].map((benefit, index) => {
                            const IconComponent = benefit.Icon;
                            return (
                                <motion.div
                                    key={index}
                                    className="group bg-black border-2 border-gray-700 rounded-2xl p-8 hover:border-gray-500 hover:bg-gray-900/50 transition-all duration-300"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                >
                                    <div className="mb-4 text-gray-400 group-hover:text-white transition-colors">
                                        <IconComponent className="h-12 w-12" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3 font-sans">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed font-sans">
                                        {benefit.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Decorative Line */}
            <motion.div
                className="w-full px-4 py-8 md:px-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div className="w-full border-t border-gray-800"></div>
            </motion.div>

            {/* Footer */}
            <motion.footer
                className="relative z-10 px-4 py-8 border-t border-gray-800 md:px-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div className="w-full">
                    <div className="flex flex-col items-center justify-center md:flex-row md:justify-between">
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <a href="/about" className="text-sm text-gray-400 transition-colors duration-300 hover:text-white">
                                About
                            </a>
                            <a href="/join-us" className="text-sm text-gray-400 transition-colors duration-300 hover:text-white">
                                Join Us
                            </a>
                            <a href="/resources" className="text-sm text-gray-400 transition-colors duration-300 hover:text-white">
                                Resources
                            </a>
                        </div>
                    </div>
                </div>
            </motion.footer>
        </div>
    )
}
