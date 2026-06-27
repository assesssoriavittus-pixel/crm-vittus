import { NextResponse } from 'next/server';
import ical from 'node-ical';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const icalUrl = searchParams.get('url');

  if (!icalUrl) {
    return NextResponse.json({ error: 'URL do iCal não fornecida' }, { status: 400 });
  }

  try {
    const events = await ical.async.fromURL(icalUrl);
    
    const parsedEvents = Object.values(events)
      .filter((event: any) => event.type === 'VEVENT')
      .map((event: any) => {
        // Formatar datas para o formato esperado pelo CRM
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        
        const pad = (n: number) => String(n).padStart(2, '0');
        
        const data = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
        const horario_inicio = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
        const horario_fim = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
        
        return {
          id: `gcal-${event.uid}`,
          consultor_id: 'google-calendar',
          data,
          horario_inicio,
          horario_fim,
          status: 'confirmado', // Assumindo que eventos do GCal estão confirmados
          tipo: 'google_event',
          notas: event.description || '',
          title: event.summary || 'Evento Externo',
          zoom_link: event.location && event.location.includes('http') ? event.location : '',
          isGoogleCalendar: true
        };
      });

    return NextResponse.json({ events: parsedEvents });
  } catch (error: any) {
    console.error('Erro ao buscar iCal:', error);
    return NextResponse.json({ error: 'Falha ao sincronizar calendário', details: error.message }, { status: 500 });
  }
}
