-- Move pg_net extension from public to extensions schema
-- This improves security and follows Supabase best practices

-- Ensure extensions schema exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop extension from public schema
-- Note: pg_net creates its own 'net' schema for functions, so net.http_post() will continue to work
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Recreate extension in extensions schema
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Restrict CREATE privilege on public schema to prevent future misuse
REVOKE CREATE ON SCHEMA public FROM PUBLIC;