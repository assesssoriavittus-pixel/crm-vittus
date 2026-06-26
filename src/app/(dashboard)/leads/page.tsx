'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';
import { LEAD_STATUS_CONFIG, LEAD_ORIGEM_LABELS, KANBAN_COLUMN_ORDER } from '@/lib/constants';
import { Lead, LeadStatus, LeadOrigem } from '@/types';

export default function LeadsPage() {
  const { leads, updateLeadStatus, addLead } = useCRM();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for new lead
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadSegment, setNewLeadSegment] = useState('');
  const [newLeadValue, setNewLeadValue] = useState(3000);
  const [newLeadOrigin, setNewLeadOrigin] = useState<LeadOrigem>('quiz-instagram');

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) return;

    addLead({
      nome: newLeadName,
      email: newLeadEmail || null,
      telefone: newLeadPhone || null,
      origem: newLeadOrigin,
      status: 'novo',
      responsavel_id: 'prof-2', // Default to Vitória
      respostas_quiz: null,
      empresa: newLeadCompany || null,
      segmento: newLeadSegment || null,
      notas: 'Lead criado manualmente.',
      valor_estimado: Number(newLeadValue),
      motivo_perda: null
    });

    // Reset Form
    setNewLeadName('');
    setNewLeadEmail('');
    setNewLeadPhone('');
    setNewLeadCompany('');
    setNewLeadSegment('');
    setNewLeadValue(3000);
    setNewLeadOrigin('quiz-instagram');
    setIsNewLeadModalOpen(false);
  };

  if (!isMounted) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Vittus CRM</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>Quadro de Leads</h1>
        </div>
      </div>
    );
  }



  // Filter leads by search query
  const filteredLeads = leads.filter(lead => 
    lead.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.empresa && lead.empresa.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (lead.segmento && lead.segmento.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: 'calc(100vh - var(--header-height))' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Vittus CRM</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>Quadro de Leads</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', width: '250px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#16161d',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '100px',
                padding: '8px 12px 8px 36px',
                color: 'white',
                fontSize: '12.5px',
                outline: 'none'
              }}
            />
          </div>

          <button 
            onClick={() => setIsNewLeadModalOpen(true)}
            className="btn btn-primary"
            style={{ fontWeight: 700, padding: '10px 20px' }}
          >
            + Novo Lead
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        overflowX: 'auto', 
        paddingBottom: '16px',
        flex: 1,
        alignItems: 'flex-start'
      }}>
        {KANBAN_COLUMN_ORDER.map((columnId) => {
          const colConfig = LEAD_STATUS_CONFIG[columnId];
          const columnLeads = filteredLeads.filter(lead => lead.status === columnId);
          const columnTotalValue = columnLeads.reduce((sum, l) => sum + (l.valor_estimado || 0), 0);

          return (
            <div 
              key={columnId}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.background = '#181822';
                e.currentTarget.style.borderColor = 'rgba(0, 102, 255, 0.15)';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.background = '#13131a';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.background = '#13131a';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
                const leadId = e.dataTransfer.getData('text/plain');
                if (leadId) {
                  updateLeadStatus(leadId, columnId);
                }
              }}
              style={{
                width: '280px',
                flexShrink: 0,
                background: '#13131a',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid rgba(255,255,255,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: 'calc(100vh - 200px)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: colConfig.color
                  }}></span>
                  <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'white' }}>{colConfig.label}</h3>
                  <span style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.4)',
                    padding: '2px 6px',
                    borderRadius: '100px',
                    fontSize: '10px',
                    fontWeight: 700
                  }}>
                    {columnLeads.length}
                  </span>
                </div>
              </div>

              {/* Column Value Sum */}
              {columnTotalValue > 0 && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginTop: '-4px' }}>
                  R$ {columnTotalValue.toLocaleString('pt-BR')}
                </div>
              )}

              {/* Cards Container */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px', 
                overflowY: 'auto',
                paddingRight: '2px'
              }}>
                {columnLeads.map((lead) => (
                  <div 
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', lead.id);
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    style={{
                      background: '#1c1c24',
                      border: '1px solid rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'grab',
                      transition: 'transform 0.15s, border-color 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'white', margin: 0 }}>{lead.nome}</h4>
                      {lead.empresa && (
                        <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.4)', display: 'block', marginTop: '2px' }}>
                          {lead.empresa}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.6)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '9.5px',
                        fontWeight: 600
                      }}>
                        {LEAD_ORIGEM_LABELS[lead.origem]}
                      </span>

                      {lead.valor_estimado && (
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>
                          R$ {lead.valor_estimado.toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>

                    {/* Quiz answers flag */}
                    {lead.respostas_quiz && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontSize: '10px', fontWeight: 600, marginTop: '2px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <span>Quiz Respondido</span>
                      </div>
                    )}
                  </div>
                ))}

                {columnLeads.length === 0 && (
                  <div style={{
                    border: '1.5px dashed rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    padding: '24px 12px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '11.5px'
                  }}>
                    Arraste ou crie leads
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL 1: Lead Details (with status changer) --- */}
      {selectedLead && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#16161d',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '550px',
            padding: '32px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>
                  Ficha do Lead Vittus
                </span>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginTop: '4px' }}>
                  {selectedLead.nome}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '20px',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Status Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#101014', padding: '12px 16px', borderRadius: '12px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Status do Funil:</span>
              <select 
                value={selectedLead.status}
                onChange={(e) => {
                  updateLeadStatus(selectedLead.id, e.target.value as LeadStatus);
                  setSelectedLead({ ...selectedLead, status: e.target.value as LeadStatus });
                }}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {KANBAN_COLUMN_ORDER.map(status => (
                  <option key={status} value={status} style={{ background: '#16161d' }}>
                    {LEAD_STATUS_CONFIG[status].label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '2px' }}>Empresa</span>
                <span style={{ fontWeight: 600, color: 'white' }}>{selectedLead.empresa || 'Não informada'}</span>
              </div>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '2px' }}>Segmento</span>
                <span style={{ fontWeight: 600, color: 'white' }}>{selectedLead.segmento || 'Não informado'}</span>
              </div>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '2px' }}>WhatsApp / Telefone</span>
                <span style={{ fontWeight: 600, color: 'white' }}>{selectedLead.telefone || 'Não informado'}</span>
              </div>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '2px' }}>E-mail</span>
                <span style={{ fontWeight: 600, color: 'white' }}>{selectedLead.email || 'Não informado'}</span>
              </div>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '2px' }}>Origem</span>
                <span style={{ fontWeight: 600, color: 'white' }}>{LEAD_ORIGEM_LABELS[selectedLead.origem]}</span>
              </div>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '2px' }}>Valor Comercial</span>
                <span style={{ fontWeight: 700, color: 'var(--status-success)' }}>
                  R$ {selectedLead.valor_estimado ? selectedLead.valor_estimado.toLocaleString('pt-BR') : '0'}
                </span>
              </div>
            </div>

            {/* Quiz Responses */}
            {selectedLead.respostas_quiz && selectedLead.respostas_quiz.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
                  Respostas do Quiz de Qualificação (Vittus)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedLead.respostas_quiz.map((resp, i) => (
                    <div key={i} style={{ fontSize: '12.5px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{resp.pergunta}</div>
                      <div style={{ color: 'white', fontWeight: 600, marginTop: '2px' }}>{resp.resposta}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span style={{ color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '6px', fontSize: '13px' }}>Notas Internas</span>
              <p style={{ background: '#101014', padding: '12px', borderRadius: '8px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: '1.4' }}>
                {selectedLead.notas || 'Sem observações adicionais.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button 
                onClick={() => setSelectedLead(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  borderRadius: '100px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 2: Create Lead --- */}
      {isNewLeadModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <form 
            onSubmit={handleCreateLead}
            style={{
              background: '#16161d',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '500px',
              padding: '32px',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>Novo Lead Comercial</h3>
              <button 
                type="button"
                onClick={() => setIsNewLeadModalOpen(false)}
                style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                Nome do Lead *
              </label>
              <input 
                type="text" 
                required
                value={newLeadName}
                onChange={(e) => setNewLeadName(e.target.value)}
                placeholder="Ex: Roberto Silva"
                style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                  WhatsApp / Telefone
                </label>
                <input 
                  type="text" 
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  placeholder="Ex: (11) 98888-7777"
                  style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                  E-mail
                </label>
                <input 
                  type="email" 
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                  placeholder="Ex: roberto@empresa.com"
                  style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Empresa
                </label>
                <input 
                  type="text" 
                  value={newLeadCompany}
                  onChange={(e) => setNewLeadCompany(e.target.value)}
                  placeholder="Ex: Silva E-commerce"
                  style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Segmento
                </label>
                <input 
                  type="text" 
                  value={newLeadSegment}
                  onChange={(e) => setNewLeadSegment(e.target.value)}
                  placeholder="Ex: Infoprodutos"
                  style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Origem do Lead
                </label>
                <select 
                  value={newLeadOrigin}
                  onChange={(e) => setNewLeadOrigin(e.target.value as LeadOrigem)}
                  style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none' }}
                >
                  <option value="quiz-instagram">Quiz Instagram</option>
                  <option value="site">Site Institucional</option>
                  <option value="manual">Manual</option>
                  <option value="indicacao">Indicação</option>
                  <option value="google">Google Ads</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Valor Estimado (R$)
                </label>
                <input 
                  type="number" 
                  value={newLeadValue}
                  onChange={(e) => setNewLeadValue(Number(e.target.value))}
                  style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button 
                type="button"
                onClick={() => setIsNewLeadModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  borderRadius: '100px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #0052cc 0%, #0066ff 100%)',
                  color: 'white',
                  borderRadius: '100px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                Cadastrar Lead
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
