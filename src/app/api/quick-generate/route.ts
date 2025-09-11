import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { DEFAULT_USER_ID } from '@/lib/config';
import { detectLanguage, languageStyle } from '@/lib/lang';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { text, userId } = await request.json();
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json({ error: 'Please provide some text' }, { status: 400 });
    }

    const inferred = inferFromText(text);

    // Create project first
    const { data: project, error: insertErr } = await supabaseAdmin
      .from('mamette_projects')
      .insert({
        user_id: userId || DEFAULT_USER_ID,
        title: inferred.title,
        author: inferred.author,
        genre: 'poetry',
        vibe: inferred.vibe,
        color: null,
        prompt: null,
        generations: [],
        favorite_asset_url: null,
      })
      .select('*')
      .single();

    if (insertErr || !project) {
      console.error('Failed to create project:', insertErr);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    const lang = detectLanguage(text);
    const prompt = buildPrompt(inferred.title, 'poetry', inferred.vibe, undefined, lang);

    // Generate images (4)
    const imagePromises = Array.from({ length: 4 }, () =>
      openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1792',
        quality: 'hd',
        style: 'natural',
      })
    );

    const results = await Promise.allSettled(imagePromises);
    const urls = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value.data?.[0]?.url)
      .filter(Boolean);

    const newEntries = urls.map((url: string) => ({
      url,
      provider: 'dalle',
      status: 'completed',
      created_at: new Date().toISOString(),
    }));

    const { error: updateErr } = await supabaseAdmin
      .from('mamette_projects')
      .update({ generations: newEntries, prompt })
      .eq('id', project.id);

    if (updateErr) {
      console.error('Failed to update project generations:', updateErr);
    }

    return NextResponse.json({ success: true, projectId: project.id, images: urls });
  } catch (e) {
    console.error('quick-generate error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function inferFromText(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const first = lines[0] || 'Untitled';
  const title = first.length > 80 ? first.slice(0, 77) + '…' : first;

  // If the last line looks like an author (starts with by ...), use it
  const last = lines[lines.length - 1]?.toLowerCase() || '';
  const author = last.startsWith('by ') ? lines[lines.length - 1].slice(3).trim() : 'Unknown';

  // Use the whole text as vibe (truncate to reasonable length)
  const vibe = text.length > 800 ? text.slice(0, 800) + '…' : text;

  return { title, author, vibe };
}

function buildPrompt(title: string, genre: string, vibe?: string, color?: string, lang: 'fr' | 'en' = 'en'): string {
  const genreStyles = {
    poetry: 'artistic elegant design, creative symbolism, lyrical atmosphere, minimalistic composition',
  } as const;

  const colorMods = {
    warm: 'warm color palette, golden tones, inviting atmosphere',
    cool: 'cool color palette, blues and teals, calming mood',
    dark: 'dark moody palette, deep shadows, dramatic contrast',
    bright: 'bright vibrant colors, high energy, optimistic feel',
    earthy: 'earth tones, natural colors, organic feel',
    vibrant: 'saturated vibrant colors, bold and striking',
    muted: 'muted subtle colors, sophisticated restraint',
    monochrome: 'monochromatic design, single color focus',
  } as const;

  let prompt = `A ${genre} book cover concept for "${title}", ${genreStyles['poetry']}`;
  if (color && colorMods[color as keyof typeof colorMods]) prompt += `, ${colorMods[color as keyof typeof colorMods]}`;
  if (vibe) prompt += `, inspired by the following text: ${truncate(vibe, 300)}`;
  // Language style and strict no lettering
  prompt += `, ${languageStyle(lang)}`;
  // Enforce flat artwork
  prompt += `, flat 2D artwork, no book mockups, no 3D render, no drop shadows, no perspective book objects, no staged product shots`;
  prompt += `, cinematic composition, professional book cover design, clean space for typography, no text, no watermark, no frame, aspect ratio 2:3`;
  return prompt;
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
} 