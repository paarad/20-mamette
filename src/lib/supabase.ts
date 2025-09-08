import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on the schema from PRD
export interface User {
  id: string;
  email: string;
  plan: 'free' | 'creator' | 'pro';
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  author: string;
  genre: string;
  vibe: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  project_id: string;
  provider: 'dalle' | 'midjourney';
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  images: string[];
  created_at: string;
}

export interface Asset {
  id: string;
  generation_id: string;
  url: string;
  format: 'ebook' | 'print' | 'square';
  size: string;
  created_at: string;
}

export interface Favorite {
  user_id: string;
  asset_id: string;
  created_at: string;
} 