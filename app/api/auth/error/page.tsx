"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthErrorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    useEffect(() => {
        // Redirect based on error type
        if (error === 'UserNotFound') {
            // User not found - redirect to sign-up page
            router.replace('/get-started?error=UserNotFound');
        } else if (error === 'AccessDenied') {
            // Access denied - redirect to sign-in page
            router.replace('/signin?error=AccessDenied');
        } else {
            router.replace('/signin');
        }
    }, [error, router]);

    // Show nothing while redirecting
    return null;
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={null}>
            <AuthErrorContent />
        </Suspense>
    );
}

