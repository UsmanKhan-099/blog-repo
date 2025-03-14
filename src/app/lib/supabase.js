// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gytqjzbeclxsjbwxrpaq.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dHFqemJlY2x4c2pid3hycGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4OTA3NjYsImV4cCI6MjA1NzQ2Njc2Nn0.QVeeu2Jo7cX66MDJFf2EtGKS9EgM_YrdyZAZ6eXreaY'; // Replace with your Supabase public API key
export  const supabase = createClient(supabaseUrl, supabaseKey);
