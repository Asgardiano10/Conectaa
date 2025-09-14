import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'SUPERVISOR' | 'AGENT';
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'SUPERVISOR' | 'AGENT';
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'SUPERVISOR' | 'AGENT';
          photo_url?: string | null;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string;
          category: 'visita' | 'reuniao' | 'cobranca' | 'outro';
          status: 'planejado' | 'realizado' | 'cancelado';
          assigned_to: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string;
          category: 'visita' | 'reuniao' | 'cobranca' | 'outro';
          status: 'planejado' | 'realizado' | 'cancelado';
          assigned_to: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          category?: 'visita' | 'reuniao' | 'cobranca' | 'outro';
          status?: 'planejado' | 'realizado' | 'cancelado';
          assigned_to?: string;
          updated_at?: string;
        };
      };
      group_meta: {
        Row: {
          id: string;
          numeric_value: number;
          updated_by: string;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          numeric_value: number;
          updated_by: string;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          numeric_value?: number;
          updated_by?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          body: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          body?: string;
        };
      };
    };
  };
}
