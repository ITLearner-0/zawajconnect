
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://huozosbrlxayjkvakptu.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1b3pvc2JybHhheWprdmFrcHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMTA3OTIsImV4cCI6MjA1NDg4Njc5Mn0.kYARgcD2qbmoLl7D275y63JSrTb2zgpdARajsROs16g"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
