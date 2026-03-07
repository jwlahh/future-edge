import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ximcpnibsfpvuvtnqpmu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpbWNwbmlic2ZwdnV2dG5xcG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MjM2OTksImV4cCI6MjA4NTA5OTY5OX0._RYF0Zrru-ZuFm7iYhjO5klsV6ykK4UJI6SQ7ccuj8w";

export const supabase = createClient(supabaseUrl, supabaseKey);