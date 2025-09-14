import { supabase } from "../lib/supabase";
import { Notification } from "../types";

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notification])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Notification[];
}

export function subscribeNotifications(callback: (notifications: Notification[]) => void) {
  const subscription = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .on('*', () => {
      getNotifications().then(callback);
    })
    .subscribe();

  // Carregar dados iniciais
  getNotifications().then(callback);

  return () => {
    subscription.unsubscribe();
  };
}
