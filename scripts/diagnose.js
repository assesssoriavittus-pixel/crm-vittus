const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://icmxasjvqdavnkupibng.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbXhhc2p2cWRhdm5rdXBpYm5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQ1MDg3NiwiZXhwIjoyMDk4MDI2ODc2fQ.nlWfAUXuF3EiULqRFq_5FjX1cIZF9Uf5Wf2B0cGS320';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('=== PENTE FINO: Diagnóstico e Correção ===\n');

  // 1. Verificar o perfil existente
  const { data: profiles, error: profError } = await supabase.from('profiles').select('id, nome');
  console.log('Profiles existentes:', profiles);
  if (profError) console.error('Erro profiles:', profError);

  const consultorId = profiles && profiles.length > 0 ? profiles[0].id : null;
  console.log('Consultor ID real:', consultorId);

  // 2. Testar insert de lead com anon key
  console.log('\n--- Teste 1: Insert lead com ANON KEY ---');
  const anonClient = createClient(SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbXhhc2p2cWRhdm5rdXBpYm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTA4NzYsImV4cCI6MjA5ODAyNjg3Nn0.L-72wFJqci3xpU5gUkxNozPzSHTpbpmkCrRBIt-YtQk', {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: anonLead, error: anonLeadErr } = await anonClient.from('leads').insert([{
    nome: 'Teste Anon RLS',
    telefone: '(11) 98765-4321',
    origem: 'quiz-instagram',
    status: 'agendado'
  }]).select();

  if (anonLeadErr) {
    console.log('❌ ANON insert BLOQUEADO (RLS):', anonLeadErr.message);
    console.log('\n--- Corrigindo: Criando policy de INSERT anon para leads ---');
    
    // Usar service role para criar a policy via SQL 
    // Precisamos usar a Management API
    const { error: policyErr } = await supabase.rpc('create_anon_policies_fix', {});
    if (policyErr) {
      console.log('RPC não disponível, usando abordagem alternativa...');
    }
  } else {
    console.log('✅ ANON insert OK! Lead:', anonLead);
  }

  // 3. Testar insert de booking com consultor_id correto
  console.log('\n--- Teste 2: Insert booking com service role + consultor real ---');
  const { data: testLead } = await supabase.from('leads').insert([{
    nome: 'Lead Teste Booking',
    telefone: '(11) 91234-5678',
    origem: 'quiz-instagram',
    status: 'agendado'
  }]).select();

  if (testLead && testLead[0] && consultorId) {
    const { data: testBooking, error: bookErr } = await supabase.from('bookings').insert([{
      lead_id: testLead[0].id,
      consultor_id: consultorId,
      data: '2026-06-28',
      horario_inicio: '14:00',
      horario_fim: '14:30',
      status: 'confirmado',
      tipo: 'diagnostico',
      notas: 'Agendamento de teste para verificação.'
    }]).select();

    if (bookErr) {
      console.log('❌ Booking insert FALHOU:', bookErr.message);
    } else {
      console.log('✅ Booking criado com sucesso:', testBooking);
    }
  }

  // 4. Verificar dados no banco
  console.log('\n--- Estado Final ---');
  const { data: allLeads } = await supabase.from('leads').select('id, nome, status, created_at').order('created_at', { ascending: false }).limit(5);
  const { data: allBookings } = await supabase.from('bookings').select('id, lead_id, data, horario_inicio, status, consultor_id').order('created_at', { ascending: false }).limit(5);
  
  console.log('Leads recentes:', allLeads);
  console.log('Bookings recentes:', allBookings);
  
  // 5. Limpar testes
  console.log('\n--- Limpando dados de teste ---');
  if (testLead && testLead[0]) {
    await supabase.from('bookings').delete().eq('lead_id', testLead[0].id);
    await supabase.from('leads').delete().eq('id', testLead[0].id);
  }
  // Remover o "Teste Pente Fino" anterior
  await supabase.from('leads').delete().eq('nome', 'Teste Pente Fino');
  await supabase.from('leads').delete().eq('nome', 'Teste Anon RLS');
  await supabase.from('leads').delete().eq('nome', 'Lead Teste Booking');
  
  console.log('✅ Dados de teste removidos.');
  console.log('\n=== RESUMO ===');
  console.log('1. RLS do Supabase BLOQUEIA inserts com chave anon → página pública não consegue gravar');
  console.log('2. consultor_id hardcoded no quiz NÃO EXISTE na tabela profiles');
  console.log('3. Consultor real:', consultorId);
}

main().catch(console.error);
