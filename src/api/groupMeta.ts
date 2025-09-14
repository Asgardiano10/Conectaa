import { supabase } from "../lib/supabase";
import { GroupMeta } from "../types";

export async function getGroupMeta(): Promise<GroupMeta | null> {
  const { data, error } = await supabase
    .from('group_meta')
    .select('*')
    .eq('id', 'meta_principal')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as GroupMeta | null;
}

export async function updateGroupMeta(numeric_value: number, updated_by: string) {
  const { data, error } = await supabase
    .from('group_meta')
    .upsert({
      id: 'meta_principal',
      numeric_value,
      updated_by,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function subscribeGroupMeta(callback: (meta: GroupMeta | null) => void) {
  const subscription = supabase
    .from('group_meta')
    .select('*')
    .eq('id', 'meta_principal')
    .on('*', () => {
      getGroupMeta().then(callback);
    })
    .subscribe();

  // Carregar dados iniciais
  getGroupMeta().then(callback);

  return () => {
    subscription.unsubscribe();
  };
}
