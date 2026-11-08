"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiHome, HiX } from 'react-icons/hi';

function SignInContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    useEffect(() => {
        // Check for error in URL - show regular error message, not popup
        const errorParam = searchParams.get('error');
        if (errorParam === 'AccessDenied') {
            setError('This email is already registered with email/password. Please sign in with your email and password instead.');
            // Clean up URL
            router.replace('/signin', { scroll: false });
        } else if (errorParam === 'UserNotFound') {
            setError('Account not found. Please sign up to create an account.');
            // Clean up URL
            router.replace('/signin', { scroll: false });
        }

        // Load saved email if "Remember me" was checked previously
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Save email to localStorage if "Remember me" is checked
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', formData.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            const res = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });
            if (res?.error) {
                setError('Invalid email or password');
                setLoading(false);
                return;
            }
            router.push('/dashboard');
            router.refresh();
        } catch {
            setError('Something went wrong');
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    className="w-full max-w-md relative z-10"
                >
                    <div className="bg-black border-2 border-gray-700 rounded-3xl p-8 md:p-10 shadow-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
                                    Sign In
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
                                Welcome back to CLT CommunityHub
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <p className="text-red-400 text-sm font-sans bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                                        {error}
                                    </p>
                                )}
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

                                <div className="flex items-center">
                                    <label className="flex items-center cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="sr-only"
                                            />
                                            <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${rememberMe
                                                ? 'bg-blue-600 border-blue-600'
                                                : 'bg-black/50 border-gray-600 group-hover:border-gray-500'
                                                }`}>
                                                {rememberMe && (
                                                    <svg className="w-3.5 h-3.5 text-white transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="ml-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors font-sans">Remember me</span>
                                    </label>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-black border-2 border-gray-600 text-white hover:bg-gray-900 hover:border-gray-500 text-lg font-semibold px-6 py-4 rounded-xl transition-all duration-300 font-sans shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
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
                                disabled={loading}
                                onClick={async () => {
                                    setError('');
                                    setLoading(true);
                                    try {
                                        const result = await signIn('google', {
                                            callbackUrl: '/dashboard',
                                            redirect: false
                                        });

                                        if (result?.ok) {
                                            // Check if user was just created (within last 10 seconds)
                                            // If so, it means they tried to sign in but account didn't exist
                                            // Delete the user and show error
                                            try {
                                                const sessionResponse = await fetch('/api/auth/session');
                                                const session = await sessionResponse.json();
                                                if (session?.user?.email) {
                                                    const userAgeResponse = await fetch(`/api/check-user-age?email=${encodeURIComponent(session.user.email)}`);
                                                    const userAge = await userAgeResponse.json();

                                                    if (userAge.isNewUser) {
                                                        // User was just created - this shouldn't happen for sign-in
                                                        // Delete the user and show error
                                                        await fetch(`/api/delete-user?email=${encodeURIComponent(session.user.email)}`, {
                                                            method: 'DELETE'
                                                        });
                                                        await signOut({ redirect: false });
                                                        setError('Account not found. Please sign up to create an account.');
                                                        setLoading(false);
                                                        return;
                                                    }
                                                }
                                            } catch (error) {
                                                console.error('Error checking user age:', error);
                                            }

                                            // Sign-in successful - proceed to dashboard
                                            router.push('/dashboard');
                                            router.refresh();
                                        } else if (result?.error) {
                                            // Handle error from NextAuth
                                            if (result.error === 'AccessDenied' || result.url?.includes('error=AccessDenied')) {
                                                setError('This email is already registered with email/password. Please sign in with your email and password instead.');
                                            } else if (result.error === 'UserNotFound' || result.url?.includes('error=UserNotFound')) {
                                                setError('Account not found. Please sign up to create an account.');
                                            } else {
                                                setError('Sign in failed. Please try again.');
                                            }
                                        } else {
                                            // Check URL for error parameters
                                            if (result?.url?.includes('error=AccessDenied')) {
                                                setError('This email is already registered with email/password. Please sign in with your email and password instead.');
                                            } else if (result?.url?.includes('error=UserNotFound')) {
                                                setError('Account not found. Please sign up to create an account.');
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Error during Google sign-in:', error);
                                        setError('Something went wrong. Please try again.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="w-full bg-white text-gray-900 hover:bg-gray-100 text-lg font-semibold px-6 py-4 rounded-xl transition-all duration-300 font-sans shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                                whileHover={loading ? {} : { scale: 1.02 }}
                                whileTap={loading ? {} : { scale: 0.98 }}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign in with Google
                            </motion.button>

                            <div className="mt-6 text-center">
                                <p className="text-gray-400 text-sm font-sans">
                                    Don&apos;t have an account?{' '}
                                    <Link
                                        href="/get-started"
                                        className="text-white hover:text-gray-300 font-semibold transition-colors"
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-white">Loading...</p>
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}

