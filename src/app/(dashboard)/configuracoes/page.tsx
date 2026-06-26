'use client';

import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [dbStatus] = useState<'connected' | 'offline'>('offline'); // Offline since Supabase keys aren't set in env yet
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Vittus CRM</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>Configurações</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Vittus CRM</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>Configurações</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: Supabase & System Config */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Supabase Status Card */}
          <div className="glass-card" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'white' }}>Banco de Dados (Supabase)</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
              <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 600 }}>
                Executando localmente no Frontend (Simulado)
              </span>
            </div>

            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Para conectar o CRM Vittus ao seu banco de dados Supabase na nuvem e salvar os dados permanentemente, configure as variáveis de ambiente no arquivo <strong>.env.local</strong>:
            </p>

            <div style={{ background: '#101014', padding: '16px', borderRadius: '12px', fontSize: '12.5px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.8)', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
              NEXT_PUBLIC_SUPABASE_URL=seu_projeto.supabase.co<br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
            </div>
          </div>

          {/* User profile */}
          <div className="glass-card" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'white' }}>Perfil do Administrador</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Nome Completo</span>
                <input 
                  type="text" 
                  disabled
                  value="Vittus"
                  style={{ background: '#16161d', border: '1px solid rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px', color: 'white', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>E-mail Administrativo</span>
                <input 
                  type="email" 
                  disabled
                  value="sandro@vittus.com.br"
                  style={{ background: '#16161d', border: '1px solid rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px', color: 'white', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Webhook Integration for external Quiz & Site */}
        <div className="glass-card" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'white' }}>Integração do Quiz e Site</h3>
          
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5', margin: '0 0 20px 0' }}>
            Envie automaticamente as respostas do seu <strong>Quiz de Qualificação (quiz-vittus)</strong> ou formulário do <strong>Site Institucional (Site-vITTUS)</strong> para este CRM disparando uma requisição POST na API:
          </p>

          <div style={{ background: '#101014', padding: '14px', borderRadius: '12px', fontSize: '12.5px', fontFamily: 'monospace', color: 'var(--accent-primary)', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)', fontWeight: 700 }}>
            POST http://localhost:3000/api/leads
          </div>

          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '10px' }}>Exemplo de Código JS (Fetch):</h4>
          
          <div style={{ 
            background: '#101014', 
            padding: '16px', 
            borderRadius: '12px', 
            fontSize: '11.5px', 
            fontFamily: 'monospace', 
            color: 'rgba(255,255,255,0.7)', 
            overflowX: 'auto', 
            border: '1px solid rgba(255,255,255,0.05)',
            maxHeight: '260px',
            lineHeight: '1.5'
          }}>
            {`fetch('http://seu-crm.com/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nome: 'Breno Nogueira',
    email: 'breno@email.com',
    telefone: '(11) 99999-8888',
    origem: 'quiz-instagram',
    empresa: 'Breno Nutrição',
    segmento: 'Estética/Saúde',
    respostas_quiz: [
      { pergunta: 'Faturamento?', resposta: 'R$ 10k-20k' },
      { pergunta: 'Gargalo?', resposta: 'WhatsApp desorganizado' }
    ]
  })
})
.then(res => res.json())
.then(data => console.log('Lead salvo:', data));`}
          </div>
        </div>

      </div>

    </div>
  );
}
