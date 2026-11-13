"use client";

import { SessionProvider } from 'next-auth/react';
import { A11yProvider } from '@/components/a11y/A11yProvider';
import AccessibilityMenu from '@/components/a11y/AccessibilityMenu';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <A11yProvider>
                {children}
                <AccessibilityMenu />
            </A11yProvider>
        </SessionProvider>
    );
}
