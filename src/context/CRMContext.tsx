'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, Booking, Sale, Goal, Profile, LeadStatus, LeadOrigem } from '@/types';

interface CRMContextType {
  leads: Lead[];
  bookings: Booking[];
  sales: Sale[];
  goals: Goal[];
  team: Profile[];
  addLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  addSale: (sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => void;
  updateGoalProgress: (goalId: string, value: number) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

// Real-looking Vittus data (no dummy lorem-ipsum placeholder text, actual lead values)
const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    nome: 'Rodrigo Santos',
    email: 'rodrigo@modasport.com.br',
    telefone: '(11) 98765-4321',
    origem: 'quiz-instagram',
    status: 'fechado',
    responsavel_id: 'prof-2', // Vitória
    empresa: 'Moda Sport E-commerce',
    segmento: 'E-commerce / Varejo',
    notas: 'Lead muito interessado. Estava buscando assessoria de tráfego pago completo para escala de vendas.',
    valor_estimado: 5000,
    respostas_quiz: [
      { pergunta: 'Qual o faturamento mensal?', resposta: 'R$ 30k a R$ 50k' },
      { pergunta: 'Qual o maior gargalo comercial?', resposta: 'Falta de processos e CRM' },
      { pergunta: 'Já investe em tráfego pago?', resposta: 'Sim, mais de R$ 5k/mês' }
    ],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead-2',
    nome: 'Sofia Oliveira',
    email: 'contato@clinicasofia.com.br',
    telefone: '(21) 97123-4567',
    origem: 'site',
    status: 'agendado',
    responsavel_id: 'prof-1', // Sandro
    empresa: 'Clínica Sofia Aesthetics',
    segmento: 'Saúde & Estética',
    notas: 'Quer estruturar o CRM e treinar a secretária para fechar mais agendamentos via WhatsApp.',
    valor_estimado: 3800,
    respostas_quiz: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead-3',
    nome: 'Marcos Souza',
    email: 'marcos@souzaadvocacia.com.br',
    telefone: '(31) 99888-1122',
    origem: 'indicacao',
    status: 'proposta',
    responsavel_id: 'prof-3', // Carlos
    empresa: 'Souza & Associados',
    segmento: 'Serviços Jurídicos',
    notas: 'Apresentada proposta de funil de vendas automatizado e CRM Vittus estruturado.',
    valor_estimado: 6000,
    respostas_quiz: null,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead-4',
    nome: 'Annette Black',
    email: 'annette.b@infocursodigital.com',
    telefone: '(11) 96622-4455',
    origem: 'quiz-instagram',
    status: 'em_reuniao',
    responsavel_id: 'prof-2', // Vitória
    empresa: 'Info Cursos Digitais',
    segmento: 'Infoprodutos / Educação',
    notas: 'Interesse em mentoria de escala e implementação comercial completa da Vittus.',
    valor_estimado: 12000,
    respostas_quiz: [
      { pergunta: 'Qual o faturamento mensal?', resposta: 'Mais de R$ 100k' },
      { pergunta: 'Qual o maior gargalo comercial?', resposta: 'Equipe de vendas desorganizada' },
      { pergunta: 'Tem equipe de SDR/Inside Sales?', resposta: 'Sim, 3 pessoas' }
    ],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead-5',
    nome: 'Albert Flores',
    email: 'albert.flores@floresimobiliaria.com.br',
    telefone: '(41) 99555-8888',
    origem: 'google',
    status: 'novo',
    responsavel_id: null,
    empresa: 'Flores & Associados Imóveis',
    segmento: 'Imobiliário',
    notas: 'Lead cadastrado pelo formulário do Google Ads querendo assessoria de tráfego local.',
    valor_estimado: 4000,
    respostas_quiz: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead-6',
    nome: 'Breno Nogueira',
    email: 'breno@brenonutri.com',
    telefone: '(81) 98111-2222',
    origem: 'quiz-instagram',
    status: 'novo',
    responsavel_id: null,
    empresa: 'Consultório Nutrição Esportiva',
    segmento: 'Saúde & Estética',
    notas: 'Quer atrair mais pacientes particulares pelo Instagram e qualificar os agendamentos.',
    valor_estimado: 2500,
    respostas_quiz: [
      { pergunta: 'Qual o faturamento mensal?', resposta: 'R$ 10k a R$ 20k' },
      { pergunta: 'Qual o maior gargalo comercial?', resposta: 'Lidar com curiosos no direct' },
      { pergunta: 'Já investe em tráfego pago?', resposta: 'Não' }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead-7',
    nome: 'Camila Duarte',
    email: 'camila@duartecorretora.com.br',
    telefone: '(11) 97456-1234',
    origem: 'site',
    status: 'perdido',
    responsavel_id: 'prof-3',
    empresa: 'Duarte Seguros',
    segmento: 'Serviços Financeiros',
    notas: 'Desistiu por falta de orçamento no momento. Salvar para follow-up em 6 meses.',
    valor_estimado: 3000,
    motivo_perda: 'Sem orçamento',
    respostas_quiz: null,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const INITIAL_TEAM: Profile[] = [
  {
    id: 'prof-1',
    nome: 'Sandro',
    email: 'sandro@vittus.com.br',
    telefone: '(11) 99999-0001',
    cargo: 'Diretor / Admin',
    role: 'admin',
    avatar_url: null,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prof-2',
    nome: 'Vitória',
    email: 'vitoria@vittus.com.br',
    telefone: '(11) 99999-0002',
    cargo: 'Gestora Comercial',
    role: 'gestor',
    avatar_url: null,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prof-3',
    nome: 'Carlos',
    email: 'carlos@vittus.com.br',
    telefone: '(11) 99999-0003',
    cargo: 'Consultor de Vendas',
    role: 'vendedor',
    avatar_url: null,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book-1',
    lead_id: 'lead-2', // Sofia Oliveira
    consultor_id: 'prof-1', // Sandro
    data: new Date().toISOString().split('T')[0], // Today
    horario_inicio: '10:00',
    horario_fim: '10:30',
    status: 'confirmado',
    tipo: 'diagnostico',
    zoom_link: 'https://zoom.us/j/vittus-diagnostico-sofia',
    notas: 'Diagnóstico Comercial de 30 minutos via Zoom',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-2',
    lead_id: 'lead-4', // Annette Black
    consultor_id: 'prof-2', // Vitória
    data: new Date().toISOString().split('T')[0], // Today
    horario_inicio: '14:30',
    horario_fim: '15:00',
    status: 'confirmado',
    tipo: 'diagnostico',
    zoom_link: 'https://zoom.us/j/vittus-diagnostico-annette',
    notas: 'Análise de funil comercial e infraestrutura de vendas',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-3',
    lead_id: 'lead-3', // Marcos Souza
    consultor_id: 'prof-3', // Carlos
    data: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    horario_inicio: '16:00',
    horario_fim: '16:30',
    status: 'confirmado',
    tipo: 'proposta',
    zoom_link: 'https://zoom.us/j/vittus-proposta-marcos',
    notas: 'Apresentação da proposta comercial final da Vittus',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    lead_id: 'lead-1', // Rodrigo Santos
    vendedor_id: 'prof-2',
    servico_id: 'serv-1',
    servico_nome: 'Assessoria de Tráfego Pago',
    valor: 5000,
    parcelas: 1,
    status: 'fechado',
    data_fechamento: new Date().toISOString().split('T')[0],
    notas: 'Mensalidade recorrente de R$ 5.000 para escala comercial.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sale-2',
    lead_id: 'lead-3',
    vendedor_id: 'prof-3',
    servico_id: 'serv-2',
    servico_nome: 'Estruturação Comercial (CRM/Processos)',
    valor: 8000,
    parcelas: 2,
    status: 'negociacao',
    data_fechamento: null,
    notas: 'Negociando parcelamento em 3x no boleto.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    user_id: null, // Meta Coletiva Vittus
    tipo: 'faturamento',
    meta_valor: 50000,
    valor_atual: 14500,
    periodo: 'mensal',
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    data_fim: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: 'goal-2',
    user_id: null,
    tipo: 'leads_convertidos',
    meta_valor: 30,
    valor_atual: 12,
    periodo: 'mensal',
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    data_fim: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  }
];

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [team] = useState<Profile[]>(INITIAL_TEAM);

  // Load from LocalStorage
  useEffect(() => {
    const savedLeads = localStorage.getItem('vittus_leads');
    const savedBookings = localStorage.getItem('vittus_bookings');
    const savedSales = localStorage.getItem('vittus_sales');
    const savedGoals = localStorage.getItem('vittus_goals');

    if (savedLeads) setLeads(JSON.parse(savedLeads));
    if (savedBookings) setBookings(JSON.parse(savedBookings));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, []);

  // Save changes helper
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newLead, ...leads];
    setLeads(updated);
    saveToStorage('vittus_leads', updated);
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    const updated = leads.map((lead) => {
      if (lead.id === leadId) {
        return { ...lead, status, updated_at: new Date().toISOString() };
      }
      return lead;
    });
    setLeads(updated);
    saveToStorage('vittus_leads', updated);

    // If status changes to 'fechado', auto-generate a sales record if none exists
    if (status === 'fechado') {
      const existingSale = sales.find((s) => s.lead_id === leadId);
      if (!existingSale) {
        const lead = leads.find((l) => l.id === leadId);
        addSale({
          lead_id: leadId,
          vendedor_id: lead?.responsavel_id || 'prof-2', // Default to Vitória
          servico_id: 'serv-generic',
          servico_nome: lead?.segmento === 'E-commerce / Varejo' ? 'Assessoria de Tráfego Pago' : 'Estruturação Comercial (CRM/Processos)',
          valor: lead?.valor_estimado || 4000,
          parcelas: 1,
          status: 'fechado',
          data_fechamento: new Date().toISOString().split('T')[0],
          notas: `Faturamento automático após lead ser marcado como ganho/fechado no pipeline.`
        });
      }
    }
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `book-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [...bookings, newBooking];
    setBookings(updated);
    saveToStorage('vittus_bookings', updated);

    // Auto-update lead status to 'agendado' if lead_id is present
    if (bookingData.lead_id) {
      updateLeadStatus(bookingData.lead_id, 'agendado');
    }
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        // If booking is realized, we can mark the lead status as 'em_reuniao'
        if (status === 'realizado' && b.lead_id) {
          setTimeout(() => updateLeadStatus(b.lead_id!, 'em_reuniao'), 50);
        }
        return { ...b, status, updated_at: new Date().toISOString() };
      }
      return b;
    });
    setBookings(updated);
    saveToStorage('vittus_bookings', updated);
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => {
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newSale, ...sales];
    setSales(updated);
    saveToStorage('vittus_sales', updated);

    // Update goals current value
    if (saleData.status === 'fechado') {
      const faturamentoGoal = goals.find((g) => g.tipo === 'faturamento');
      if (faturamentoGoal) {
        updateGoalProgress(faturamentoGoal.id, faturamentoGoal.valor_atual + saleData.valor);
      }
      const leadsGoal = goals.find((g) => g.tipo === 'leads_convertidos');
      if (leadsGoal) {
        updateGoalProgress(leadsGoal.id, leadsGoal.valor_atual + 1);
      }
    }
  };

  const updateGoalProgress = (goalId: string, value: number) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        return { ...g, valor_atual: value };
      }
      return g;
    });
    setGoals(updated);
    saveToStorage('vittus_goals', updated);
  };

  return (
    <CRMContext.Provider
      value={{
        leads,
        bookings,
        sales,
        goals,
        team,
        addLead,
        updateLeadStatus,
        addBooking,
        updateBookingStatus,
        addSale,
        updateGoalProgress,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
