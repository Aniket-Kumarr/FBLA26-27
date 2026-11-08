import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ywoxezohoklcebnvjoqc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Kk9RBt2JovHDFuiiAUoz8w_8CTh3GK9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



