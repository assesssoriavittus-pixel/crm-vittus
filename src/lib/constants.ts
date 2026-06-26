import { type LeadStatus, type LeadOrigem, type NavItem } from '@/types';

// ---- Lead Status Configuration ----

export const LEAD_STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; color: string; bgColor: string }
> = {
  novo: { label: 'Novo', color: '#00d4ff', bgColor: 'rgba(0, 212, 255, 0.15)' },
  qualificado: { label: 'Qualificado', color: '#0056d6', bgColor: 'rgba(0, 86, 214, 0.15)' },
  agendado: { label: 'Agendado', color: '#ffd600', bgColor: 'rgba(255, 214, 0, 0.15)' },
  em_reuniao: { label: 'Em Reunião', color: '#ff9100', bgColor: 'rgba(255, 145, 0, 0.15)' },
  proposta: { label: 'Proposta', color: '#00b0ff', bgColor: 'rgba(0, 176, 255, 0.15)' },
  fechado: { label: 'Fechado', color: '#00c853', bgColor: 'rgba(0, 200, 83, 0.15)' },
  perdido: { label: 'Perdido', color: '#ff1744', bgColor: 'rgba(255, 23, 68, 0.15)' },
};

export const LEAD_ORIGEM_LABELS: Record<LeadOrigem, string> = {
  'quiz-instagram': 'Quiz Instagram',
  site: 'Site Institucional',
  manual: 'Manual',
  indicacao: 'Indicação',
  google: 'Google',
  outro: 'Outro',
};

export const KANBAN_COLUMN_ORDER: LeadStatus[] = [
  'novo',
  'qualificado',
  'agendado',
  'em_reuniao',
  'proposta',
  'fechado',
  'perdido',
];

// ---- Navigation ----

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: 'dashboard' },
  { label: 'Leads', href: '/leads', icon: 'leads' },
  { label: 'Calendário', href: '/calendario', icon: 'calendar' },
  { label: 'Equipe', href: '/equipe', icon: 'team' },
  { label: 'Vendas', href: '/vendas', icon: 'sales' },
  { label: 'Metas', href: '/metas', icon: 'goals' },
  { label: 'Configurações', href: '/configuracoes', icon: 'settings' },
];

// ---- Schedule Defaults ----

export const DEFAULT_MEETING_DURATION = 30; // minutes
export const DEFAULT_BUFFER_BETWEEN_MEETINGS = 15; // minutes
export const DEFAULT_MAX_MEETINGS_PER_DAY = 8;

export const DEFAULT_WORK_HOURS = {
  start: '09:00',
  end: '18:00',
};

export const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri

// ---- Date/Time Formatting ----

export const WEEKDAY_LABELS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
