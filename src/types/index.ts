export interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPERVISOR' | 'AGENT';
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id?: string;
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
}

export interface GroupMeta {
  id: string;
  numeric_value: number;
  updated_by: string;
  updated_at: string;
  created_at: string;
}

export interface Notification {
  id?: string;
  title: string;
  body: string;
  created_by: string;
  created_at: string;
}
