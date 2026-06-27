'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';
import { WEEKDAY_SHORT, MONTH_LABELS } from '@/lib/constants';
import { Booking, BookingStatus, BookingTipo } from '@/types';

export default function CalendarPage() {
  const { bookings, leads, team, addBooking, updateBookingStatus } = useCRM();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);

  // New Booking Form State
  const [newLeadId, setNewLeadId] = useState('');
  const [newConsultorId, setNewConsultorId] = useState('prof-1');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('10:00');
  const [newType, setNewType] = useState<BookingTipo>('diagnostico');
  const [newZoomLink, setNewZoomLink] = useState('https://zoom.us/j/vittus-diagnostico-reuniao');
  const [newNotes, setNewNotes] = useState('');

  // Calendar navigation state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed

  // Get active bookings for the selected date
  const selectedDateBookings = bookings.filter(b => b.data === selectedDate);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadId) return;

    // Calculate end time (duration 30 mins)
    const [hours, minutes] = newTime.split(':').map(Number);
    const endMinutes = minutes + 30;
    const endHours = hours + Math.floor(endMinutes / 60);
    const formattedEndMinutes = String(endMinutes % 60).padStart(2, '0');
    const formattedEndHours = String(endHours % 24).padStart(2, '0');
    const newEndTime = `${formattedEndHours}:${formattedEndMinutes}`;

    addBooking({
      lead_id: newLeadId,
      consultor_id: newConsultorId,
      data: newDate,
      horario_inicio: newTime,
      horario_fim: newEndTime,
      status: 'confirmado',
      tipo: newType,
      zoom_link: newZoomLink,
      notas: newNotes || 'Reunião agendada pelo painel administrativo.'
    });

    // Reset and Close
    setNewLeadId('');
    setNewConsultorId('prof-1');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewTime('10:00');
    setNewType('diagnostico');
    setNewNotes('');
    setIsNewBookingModalOpen(false);
  };

  if (!isMounted) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Vittus CRM</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>Calendário & Agendamentos</h1>
        </div>
      </div>
    );
  }

  // Helper: Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get first day of month (day of week: 0=Sun, 1=Mon...)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Build calendar matrix (days array)
  const calendarCells = [];
  // Fill blank padding cells for first week
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  // Fill days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Vittus CRM</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>Agenda & Diagnósticos</h1>
        </div>

        <button 
          onClick={() => setIsNewBookingModalOpen(true)}
          className="btn btn-primary"
          style={{ fontWeight: 700, padding: '10px 20px' }}
        >
          + Novo Agendamento
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Side: Calendar Month View */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
          
          {/* Calendar Month Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>
              {MONTH_LABELS[currentMonth]} {currentYear}
            </h3>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => navigateMonth('prev')}
                style={{ 
                  padding: '8px 12px', 
                  background: '#16161d', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '100px',
                  color: 'white'
                }}
              >
                &larr;
              </button>
              <button 
                onClick={() => navigateMonth('next')}
                style={{ 
                  padding: '8px 12px', 
                  background: '#16161d', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '100px',
                  color: 'white'
                }}
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* Weekday Titles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
            {WEEKDAY_SHORT.map(w => (
              <div key={w} style={{ padding: '8px 0' }}>{w}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {calendarCells.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} style={{ aspectRatio: '1.2' }}></div>;
              }

              // Build date string YYYY-MM-DD
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = dateStr === selectedDate;
              const dateBookings = bookings.filter(b => b.data === dateStr);
              const hasBookings = dateBookings.length > 0;
              
              // Check if date is today
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDate(dateStr)}
                  style={{
                    aspectRatio: '1.2',
                    borderRadius: '12px',
                    background: isSelected ? 'var(--accent-primary)' : isToday ? '#212128' : 'rgba(255,255,255,0.01)',
                    border: isToday ? '1px solid rgba(0, 102, 255, 0.4)' : '1px solid rgba(255,255,255,0.03)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = isToday ? '#212128' : 'rgba(255,255,255,0.01)';
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: isToday || isSelected ? 700 : 500 }}>
                    {day}
                  </span>
                  
                  {/* Indicator Dot for meetings */}
                  {hasBookings && (
                    <span style={{
                      position: 'absolute',
                      bottom: '8px',
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: isSelected ? 'white' : 'linear-gradient(135deg, #0047ab 0%, #00d4ff 100%)'
                    }}></span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Side: Booking Panel for Selected Date */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1.5px' }}>
              Compromissos
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginTop: '4px' }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {selectedDateBookings.map((booking) => {
              const lead = leads.find(l => l.id === booking.lead_id);
              const consultor = team.find(t => t.id === booking.consultor_id);
              
              // Status badges
              const getStatusBadge = (status: BookingStatus, isGoogleCalendar?: boolean) => {
                if (isGoogleCalendar) return { bg: 'rgba(234, 67, 53, 0.15)', color: '#ea4335', text: 'Google Agenda' };
                switch(status) {
                  case 'confirmado':
                    return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', text: 'Confirmado' };
                  case 'realizado':
                    return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', text: 'Realizado' };
                  case 'cancelado':
                    return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', text: 'Cancelado' };
                  default:
                    return { bg: 'rgba(255, 255, 255, 0.1)', color: '#fff', text: status };
                }
              };

              const badge = getStatusBadge(booking.status, booking.isGoogleCalendar);

              return (
                <div 
                  key={booking.id}
                  style={{
                    background: '#16161d',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'white' }}>
                        {booking.horario_inicio} &mdash; {booking.horario_fim}
                      </span>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginTop: '4px' }}>
                        {booking.isGoogleCalendar ? booking.title : (lead?.nome || 'Lead Externo')}
                      </h4>
                      {!booking.isGoogleCalendar && lead?.empresa && (
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0 0' }}>
                          {lead.empresa} ({lead.segmento})
                        </p>
                      )}
                      {booking.isGoogleCalendar && booking.notas && (
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {booking.notas}
                        </p>
                      )}
                    </div>

                    <span style={{
                      background: badge.bg,
                      color: badge.color,
                      fontSize: '9.5px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '100px',
                      textTransform: 'uppercase'
                    }}>
                      {badge.text}
                    </span>
                  </div>

                  {booking.zoom_link && (
                    <a 
                      href={booking.zoom_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        background: 'rgba(0, 102, 255, 0.1)',
                        color: 'var(--accent-primary)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textDecoration: 'none'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M23 7l-7 5 7 5V7z" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                      Entrar no Zoom
                    </a>
                  )}

                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                    <span>Consultor: <strong>{consultor?.nome}</strong></span>
                    
                    {/* Status updater quick buttons */}
                    {booking.status === 'confirmado' && !booking.isGoogleCalendar && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => updateBookingStatus(booking.id, 'realizado')}
                          style={{ color: '#10b981', fontWeight: 600 }}
                        >
                          Concluir
                        </button>
                        <button 
                          onClick={() => updateBookingStatus(booking.id, 'cancelado')}
                          style={{ color: '#ef4444', fontWeight: 600 }}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {selectedDateBookings.length === 0 && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px dashed rgba(255,255,255,0.03)',
                borderRadius: '16px',
                color: 'rgba(255,255,255,0.2)',
                padding: '40px 20px',
                textAlign: 'center'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h21" />
                </svg>
                <p style={{ fontSize: '13px', margin: 0 }}>Sem reuniões agendadas para este dia.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* --- MODAL: Create Booking --- */}
      {isNewBookingModalOpen && (
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
            onSubmit={handleCreateBooking}
            style={{
              background: '#16161d',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '480px',
              padding: '32px',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>Agendar Diagnóstico / Reunião</h3>
              <button 
                type="button"
                onClick={() => setIsNewBookingModalOpen(false)}
                style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px' }}
              >
                ✕
              </button>
            </div>

            {/* Lead selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                Selecionar Lead *
              </label>
              <select
                required
                value={newLeadId}
                onChange={(e) => setNewLeadId(e.target.value)}
                style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none' }}
              >
                <option value="">-- Escolha um Lead --</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.nome} {lead.empresa ? `(${lead.empresa})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Consultor / Responsável selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                Consultor Responsável
              </label>
              <select
                value={newConsultorId}
                onChange={(e) => setNewConsultorId(e.target.value)}
                style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none' }}
              >
                {team.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.nome} - {member.cargo}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Data *
                </label>
                <input 
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Horário de Início *
                </label>
                <input 
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>

            {/* Meeting Type & Zoom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Tipo de Reunião
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as BookingTipo)}
                  style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none' }}
                >
                  <option value="diagnostico">Diagnóstico Comercial</option>
                  <option value="proposta">Apresentação de Proposta</option>
                  <option value="followup">Follow-up / Alinhamento</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Zoom Link
                </label>
                <input 
                  type="url"
                  value={newZoomLink}
                  onChange={(e) => setNewZoomLink(e.target.value)}
                  style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>

            {/* Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                Observações
              </label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Detalhes sobre a conversa comercial..."
                style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '13.5px', outline: 'none', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button 
                type="button"
                onClick={() => setIsNewBookingModalOpen(false)}
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
                Salvar Agendamento
              </button>
            </div>

          </form>
        </div>
      )}

      {/* --- Google Calendar Iframe --- */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>Visão Completa (Google Agenda)</h3>
        <div style={{ borderRadius: '24px', overflow: 'hidden', background: '#16161d', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', display: 'flex', justifyContent: 'center' }}>
          <iframe 
            src="https://calendar.google.com/calendar/embed?src=assesssoriavittus%40gmail.com&ctz=America%2FSao_Paulo" 
            style={{ border: 0, borderRadius: '12px' }} 
            width="100%" 
            height="600" 
            frameBorder="0" 
            scrolling="no"
          ></iframe>
        </div>
      </div>

    </div>
  );
}
