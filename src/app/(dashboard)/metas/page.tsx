'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';

export default function GoalsPage() {
  const { goals, updateGoalProgress } = useCRM();
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<number>(0);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSaveProgress = (goalId: string) => {
    updateGoalProgress(goalId, Number(editingValue));
    setEditingGoalId(null);
  };

  if (!isMounted) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Vittus CRM</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>Metas & Performance</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Vittus CRM</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>Metas & Performance</h1>
      </div>

      {/* Goals grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {goals.map((goal) => {
          const percentage = Math.min(Math.round((goal.valor_atual / goal.meta_valor) * 100), 100);
          
          return (
            <div 
              key={goal.id} 
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{
                    background: 'rgba(0, 102, 255, 0.1)',
                    color: 'var(--accent-primary)',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '100px',
                    textTransform: 'uppercase'
                  }}>
                    Meta Coletiva ({goal.periodo})
                  </span>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginTop: '8px', textTransform: 'capitalize' }}>
                    {goal.tipo === 'faturamento' ? 'Faturamento Mensal' : 'Leads Convertidos'}
                  </h3>
                </div>

                <span style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>
                  {percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: 'linear-gradient(135deg, #0047ab 0%, #00d4ff 100%)',
                    borderRadius: '100px',
                    boxShadow: 'var(--glow-blue)',
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                  <span>
                    Atual: <strong>
                      {goal.tipo === 'faturamento' ? `R$ ${goal.valor_atual.toLocaleString('pt-BR')}` : `${goal.valor_atual} leads`}
                    </strong>
                  </span>
                  <span>
                    Meta: <strong>
                      {goal.tipo === 'faturamento' ? `R$ ${goal.meta_valor.toLocaleString('pt-BR')}` : `${goal.meta_valor} leads`}
                    </strong>
                  </span>
                </div>
              </div>

              <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.05)', margin: 0 }} />

              {/* Edit Progress Area */}
              <div>
                {editingGoalId === goal.id ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="number"
                      value={editingValue}
                      onChange={(e) => setEditingValue(Number(e.target.value))}
                      style={{
                        background: '#16161d',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'white',
                        fontSize: '13px',
                        flex: 1,
                        outline: 'none'
                      }}
                    />
                    <button 
                      onClick={() => handleSaveProgress(goal.id)}
                      style={{
                        background: 'var(--status-success)',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '12.5px',
                        fontWeight: 700
                      }}
                    >
                      Salvar
                    </button>
                    <button 
                      onClick={() => setEditingGoalId(null)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '12.5px',
                        fontWeight: 600
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setEditingGoalId(goal.id);
                      setEditingValue(goal.valor_atual);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      color: 'white',
                      borderRadius: '8px',
                      padding: '10px',
                      width: '100%',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    Ajustar Progresso da Meta
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
