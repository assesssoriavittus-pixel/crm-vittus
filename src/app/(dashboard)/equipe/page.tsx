'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';

export default function TeamPage() {
  const { team, leads, bookings, sales } = useCRM();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Vittus CRM</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>Sua Equipe</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Vittus CRM</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>Sua Equipe</h1>
      </div>

      {/* Team Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {team.map((member) => {
          // Calculate specific member stats
          const memberLeads = leads.filter(l => l.responsavel_id === member.id);
          const memberBookings = bookings.filter(b => b.consultor_id === member.id);
          const memberSales = sales.filter(s => s.vendedor_id === member.id && s.status === 'fechado');
          const totalSalesValue = memberSales.reduce((sum, s) => sum + s.valor, 0);

          return (
            <div 
              key={member.id} 
              className="glass-card" 
              style={{ 
                borderRadius: '20px', 
                background: '#13131a', 
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Profile Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%', 
                  background: member.role === 'admin' ? 'linear-gradient(135deg, #0047ab 0%, #00d4ff 100%)' : 'linear-gradient(135deg, #002255 0%, #0056d6 100%)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: 'white',
                  fontSize: '20px'
                }}>
                  {member.nome.charAt(0)}
                </div>

                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', margin: 0 }}>{member.nome}</h3>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                    {member.cargo}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                <div>Email: <strong style={{ color: 'white' }}>{member.email}</strong></div>
                <div>Whatsapp: <strong style={{ color: 'white' }}>{member.telefone || 'Não informado'}</strong></div>
              </div>

              <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.05)', margin: 0 }} />

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>Leads</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginTop: '4px' }}>{memberLeads.length}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>Agenda</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginTop: '4px' }}>{memberBookings.length}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>Vendas</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--status-success)', marginTop: '4px' }}>
                    R$ {totalSalesValue >= 1000 ? `${(totalSalesValue/1000).toFixed(0)}k` : totalSalesValue}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
