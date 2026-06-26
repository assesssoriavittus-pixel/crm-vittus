import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { SlotsResponse, ScheduleConfig, Booking } from '@/types';
import {
  DEFAULT_MEETING_DURATION,
  DEFAULT_BUFFER_BETWEEN_MEETINGS,
  DEFAULT_WORK_HOURS,
} from '@/lib/constants';
import { generateTimeSlots, addMinutes } from '@/lib/utils';

const TIMEZONE = 'America/Sao_Paulo';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ---- OPTIONS (CORS preflight) ----

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders });
}

// ---- Helpers ----

/** Convert HH:MM to total minutes for easy comparison */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Check if two time ranges overlap (considering buffer) */
function isSlotBlocked(
  slotStart: string,
  slotDuration: number,
  bookedStart: string,
  bookedEnd: string,
  buffer: number
): boolean {
  const slotStartMin = timeToMinutes(slotStart);
  const slotEndMin = slotStartMin + slotDuration;

  const bookedStartMin = timeToMinutes(bookedStart) - buffer;
  const bookedEndMin = timeToMinutes(bookedEnd) + buffer;

  // Overlap if one starts before the other ends
  return slotStartMin < bookedEndMin && slotEndMin > bookedStartMin;
}

// ---- GET — Available slots for a date ----

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get('date');
    const consultorId = searchParams.get('consultor_id');

    // ---- Validate date ----
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Parâmetro "date" é obrigatório no formato YYYY-MM-DD' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check date is not in the past
    const today = new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE }); // YYYY-MM-DD
    if (date < today) {
      return NextResponse.json(
        { success: false, error: 'Não é possível agendar em datas passadas' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get day of week (0=Sun … 6=Sat) for the requested date
    const requestedDate = new Date(date + 'T12:00:00'); // noon to avoid timezone edge-cases
    const dayOfWeek = requestedDate.getDay();

    const supabase = createAdminClient();

    // ---- Fetch schedule configurations for this day ----
    let scheduleQuery = supabase
      .from('schedule_config')
      .select('*')
      .eq('dia_semana', dayOfWeek)
      .eq('ativo', true);

    if (consultorId) {
      scheduleQuery = scheduleQuery.eq('user_id', consultorId);
    }

    const { data: schedules, error: scheduleErr } = await scheduleQuery;

    if (scheduleErr) throw scheduleErr;

    // If no schedule configured for this day, return empty
    if (!schedules || schedules.length === 0) {
      const response: SlotsResponse = { date, slots: [], timezone: TIMEZONE };
      return NextResponse.json(
        { success: true, ...response, message: 'Nenhum horário disponível neste dia' },
        { headers: corsHeaders }
      );
    }

    // ---- Generate all possible time slots from all schedules ----
    const allSlots = new Set<string>();

    for (const schedule of schedules as ScheduleConfig[]) {
      const slots = generateTimeSlots(
        schedule.hora_inicio,
        schedule.hora_fim,
        DEFAULT_MEETING_DURATION
      );
      slots.forEach((s) => allSlots.add(s));
    }

    // ---- Fetch existing bookings for this date (exclude cancelled) ----
    let bookingsQuery = supabase
      .from('bookings')
      .select('horario_inicio, horario_fim')
      .eq('data', date)
      .neq('status', 'cancelado');

    if (consultorId) {
      bookingsQuery = bookingsQuery.eq('consultor_id', consultorId);
    }

    const { data: bookings, error: bookingErr } = await bookingsQuery;

    if (bookingErr) throw bookingErr;

    // ---- Filter out booked slots (with buffer) ----
    const availableSlots = Array.from(allSlots).filter((slot) => {
      if (!bookings || bookings.length === 0) return true;

      return !bookings.some((booking: Pick<Booking, 'horario_inicio' | 'horario_fim'>) =>
        isSlotBlocked(
          slot,
          DEFAULT_MEETING_DURATION,
          booking.horario_inicio,
          booking.horario_fim,
          DEFAULT_BUFFER_BETWEEN_MEETINGS
        )
      );
    });

    // ---- If today, remove slots that have already passed ----
    let filteredSlots = availableSlots;

    if (date === today) {
      const now = new Date().toLocaleTimeString('en-GB', {
        timeZone: TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
      }); // HH:MM in 24h format
      filteredSlots = availableSlots.filter((slot) => slot > now);
    }

    // Sort chronologically
    filteredSlots.sort();

    const response: SlotsResponse = {
      date,
      slots: filteredSlots,
      timezone: TIMEZONE,
    };

    return NextResponse.json(
      { success: true, ...response },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error('[API /slots] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500, headers: corsHeaders }
    );
  }
}
