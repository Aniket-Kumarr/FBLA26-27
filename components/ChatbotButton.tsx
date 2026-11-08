"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPaperAirplane, HiTrash, HiX } from 'react-icons/hi';

interface Message {
    sender: 'user' | 'ember';
    text: string;
    timestamp: string;
}

type Stage = "closed" | "pill" | "chat";

export default function ChatbotButton() {
    const [stage, setStage] = useState<Stage>("closed");
    const [chatReady, setChatReady] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [hasShownWelcome, setHasShownWelcome] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleCloseChat = useCallback(() => {
        setChatReady(false);
        setStage("closed");
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (stage === "chat") {
                    handleCloseChat();
                } else if (stage === "pill") {
                    setStage("closed");
                }
            }
        };

        if (stage !== "closed") {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [stage, handleCloseChat]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (messages.length > 0 && stage === "pill") {
            setStage("chat");
        }
    }, [messages.length, stage]);

    // Reset hasShownWelcome when chat closes
    useEffect(() => {
        if (stage === "closed") {
            setHasShownWelcome(false);
        }
    }, [stage]);

    const getCurrentTime = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    const handleSend = async () => {
        if (message.trim()) {
            const userMessage: Message = {
                sender: 'user',
                text: message.trim(),
                timestamp: getCurrentTime(),
            };

            setMessages((prev) => [...prev, userMessage]);
            // Mark welcome as shown when user sends first message
            if (!hasShownWelcome) {
                setHasShownWelcome(true);
            }
            const currentMessage = message.trim();
            setMessage('');

            // Show loading state
            const loadingMessage: Message = {
                sender: 'ember',
                text: '...',
                timestamp: getCurrentTime(),
            };
            setMessages((prev) => [...prev, loadingMessage]);

            try {
                // Prepare conversation history (last 10 messages for context)
                const conversationHistory = messages
                    .slice(-10)
                    .map(msg => ({
                        sender: msg.sender,
                        text: msg.text,
                    }));

                // Call the API
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: currentMessage,
                        conversationHistory,
                    }),
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok || data.error) {
                    console.error('API error response:', data);
                    const details = data.details ?? '';
                    const is429 = response.status === 429 || /429|quota|rate limit/i.test(details);
                    const isKeyError = response.status === 401 || response.status === 403 || /API key not configured|invalid API key|API_KEY|permission denied|authentication/i.test(details);
                    if (is429) {
                        throw new Error('Rate limit reached. The free tier allows a few requests per minute. Please wait a minute and try again.');
                    }
                    if (isKeyError) {
                        throw new Error('Chat is not configured: check GEMINI_API_KEY in .env.local (from aistudio.google.com). Restart the dev server after changing env.');
                    }
                    throw new Error(details ? `${data.error || 'Error'}: ${details}` : (data.error || `API error: ${response.status}`));
                }

                // Remove loading message and add actual response
                setMessages((prev) => {
                    const withoutLoading = prev.slice(0, -1);
                    return [
                        ...withoutLoading,
                        {
                            sender: 'ember',
                            text: data.response || "Sorry, I couldn't generate a response.",
                            timestamp: getCurrentTime(),
                        },
                    ];
                });
            } catch (error: any) {
                console.error('Error sending message:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                });
                // Remove loading message and add error message (show real error so user knows what went wrong)
                setMessages((prev) => {
                    const withoutLoading = prev.slice(0, -1);
                    return [
                        ...withoutLoading,
                        {
                            sender: 'ember',
                            text: error.message || 'Sorry, something went wrong. Please try again.',
                            timestamp: getCurrentTime(),
                        },
                    ];
                });
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        setHasShownWelcome(false);
        handleCloseChat();
    };

    return (
        <div ref={containerRef} className="fixed z-[9999] bottom-4 right-4 sm:bottom-6 sm:right-6" style={{ maxWidth: 'calc(100vw - 2rem)' }}>
            <div className="relative">
                {/* Close Button and Clear Chat Button - Outside the box, top */}
                {chatReady && (
                    <>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            onClick={handleCloseChat}
                            className="absolute z-10 flex items-center justify-center w-10 h-10 text-gray-300 transition-colors bg-black border border-gray-500 rounded-full shadow-lg -top-2 -left-2 hover:text-white hover:bg-gray-900"
                        >
                            <HiX className="w-5 h-5" />
                        </motion.button>
                        {messages.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2, delay: 0.05 }}
                                onClick={handleClearChat}
                                className="absolute z-10 flex items-center justify-center w-10 h-10 text-gray-300 transition-colors bg-black border border-gray-500 rounded-full shadow-lg -top-2 left-9 hover:text-red-500 hover:bg-gray-900"
                            >
                                <HiTrash className="w-5 h-5" />
                            </motion.button>
                        )}
                    </>
                )}
                <motion.div
                    className="relative flex flex-col overflow-hidden bg-black border border-gray-500 shadow-2xl"
                    initial={false}
                    animate={
                        stage === "closed"
                            ? { width: 56, height: 56, borderRadius: 28 }
                            : stage === "pill"
                                ? { width: 400, height: 56, borderRadius: 28 }
                                : { width: 500, height: 600, borderRadius: 24 }
                    }
                    style={{
                        maxWidth: stage === "chat" ? 'min(500px, calc(100vw - 2rem))' : stage === "pill" ? 'min(400px, calc(100vw - 4rem))' : '56px',
                        maxHeight: stage === "chat" ? 'min(600px, calc(100vh - 2rem))' : '56px',
                    }}
                    transition={{
                        duration: 0.55,
                        ease: [0.32, 0.72, 0, 1]
                    }}
                    onAnimationComplete={() => {
                        if (stage === "chat") {
                            setChatReady(true);
                        } else {
                            setChatReady(false);
                        }
                    }}
                >
                    {/* Button/Icon and Pill Input */}
                    {stage !== "chat" && (
                        <div className="flex items-center h-full gap-2 pl-2 pr-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (stage === "closed") {
                                        setStage("pill");
                                    } else if (stage === "pill") {
                                        setStage("closed");
                                    }
                                }}
                                className="relative flex-shrink-0 w-10 h-10 cursor-pointer"
                            >
                                <Image
                                    src="/ctl.png"
                                    alt="CTL Logo"
                                    fill
                                    className="object-cover"
                                />
                            </motion.button>
                            {stage === "pill" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center flex-1 min-w-0 gap-2"
                                >
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your message..."
                                        className="flex-1 min-w-0 text-sm text-white placeholder-gray-300 bg-transparent outline-none"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button
                                        onClick={handleSend}
                                        className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-white transition-colors cursor-pointer hover:text-gray-300"
                                    >
                                        <HiPaperAirplane className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Chat Content - Only when chatReady is true */}
                    {chatReady && (
                        <>
                            {/* Chat History */}
                            <div className="flex-1 min-h-0 p-4 space-y-4 overflow-y-auto bg-black">
                                {/* Welcome Message - Show when chat opens and no messages yet */}
                                {messages.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                        className="flex justify-start"
                                    >
                                        <div className="flex gap-2 max-w-[80%] min-w-0 flex-row">
                                            <div className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                                <Image
                                                    src="/ctl.png"
                                                    alt="CTL Logo"
                                                    width={32}
                                                    height={32}
                                                    className="object-cover rounded-full"
                                                />
                                            </div>
                                            <div className="max-w-full min-w-0">
                                                <div className="rounded-lg px-3 py-2 break-words bg-gray-900" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                                    <p className="text-sm font-semibold text-white mb-1">
                                                        Hi! I&apos;m Community Hub!
                                                    </p>
                                                    <p className="text-sm text-gray-300 whitespace-pre-wrap">
                                                        Nice to meet you! I can help you find information about clubs, organizations, classes, and community activities in Charlotte, NC. What brings you here today?
                                                    </p>
                                                </div>
                                                <p className="text-gray-300 text-xs mt-1 text-left">
                                                    Community Hub • {getCurrentTime()}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <AnimatePresence>
                                    {messages.map((msg, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex gap-2 max-w-[80%] min-w-0 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`relative flex-shrink-0 w-8 h-8 ${msg.sender === 'user' ? 'rounded-full bg-gray-700' : ''} flex items-center justify-center`}>
                                                    {msg.sender === 'user' ? (
                                                        <span className="text-xs font-medium text-white">U</span>
                                                    ) : (
                                                        <Image
                                                            src="/ctl.png"
                                                            alt="CTL Logo"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="max-w-full min-w-0">
                                                    <div className={`rounded-lg px-3 py-2 ${msg.sender === 'user' ? 'bg-gray-800' : 'bg-gray-900'}`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                                        <p className="text-sm text-white whitespace-pre-wrap">
                                                            {msg.text}
                                                        </p>
                                                    </div>
                                                    <p className={`text-gray-300 text-xs mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                                        {msg.sender === 'user' ? 'You' : 'Community Hub'} • {msg.timestamp}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={chatEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="flex-shrink-0 p-5 border-t border-gray-500">
                                <div className="flex items-center min-w-0 gap-3 px-4 py-3 bg-gray-900 rounded-full">
                                    <div className="relative flex-shrink-0 w-7 h-7">
                                        <Image
                                            src="/ctl.png"
                                            alt="CTL Logo"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type a message..."
                                        className="flex-1 min-w-0 text-base text-white placeholder-gray-300 bg-transparent outline-none"
                                        style={{ maxWidth: '100%' }}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSend}
                                        className="flex-shrink-0 text-white transition-colors hover:text-gray-300"
                                    >
                                        <HiPaperAirplane className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}


