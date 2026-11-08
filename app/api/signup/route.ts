import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServer();

        // Log which key is being used (for debugging)
        const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        console.log('Signup attempt:', { email: email.toLowerCase(), usingServiceRole });

        // Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('email, provider')
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking for existing user:', fetchError);
            console.error('Error details:', JSON.stringify(fetchError, null, 2));
            return NextResponse.json(
                { error: 'Database error during user check', details: fetchError.message },
                { status: 500 }
            );
        }

        if (existingUser) {
            if (existingUser.provider === 'google') {
                return NextResponse.json(
                    { error: 'This email is already registered with Google. Please sign in with Google instead.' },
                    { status: 409 }
                );
            } else {
                return NextResponse.json(
                    { error: 'This email is already registered. Please sign in instead.' },
                    { status: 409 }
                );
            }
        }

        // Double-check: Verify user still doesn't exist before inserting
        // This prevents race conditions
        const { data: doubleCheck, error: doubleCheckError } = await supabase
            .from('users')
            .select('email, provider')
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (doubleCheckError && doubleCheckError.code !== 'PGRST116') {
            console.error('Error in double-check:', doubleCheckError);
            return NextResponse.json(
                { error: 'Database error during verification' },
                { status: 500 }
            );
        }

        if (doubleCheck) {
            console.log('User found in double-check, preventing duplicate signup');
            if (doubleCheck.provider === 'google') {
                return NextResponse.json(
                    { error: 'This email is already registered with Google. Please sign in with Google instead.' },
                    { status: 409 }
                );
            } else {
                return NextResponse.json(
                    { error: 'This email is already registered. Please sign in instead.' },
                    { status: 409 }
                );
            }
        }

        // Hash password and create new user
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Attempting to insert user into Supabase...');
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    name,
                    email: email.toLowerCase(),
                    password_hash: hashedPassword,
                    provider: 'email',
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating user:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error details:', JSON.stringify(error, null, 2));

            // Handle duplicate key error (unique constraint violation)
            if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
                return NextResponse.json(
                    { error: 'This email is already registered. Please sign in instead.' },
                    { status: 409 }
                );
            }

            // Check if it's an RLS policy error
            if (error.code === '42501' || error.message?.includes('policy') || error.message?.includes('permission')) {
                return NextResponse.json(
                    {
                        error: 'Permission denied. Please check Row Level Security policies or add SUPABASE_SERVICE_ROLE_KEY to .env.local',
                        details: error.message
                    },
                    { status: 403 }
                );
            }

            return NextResponse.json(
                { error: error.message || 'Failed to create user account', details: error.code },
                { status: 500 }
            );
        }

        if (!data) {
            console.error('User creation returned no data');
            return NextResponse.json(
                { error: 'User account created but no data returned' },
                { status: 500 }
            );
        }

        console.log('User successfully created:', { id: data.id, email: data.email });
        return NextResponse.json(
            { message: 'User created successfully', user: { id: data.id, email: data.email, name: data.name } },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

