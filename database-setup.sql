-- Configuração das tabelas no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela de usuários (complementa auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('SUPERVISOR', 'AGENT')) NOT NULL DEFAULT 'AGENT',
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de eventos
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT CHECK (category IN ('visita', 'reuniao', 'cobranca', 'outro')) NOT NULL,
  status TEXT CHECK (status IN ('planejado', 'realizado', 'cancelado')) DEFAULT 'planejado',
  assigned_to UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de meta do grupo
CREATE TABLE public.group_meta (
  id TEXT PRIMARY KEY DEFAULT 'meta_principal',
  numeric_value INTEGER NOT NULL DEFAULT 5000,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de notificações
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Inserir meta inicial
INSERT INTO public.group_meta (id, numeric_value) VALUES ('meta_principal', 5000);

-- 6. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Triggers para updated_at
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER group_meta_updated_at
  BEFORE UPDATE ON public.group_meta
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 8. Função para criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, photo_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'AGENT'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 10. Políticas RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Supervisors can update any profile" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'SUPERVISOR'
    )
  );

-- Políticas para events
CREATE POLICY "Users can view all events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Supervisors can update any event" ON public.events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'SUPERVISOR'
    )
  );

CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Supervisors can delete any event" ON public.events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'SUPERVISOR'
    )
  );

-- Políticas para group_meta
CREATE POLICY "Users can view group meta" ON public.group_meta
  FOR SELECT USING (true);

CREATE POLICY "Supervisors can update group meta" ON public.group_meta
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'SUPERVISOR'
    )
  );

-- Políticas para notifications
CREATE POLICY "Users can view notifications" ON public.notifications
  FOR SELECT USING (true);

CREATE POLICY "Supervisors can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'SUPERVISOR'
    )
  );

CREATE POLICY "Supervisors can delete notifications" ON public.notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'SUPERVISOR'
    )
  );
