import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { data, error } = await supabaseAdmin
      .from('mamette_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, project: data });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { favorite_asset_url } = body;

    const { data, error } = await supabaseAdmin
      .from('mamette_projects')
      .update({ favorite_asset_url })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    return NextResponse.json({ success: true, project: data });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 