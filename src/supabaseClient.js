import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://djyuoybetlnbozihqfuj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqeXVveWJldGxuYm96aWhxZnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzE5MDMsImV4cCI6MjA4NjQwNzkwM30.TOPDaGrAKtBSenitGmU-oVvM5XDPbm6exdUEmk_y7sM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);