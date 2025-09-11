import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabaseAdmin
      .from('mamette_projects')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, project: data });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { favorite_asset_url } = body;

    const { data, error } = await supabaseAdmin
      .from('mamette_projects')
      .update({ favorite_asset_url })
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    return NextResponse.json({ success: true, project: data });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 