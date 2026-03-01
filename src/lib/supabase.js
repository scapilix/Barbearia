import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://moucwwkbwnqyzywnxzqy.supabase.co';
const supabaseKey = 'sb_publishable_WIzE0TBhocUcJoag0NQOcA_zov06QkH';

export const supabase = createClient(supabaseUrl, supabaseKey);
