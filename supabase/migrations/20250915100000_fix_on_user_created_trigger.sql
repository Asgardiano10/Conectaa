/*
          # [CORREÇÃO] Recriação do Gatilho e Função de Novo Usuário
          Este script corrige o erro "trigger already exists" ao garantir que o gatilho e a função associada sejam removidos antes de serem recriados.
          Isso torna a migração segura para ser executada múltiplas vezes (idempotente).

          ## Query Description: 
          1. Remove o gatilho `on_auth_user_created` da tabela `auth.users` se ele existir.
          2. Remove a função `handle_new_user` do schema `public` se ela existir.
          3. Recria a função `handle_new_user` com a lógica correta para inserir um novo perfil na tabela `public.users` e atribuir a role 'SUPERVISOR' ao primeiro usuário.
          4. Recria o gatilho `on_auth_user_created` para ser acionado após a criação de um novo usuário no sistema de autenticação do Supabase.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true (pode ser revertido rodando um script que remove o gatilho e a função)
          
          ## Structure Details:
          - Tabela Afetada: `auth.users` (gatilho), `public.users` (inserção de dados)
          - Função Afetada: `public.handle_new_user`
          - Gatilho Afetado: `on_auth_user_created`
          
          ## Security Implications:
          - RLS Status: Não altera políticas de RLS existentes.
          - Policy Changes: No
          - Auth Requirements: A função é executada com os privilégios do definidor (`security definer`), permitindo que ela insira dados na tabela `public.users` em nome do sistema.
          
          ## Performance Impact:
          - Indexes: Nenhum
          - Triggers: Adiciona um gatilho na tabela `auth.users`, com impacto de performance insignificante, pois só é acionado na criação de novos usuários.
          - Estimated Impact: Mínimo.
          */

-- 1. Remove o gatilho e a função existentes para evitar conflitos.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Cria a função para manipular a criação de um novo usuário.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  user_role TEXT;
BEGIN
  -- Verifica quantos usuários já existem na tabela public.users
  SELECT count(*) INTO user_count FROM public.users;

  -- Se for o primeiro usuário, atribui a role 'SUPERVISOR', senão 'AGENT'
  IF user_count = 0 THEN
    user_role := 'SUPERVISOR';
  ELSE
    user_role := 'AGENT';
  END IF;

  -- Insere o novo usuário na tabela public.users
  INSERT INTO public.users (id, email, name, role, photo_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    user_role::public.user_role, -- Garante que o tipo do enum está correto
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  RETURN NEW;
END;
$$;

-- 3. Cria o gatilho que chama a função após um novo usuário ser criado na autenticação.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
