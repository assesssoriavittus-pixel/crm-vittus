import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { CreateLeadPayload } from '@/types';

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

// ---- POST — Create or update a lead ----

export async function POST(request: NextRequest) {
  try {
    const body: CreateLeadPayload = await request.json();

    // Validate required fields
    if (!body.nome || body.nome.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Must have at least email or phone
    if (!body.email && !body.telefone) {
      return NextResponse.json(
        { success: false, error: 'Email ou telefone é obrigatório' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createAdminClient();

    // Check for existing lead by email or phone (dedup)
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

    // ---- Update existing lead ----
    if (existingLead) {
      const { data, error } = await supabase
        .from('leads')
        .update({
          respostas_quiz: body.respostas_quiz,
          origem: body.origem || 'quiz-instagram',
          status: 'qualificado',
        })
        .eq('id', existingLead.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json(
        { success: true, data, lead_id: data.id, message: 'Lead atualizado' },
        { headers: corsHeaders }
      );
    }

    // ---- Create new lead ----
    const { data, error } = await supabase
      .from('leads')
      .insert({
        nome: body.nome.trim(),
        email: body.email || null,
        telefone: body.telefone || null,
        origem: body.origem || 'quiz-instagram',
        status: 'qualificado',
        respostas_quiz: body.respostas_quiz || null,
        empresa: body.empresa || null,
        segmento: body.segmento || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, data, lead_id: data.id, message: 'Lead criado com sucesso' },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error('[API /leads] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500, headers: corsHeaders }
    );
  }
}
