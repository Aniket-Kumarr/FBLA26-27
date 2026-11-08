# Auth setup (one-time)

For **sign-in** and **sign-up** to work with your Supabase `users` table:

1. **Run the auth SQL in Supabase**  
   - Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.  
   - Copy the contents of **`supabase_auth_functions.sql`** and run it.  
   - This creates two functions so the app can look up and save users with the anon key (no service role needed).

2. **Google sign-in**  
   - In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → your OAuth client → **Authorized redirect URIs**, add:  
   - `http://localhost:3000/api/auth/callback/google`

3. **Restart the dev server** after any `.env.local` changes:  
   - `pnpm dev`

**Optional:** If you prefer to use the **service role key** instead of the SQL above, add `SUPABASE_SERVICE_ROLE_KEY` from Supabase → Settings → API to `.env.local`. Then you don’t need to run `supabase_auth_functions.sql`.
