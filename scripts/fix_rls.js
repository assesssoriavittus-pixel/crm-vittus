const { createClient } = require('@supabase/supabase-js');

// Script para criar as RLS policies que permitem inserts anônimos
// Executa via Supabase Management API (Dashboard SQL Editor equivalent)

const SUPABASE_URL = 'https://icmxasjvqdavnkupibng.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbXhhc2p2cWRhdm5rdXBpYm5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQ1MDg3NiwiZXhwIjoyMDk4MDI2ODc2fQ.nlWfAUXuF3EiULqRFq_5FjX1cIZF9Uf5Wf2B0cGS320';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbXhhc2p2cWRhdm5rdXBpYm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTA4NzYsImV4cCI6MjA5ODAyNjg3Nn0.L-72wFJqci3xpU5gUkxNozPzSHTpbpmkCrRBIt-YtQk';

const REAL_CONSULTOR_ID = '0a7a950a-99c0-4162-8b3a-86a158574480';

async function fixRLS() {
  console.log('=== Corrigindo RLS via Management API ===\n');
  
  // Use the Supabase Management API to run SQL
  const projectRef = 'icmxasjvqdavnkupibng';
  
  // First, try to get a Supabase access token 
  // We'll use the Management API at https://api.supabase.com/v1/projects/{ref}/database/query
  
  const sql = `
    -- Allow anonymous inserts into leads
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'leads_insert_anon' AND tablename = 'leads') THEN
        CREATE POLICY leads_insert_anon ON public.leads FOR INSERT TO anon WITH CHECK (true);
      END IF;
    END $$;

    -- Allow anonymous inserts into bookings
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bookings_insert_anon' AND tablename = 'bookings') THEN
        CREATE POLICY bookings_insert_anon ON public.bookings FOR INSERT TO anon WITH CHECK (true);
      END IF;
    END $$;

    -- Allow anonymous selects on bookings (for slot availability)
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bookings_select_anon' AND tablename = 'bookings') THEN
        CREATE POLICY bookings_select_anon ON public.bookings FOR SELECT TO anon USING (true);
      END IF;
    END $$;
    
    -- Allow anonymous selects on leads (for checking duplicates)
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'leads_select_anon' AND tablename = 'leads') THEN
        CREATE POLICY leads_select_anon ON public.leads FOR SELECT TO anon USING (true);
      END IF;
    END $$;

    -- Make consultor_id nullable in bookings to avoid FK issues from public form
    ALTER TABLE public.bookings ALTER COLUMN consultor_id DROP NOT NULL;
  `;

  // Try using the management API
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });
    
    const text = await response.text();
    console.log('Management API response:', response.status, text.substring(0, 300));
  } catch (err) {
    console.log('Management API not available:', err.message);
  }
}

async function testAndFix() {
  await fixRLS();
  
  console.log('\n=== Testando insert anon APÓS correção ===');
  const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const { data, error } = await anonClient.from('leads').insert([{
    nome: 'Teste Pós-Fix',
    telefone: '(11) 99999-1111',
    origem: 'quiz-instagram',
    status: 'agendado'
  }]).select();
  
  if (error) {
    console.log('❌ Ainda bloqueado:', error.message);
    console.log('\n⚠️  PRECISA EXECUTAR O SQL MANUALMENTE NO SUPABASE DASHBOARD');
    console.log('Vá em: https://supabase.com/dashboard/project/icmxasjvqdavnkupibng/sql/new');
    console.log('Cole e execute o seguinte SQL:\n');
    console.log(`
-- Permitir inserts anônimos (página pública de agendamento)
CREATE POLICY IF NOT EXISTS leads_insert_anon ON public.leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY IF NOT EXISTS leads_select_anon ON public.leads FOR SELECT TO anon USING (true);
CREATE POLICY IF NOT EXISTS bookings_insert_anon ON public.bookings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY IF NOT EXISTS bookings_select_anon ON public.bookings FOR SELECT TO anon USING (true);
`);
  } else {
    console.log('✅ Insert anon agora funciona!', data);
    // Limpar teste
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
    await serviceClient.from('leads').delete().eq('nome', 'Teste Pós-Fix');
  }
}

testAndFix().catch(console.error);
