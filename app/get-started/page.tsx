"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiUser, HiHome, HiX } from 'react-icons/hi';

function SignUpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        // Check for error in URL (from NextAuth redirect)
        const errorParam = searchParams.get('error');
        const signupParam = searchParams.get('signup');

        if (errorParam === 'AccessDenied' || errorParam === 'Configuration' || errorParam === 'UserNotFound') {
            if (errorParam === 'UserNotFound') {
                setError('Account not found. Please sign up to create an account.');
            } else {
                setShowErrorPopup(true);
            }
            // Clean up URL
            router.replace('/get-started', { scroll: false });
        } else if (signupParam === 'true') {
            // User was redirected back from Google OAuth on sign-up page
            // Check if they have a session and verify if account was just created
            import('next-auth/react').then(({ getSession, signOut }) => {
                getSession().then(async (session) => {
                    if (session && session.user?.email) {
                        // Check if user was just created (within last 5 seconds) or already existed
                        try {
                            const response = await fetch(`/api/check-user-age?email=${encodeURIComponent(session.user.email)}`);
                            const data = await response.json();

                            if (data.isNewUser) {
                                // New user was just created - redirect to dashboard
                                router.push('/dashboard');
                            } else {
                                // User already existed - show popup and sign them out
                                setShowErrorPopup(true);
                                signOut({ redirect: false });
                                router.replace('/get-started', { scroll: false });
                            }
                        } catch (error) {
                            // If check fails, assume existing user to be safe
                            setShowErrorPopup(true);
                            signOut({ redirect: false });
                            router.replace('/get-started', { scroll: false });
                        }
                    } else {
                        // No session - redirect to sign-in
                        router.push('/signin');
                    }
                });
            });
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            // Always check response status first - do NOT proceed if there's any error
            if (!response.ok) {
                console.error('Signup failed:', response.status, data);
                if (response.status === 409) {
                    // Duplicate account - show popup
                    setShowErrorPopup(true);
                    setError(data.error || 'This email is already registered');
                } else {
                    // Other error
                    setError(data.error || 'Sign up failed. Please try again.');
                }
                return; // IMPORTANT: Stop here, don't proceed with sign-in
            }

            // Only proceed if response is OK (201 Created)
            if (response.status !== 201) {
                console.error('Unexpected response status:', response.status);
                setError('Unexpected error during sign up. Please try again.');
                return;
            }

            // Verify we got user data back
            if (!data || !data.user) {
                console.error('No user data returned from signup');
                setError('Account created but verification failed. Please sign in manually.');
                setTimeout(() => {
                    router.push('/signin');
                }, 2000);
                return;
            }

            // User successfully created - redirect to sign-in page
            console.log('User created successfully, redirecting to sign-in page');
            router.push('/signin');
            router.refresh();
        } catch (error) {
            console.error('Sign up error:', error);
            setError('An error occurred during sign up. Please try again.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'url(/ctl.png)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '200px 200px',
                    backgroundPosition: '0 0',
                }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 via-transparent to-transparent pointer-events-none"></div>

            <Link
                href="/"
                className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-black/80 backdrop-blur-sm border-2 border-gray-600 text-white hover:bg-gray-900 hover:border-gray-500 px-4 py-2 rounded-xl transition-all duration-300 font-sans text-sm font-semibold"
            >
                <HiHome className="h-5 w-5" />
                <span>Back to Home</span>
            </Link>

            <section className="pt-12 pb-24 px-4 md:px-12 min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-2xl relative z-10"
                >
                    <div className="bg-black border-2 border-gray-700 rounded-3xl p-5 md:p-6 shadow-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
                                    Sign Up
                                </h1>
                                <Image
                                    src="/ctl.png"
                                    alt="CTL"
                                    width={64}
                                    height={64}
                                    className="object-contain"
                                />
                            </div>
                            <p className="text-gray-400 text-center mb-8 text-lg">
                                Join CLT CommunityHub today
                            </p>

                            {error && (
                                <div className="mb-6 p-4 bg-red-900/50 border-2 border-red-700 rounded-xl text-red-200 text-sm font-sans">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2 font-sans">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <HiUser className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-black/50 border-2 border-gray-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors font-sans"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2 font-sans">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <HiMail className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-black/50 border-2 border-gray-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors font-sans"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2 font-sans">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <HiLockClosed className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-black/50 border-2 border-gray-700 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors font-sans"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                                            >
                                                {showPassword ? (
                                                    <HiEyeOff className="h-5 w-5" />
                                                ) : (
                                                    <HiEye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-2 font-sans">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <HiLockClosed className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-black/50 border-2 border-gray-700 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors font-sans"
                                                placeholder="Confirm your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                                            >
                                                {showConfirmPassword ? (
                                                    <HiEyeOff className="h-5 w-5" />
                                                ) : (
                                                    <HiEye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    type="submit"
                                    className="w-full bg-black border-2 border-gray-600 text-white hover:bg-gray-900 hover:border-gray-500 text-lg font-semibold px-6 py-4 rounded-xl transition-all duration-300 font-sans shadow-lg hover:shadow-xl"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Sign Up
                                </motion.button>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-black text-gray-400 font-sans">Or continue with</span>
                                </div>
                            </div>

                            <motion.button
                                type="button"
                                onClick={async () => {
                                    // Store flag in sessionStorage to indicate this is a sign-up attempt
                                    sessionStorage.setItem('isSignUp', 'true');
                                    // Pass a parameter to indicate this is a sign-up attempt
                                    const result = await signIn('google', {
                                        callbackUrl: '/get-started?signup=true',
                                        redirect: true
                                    });
                                }}
                                className="w-full bg-white text-gray-900 hover:bg-gray-100 text-lg font-semibold px-6 py-4 rounded-xl transition-all duration-300 font-sans shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign up with Google
                            </motion.button>

                            <div className="mt-6 text-center">
                                <p className="text-gray-400 text-sm font-sans">
                                    Already have an account?{' '}
                                    <Link
                                        href="/signin"
                                        className="text-white hover:text-gray-300 font-semibold transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {showErrorPopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md" onClick={() => setShowErrorPopup(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-black border-2 border-gray-700 rounded-3xl p-10 md:p-12 max-w-lg w-full mx-4 shadow-2xl"
                    >
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex-1">
                                <h2
                                    className="text-3xl md:text-4xl font-bold text-white mb-3 font-sans"
                                    style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                                >
                                    Account Already Created
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowErrorPopup(false)}
                                className="text-white hover:text-gray-400 transition-colors p-1 rounded-lg hover:bg-white/10 ml-4"
                                aria-label="Close"
                            >
                                <HiX className="h-7 w-7" />
                            </button>
                        </div>

                        <p className="text-white text-lg mb-10 font-sans leading-relaxed">
                            Account already created. Please sign in with your email and password instead.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setShowErrorPopup(false)}
                                className="flex-1 px-8 py-4 font-sans text-lg font-semibold text-white transition-all duration-300 border-2 border-white hover:bg-white hover:text-black rounded-xl"
                            >
                                Close
                            </button>
                            <Link
                                href="/signin"
                                onClick={() => setShowErrorPopup(false)}
                                className="flex-1 px-8 py-4 font-sans text-lg font-semibold text-black transition-all duration-300 bg-white hover:bg-gray-100 rounded-xl text-center"
                            >
                                Sign In
                            </Link>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-white">Loading...</p>
            </div>
        }>
            <SignUpContent />
        </Suspense>
    );
}

