import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { DEFAULT_USER_ID } from '@/lib/config';
import { detectLanguage, languageStyle } from '@/lib/lang';
import { imageHasText } from '@/lib/ocr';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { text, userId } = await request.json();
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json({ error: 'Please provide some text' }, { status: 400 });
    }

    const inferred = inferFromText(text);

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
    const prompt = buildPrompt({ title: inferred.title, genre: 'poetry', vibe: inferred.vibe, lang, sourceText: text });

    const desired = 4;
    const maxAttempts = 20;
    const cleanDataUrls: string[] = [];
    let attempts = 0;

    while (cleanDataUrls.length < desired && attempts < maxAttempts) {
      attempts += 1;
      try {
        const gen = await openai.images.generate({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1792',
          quality: 'hd',
          style: 'natural',
          response_format: 'b64_json',
        } as any);

        const b64 = gen?.data?.[0]?.b64_json as string | undefined;
        if (!b64) continue;
        const dataUrl = `data:image/png;base64,${b64}`;
        const hasText = await imageHasText(dataUrl);
        if (!hasText) cleanDataUrls.push(dataUrl);
      } catch (e) {
        // continue
      }
    }

    if (cleanDataUrls.length === 0) {
      return NextResponse.json({ error: 'No text-free images generated' }, { status: 500 });
    }

    const newEntries = cleanDataUrls.map((url: string) => ({
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

    return NextResponse.json({ success: true, projectId: project.id, images: cleanDataUrls });
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

  const last = lines[lines.length - 1]?.toLowerCase() || '';
  const author = last.startsWith('by ') ? lines[lines.length - 1].slice(3).trim() : 'Unknown';

  const vibe = text.length > 800 ? text.slice(0, 800) + '…' : text;

  return { title, author, vibe };
}

function buildPrompt({
  title,
  genre,
  vibe,
  color,
  lang = 'en',
  sourceText,
}: {
  title: string;
  genre: string;
  vibe?: string;
  color?: string;
  lang?: 'fr' | 'en';
  sourceText?: string;
}): string {
  const genreStyles = {
    poetry: 'artistic elegant design, lyrical atmosphere',
  } as const;

  let prompt = `A ${genre} cover artwork (image only) for "${title}", ${genreStyles['poetry']}`;
  if (vibe) prompt += `, incorporating themes of ${vibe}`;

  prompt += `, ${languageStyle(lang)}`;

  if (sourceText && sourceText.trim().length > 0) {
    const cleaned = sourceText.replace(/\s+/g, ' ').trim();
    const text = cleaned.length > 900 ? cleaned.slice(0, 899) + '…' : cleaned;
    prompt += `, use ONLY the following text as thematic reference, do not invent motifs beyond it, do not display text: """${text}"""`;
  }

  prompt += `, flat 2D artwork, no book mockups, no physical book, no 3D, no bevel, no emboss, no drop shadows, no reflections, no perspective product shots, no hands, no devices, no borders, no frames, no logos, no UI, no text, no typography, no letters, no characters, no signage, no captions`;
  prompt += `, simple poster-style composition, single-image output, aspect ratio 2:3`;
  return prompt;
} 