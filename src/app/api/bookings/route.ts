import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { CreateBookingPayload } from '@/types';
import { DEFAULT_MEETING_DURATION, DEFAULT_BUFFER_BETWEEN_MEETINGS } from '@/lib/constants';
import { addMinutes } from '@/lib/utils';

// ---- CORS Headers ----

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ---- OPTIONS (CORS preflight) ----

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders });
}

// ---- Helpers ----

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function isOverlapping(
  newStart: string,
  newEnd: string,
  existingStart: string,
  existingEnd: string,
  buffer: number
): boolean {
  const newStartMin = timeToMinutes(newStart);
  const newEndMin = timeToMinutes(newEnd);
  const existStartMin = timeToMinutes(existingStart) - buffer;
  const existEndMin = timeToMinutes(existingEnd) + buffer;

  return newStartMin < existEndMin && newEndMin > existStartMin;
}

// ---- POST — Create a booking ----

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingPayload = await request.json();    // ---- Validate required fields ----
    if (!body.lead_id && (!body.nome || body.nome.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'lead_id ou nome do lead é obrigatório' },
        { status: 400, headers: corsHeaders }
      );
    }
    if (!body.lead_id && !body.email && !body.telefone) {
      return NextResponse.json(
        { success: false, error: 'E-mail ou telefone é obrigatório se lead_id não for informado' },
        { status: 400, headers: corsHeaders }
      );
    }
    if (!body.data || !/^\d{4}-\d{2}-\d{2}$/.test(body.data)) {
      return NextResponse.json(
        { success: false, error: 'Data é obrigatória no formato YYYY-MM-DD' },
        { status: 400, headers: corsHeaders }
      );
    }
    if (!body.horario || !/^\d{2}:\d{2}$/.test(body.horario)) {
      return NextResponse.json(
        { success: false, error: 'Horário é obrigatório no formato HH:MM' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate date is not in the past
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    if (body.data < today) {
      return NextResponse.json(
        { success: false, error: 'Não é possível agendar em datas passadas' },
        { status: 400, headers: corsHeaders }
      );
    }

    const horarioInicio = body.horario;
    const horarioFim = addMinutes(horarioInicio, DEFAULT_MEETING_DURATION);

    const supabase = createAdminClient();
    let resolvedLeadId = body.lead_id;

    // ---- Resolve or create Lead dynamically ----
    if (!resolvedLeadId) {
      let existingLead: { id: string } | null = null;

      if (body.email) {
        const { data } = await supabase
          .from('leads')
          .select('id')
          .eq('email', body.email)
          .maybeSingle();
        existingLead = data;
      }

      if (!existingLead && body.telefone) {
        const { data } = await supabase
          .from('leads')
          .select('id')
          .eq('telefone', body.telefone)
          .maybeSingle();
        existingLead = data;
      }

      if (existingLead) {
        resolvedLeadId = existingLead.id;
      } else {
        const { data: newLead, error: createLeadErr } = await supabase
          .from('leads')
          .insert({
            nome: body.nome!.trim(),
            email: body.email || null,
            telefone: body.telefone || null,
            origem: body.origem || 'site',
            status: 'qualificado',
          })
          .select('id')
          .single();

        if (createLeadErr) {
          console.error('[API /bookings] Failed to create lead dynamically:', createLeadErr);
          throw createLeadErr;
        }
        resolvedLeadId = newLead.id;
      }
    }

    // ---- Verify lead exists ----
    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .select('id, nome')
      .eq('id', resolvedLeadId)
      .single();

    if (leadErr || !lead) {
      return NextResponse.json(
        { success: false, error: 'Lead não encontrado' },
        { status: 404, headers: corsHeaders }
      );
    }

    // ---- Race condition protection: check slot availability ----
    let conflictQuery = supabase
      .from('bookings')
      .select('id, horario_inicio, horario_fim')
      .eq('data', body.data)
      .neq('status', 'cancelado');

    if (body.consultor_id) {
      conflictQuery = conflictQuery.eq('consultor_id', body.consultor_id);
    }

    const { data: existingBookings, error: conflictErr } = await conflictQuery;

    if (conflictErr) throw conflictErr;

    if (existingBookings && existingBookings.length > 0) {
      const hasConflict = existingBookings.some((booking) =>
        isOverlapping(
          horarioInicio,
          horarioFim,
          booking.horario_inicio,
          booking.horario_fim,
          DEFAULT_BUFFER_BETWEEN_MEETINGS
        )
      );

      if (hasConflict) {
        return NextResponse.json(
          { success: false, error: 'Este horário não está mais disponível' },
          { status: 409, headers: corsHeaders }
        );
      }
    }

    // ---- Create booking ----
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        lead_id: resolvedLeadId,
        consultor_id: body.consultor_id || null,
        data: body.data,
        horario_inicio: horarioInicio,
        horario_fim: horarioFim,
        status: 'confirmado',
        tipo: body.tipo || 'diagnostico',
        notas: body.notas || null,
      })
      .select()
      .single();

    if (bookingErr) throw bookingErr;

    // ---- Update lead status to "agendado" ----
    const { error: updateErr } = await supabase
      .from('leads')
      .update({ status: 'agendado' })
      .eq('id', resolvedLeadId);

    if (updateErr) {
      console.error('[API /bookings] Failed to update lead status:', updateErr);
      // Non-critical — booking was created, so we don't fail the request
    }

    // ---- Create activity record ----
    const formattedDate = body.data.split('-').reverse().join('/'); // DD/MM/YYYY
    const activityDesc = `Agendamento criado para ${formattedDate} às ${horarioInicio}`;

    const { error: activityErr } = await supabase.from('activities').insert({
      lead_id: resolvedLeadId,
      user_id: null, // Public API, no authenticated user
      tipo: 'reuniao',
      descricao: activityDesc,
    });

    if (activityErr) {
      console.error('[API /bookings] Failed to create activity:', activityErr);
      // Non-critical — booking was created, so we don't fail the request
    }

    return NextResponse.json(
      {
        success: true,
        booking_id: booking.id,
        data: booking,
        message: 'Agendamento confirmado!',
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error('[API /bookings] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500, headers: corsHeaders }
    );
  }
}
