import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getSupabaseServer } from '@/lib/supabase-server';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  providers: [
    // Only enable Google OAuth if credentials are provided
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      })
    ] : []),
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const supabase = getSupabaseServer();
          const { data, error } = await supabase
            .from('users')
            .select('id, email, name, password_hash, provider')
            .eq('email', credentials.email.toLowerCase())
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching user for auth:', error);
            return null;
          }

          if (!data || data.provider !== 'email' || !data.password_hash) return null;
          const ok = await bcrypt.compare(credentials.password, data.password_hash);
          if (!ok) return null;
          return { id: data.id, email: data.email, name: data.name };
        } catch (error) {
          console.error('Error in authorize:', error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const supabase = getSupabaseServer();
          const { data: existing, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email.toLowerCase())
            .maybeSingle();
          
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking for existing Google user:', fetchError);
            // Don't allow sign-in if we can't verify the user
            return false;
          }

          // Check if user exists
          if (existing) {
            if (existing.provider === 'google') {
              // User exists with Google provider - allow sign-in (works for both sign-up and sign-in)
              console.log('User exists with Google provider, allowing sign-in:', user.email);
              return true;
            }
            
            if (existing.provider === 'email') {
              // User exists with email/password - prevent Google sign-in/sign-up
              console.log('BLOCKING: User exists with email provider, preventing Google auth:', user.email);
              return '/signin?error=AccessDenied';
            }
          }

          // User doesn't exist - create the user
          // The redirect callback will determine if this was sign-up or sign-in
          // If redirecting to /dashboard (sign-in), we'll delete the user and show error
          // If redirecting to /get-started?signup=true (sign-up), we'll allow it
          if (!existing) {
            console.log('User not found, creating Google user (will verify sign-up vs sign-in in redirect):', user.email);
            
            const { error: insertError } = await supabase
              .from('users')
              .insert([{
                email: user.email.toLowerCase(),
                name: user.name || (profile as { name?: string })?.name || '',
                provider: 'google',
                provider_id: account.providerAccountId,
                password_hash: null,
              }]);
            
            if (insertError) {
              console.error('Error creating Google user in Supabase:', insertError);
              // If duplicate key error, user was created between check and insert
              if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
                console.log('Duplicate key error - user was created between check and insert');
                // User now exists, allow sign-in
                return true;
              }
              return false;
            } else {
              console.log('Google user created successfully:', user.email);
              // User created - allow sign-in, redirect callback will verify if it was sign-up or sign-in
              return true;
            }
          } else if (existing.provider === 'google' && !existing.provider_id) {
            // Update existing Google user to add provider_id
            const { error: updateError } = await supabase
              .from('users')
              .update({ 
                provider_id: account.providerAccountId 
              })
              .eq('email', user.email.toLowerCase());
            if (updateError) {
              console.error('Error updating Google user in Supabase:', updateError);
              return false; // Prevent sign-in if update fails
            } else {
              console.log('Google user updated successfully:', user.email);
            }
          } else if (existing.provider === 'google' && existing.provider_id) {
            // User already exists with Google - allow sign-in
            console.log('Google user already exists, allowing sign-in:', user.email);
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false; // Prevent sign-in on any unexpected error
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        // Store a flag if this is a Google OAuth sign-in
        if (account?.provider === 'google') {
          token.isGoogleAuth = true;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Determine if this is sign-up or sign-in based on the redirect URL
      // Sign-up: /get-started?signup=true → allow user creation
      // Sign-in: /dashboard → block user creation, only allow existing users
      
      // Check if redirecting to /get-started?signup=true - this is from sign-up page
      if (url.includes('/get-started') && url.includes('signup=true') && !url.includes('error')) {
        // This is from sign-up page - new user was created, redirect to dashboard
        return `${baseUrl}/dashboard`;
      }
      
      // If redirecting to /dashboard (sign-in page), we need to check if user was just created
      // If user was just created (within last 5 seconds), it means they tried to sign in
      // but account didn't exist, so we created it. We should delete the user and show error.
      // However, we can't easily access the user's email here without the session.
      // So we'll let the frontend handle this check via the /api/check-user-age endpoint.
      // The sign-in page already does this check.
      
      // If redirecting to /dashboard and it's not from get-started, check if user was just created
      // We can't easily check this, so we'll allow it for now
      // The sign-in page will handle showing error if needed via a different mechanism
      
      // If redirecting to get-started with error, keep it (sign-up page will show popup)
      if (url.includes('/get-started') && url.includes('error=AccessDenied')) {
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        if (url.startsWith(baseUrl)) return url;
        return `${baseUrl}${url}`;
      }
      // If redirecting to get-started with signup=true and no error
      // Check if user already existed - if they have a session and came from sign-up, show popup
      // Otherwise, redirect new users to dashboard
      if (url.includes('/get-started') && url.includes('signup=true') && !url.includes('error')) {
        // Keep the URL - the sign-up page will check if user already existed
        // and either show popup or redirect to dashboard
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        if (url.startsWith(baseUrl)) return url;
        return `${baseUrl}${url}`;
      }
      // If redirecting to get-started with error, keep it (sign-up page will show popup)
      if (url.includes('/get-started') && url.includes('error')) {
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        if (url.startsWith(baseUrl)) return url;
        return `${baseUrl}${url}`;
      }
      // If redirecting to get-started without signup param, redirect to dashboard
      if (url.includes('/get-started') && !url.includes('signup=true')) {
        return `${baseUrl}/dashboard`;
      }
      // If redirecting to error page, redirect to sign-in
      if (url.includes('/api/auth/error')) {
        return `${baseUrl}/signin?error=AccessDenied`;
      }
      // If redirecting to sign-in page, preserve error parameters
      if (url.includes('/signin')) {
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        if (url.startsWith(baseUrl)) return url;
        return `${baseUrl}${url}`;
      }
      // Normal redirects (including /dashboard for sign-in)
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  pages: { 
    signIn: '/signin',
    error: '/api/auth/error',
  },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
});

export { handler as GET, handler as POST };
