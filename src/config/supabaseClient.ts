import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://swhjkrdhmkdwpmmvuuji.supabase.co';
const supabaseAnonKey = 'sb_publishable_GkV_bY-ofJE58B02KFJXiA_yYSTAF-H';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
