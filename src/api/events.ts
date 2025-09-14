import { supabase } from "../lib/supabase";
import { Event } from "../types";

export async function createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, data: Partial<Event>) {
  const { error } = await supabase
    .from('events')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getEvents({ assigned_to, category, start_date, end_date }: { 
  assigned_to?: string; 
  category?: string; 
  start_date?: string; 
  end_date?: string; 
}) {
  let query = supabase
    .from('events')
    .select('*')
    .order('start_date');

  if (assigned_to) query = query.eq('assigned_to', assigned_to);
  if (category) query = query.eq('category', category);
  if (start_date) query = query.gte('start_date', start_date);
  if (end_date) query = query.lte('end_date', end_date);

  const { data, error } = await query;
  if (error) throw error;
  return data as Event[];
}

export function subscribeEvents({ 
  assigned_to, 
  callback 
}: { 
  assigned_to?: string; 
  callback: (events: Event[]) => void; 
}) {
  let query = supabase
    .from('events')
    .select('*')
    .order('start_date');

  if (assigned_to) {
    query = query.eq('assigned_to', assigned_to);
  }

  const subscription = query.on('*', () => {
    // Recarregar dados quando houver mudanças
    getEvents({ assigned_to }).then(callback);
  }).subscribe();

  // Carregar dados iniciais
  getEvents({ assigned_to }).then(callback);

  return () => {
    subscription.unsubscribe();
  };
}
