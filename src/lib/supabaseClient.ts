import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://awmtvxdfnofslufnfxwx.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sua_chave_anon_aqui";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);