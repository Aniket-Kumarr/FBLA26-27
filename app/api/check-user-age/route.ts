import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServer();
        const { data: user, error } = await supabase
            .from('users')
            .select('created_at')
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (error) {
            console.error('Error checking user age:', error);
            return NextResponse.json(
                { error: 'Database error' },
                { status: 500 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { isNewUser: false },
                { status: 200 }
            );
        }

        // Check if user was created within the last 10 seconds
        const createdAt = new Date(user.created_at);
        const now = new Date();
        const secondsSinceCreation = (now.getTime() - createdAt.getTime()) / 1000;
        const isNewUser = secondsSinceCreation < 10;

        return NextResponse.json(
            { isNewUser },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in check-user-age:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

