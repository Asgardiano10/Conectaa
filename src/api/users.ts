import { supabase } from "../lib/supabase";
import { User } from "../types";

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as User[];
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as User | null;
}

export function subscribeUsers(callback: (users: User[]) => void) {
  const subscription = supabase
    .channel('public:users')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
      getUsers().then(callback);
    })
    .subscribe();

  // Carregar dados iniciais
  getUsers().then(callback);

  return () => {
    supabase.removeChannel(subscription);
  };
}
