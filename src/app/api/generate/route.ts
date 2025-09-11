import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { detectLanguage, languageStyle } from '@/lib/lang';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { title, author, genre, vibe, color, projectId } = await request.json();

    if (!projectId || !title || !genre) {
      return NextResponse.json(
        { error: 'projectId, title and genre are required' },
        { status: 400 }
      );
    }

    // Detect language from title+vibe+author
    const lang = detectLanguage(`${title}\n${author || ''}\n${vibe || ''}`);
    const dynamicPrompt = buildPrompt(title, genre, vibe, color, lang);

    // Fetch existing generations
    const { data: project, error: fetchErr } = await supabaseAdmin
      .from('mamette_projects')
      .select('generations')
      .eq('id', projectId)
      .single();

    if (fetchErr || !project) {
      console.error('Failed to fetch project:', fetchErr);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Generate 4 images
    const imagePromises = Array.from({ length: 4 }, () =>
      openai.images.generate({
        model: 'dall-e-3',
        prompt: dynamicPrompt,
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

    if (urls.length === 0) {
      return NextResponse.json({ error: 'No images generated' }, { status: 500 });
    }

    const newEntries = urls.map((url: string) => ({
      url,
      provider: 'dalle',
      status: 'completed',
      created_at: new Date().toISOString(),
    }));

    const updatedGenerations = Array.isArray(project.generations)
      ? [...project.generations, ...newEntries]
      : newEntries;

    const { error: updateErr } = await supabaseAdmin
      .from('mamette_projects')
      .update({ generations: updatedGenerations, prompt: dynamicPrompt })
      .eq('id', projectId);

    if (updateErr) {
      console.error('Failed to update project generations:', updateErr);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      projectId,
      images: urls,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildPrompt(title: string, genre: string, vibe?: string, color?: string, lang: 'fr' | 'en' = 'en'): string {
  const genreStyles = {
    fiction: 'literary fiction, clean modern design, thoughtful composition',
    mystery: 'suspenseful thriller, dark atmospheric lighting, noir elements',
    romance: 'romantic elegance, soft lighting, emotional warmth',
    fantasy: 'magical elements, rich colors, enchanting atmosphere',
    'sci-fi': 'futuristic design, technological elements, cosmic themes',
    'non-fiction': 'professional clean design, bold typography space, authoritative feel',
    memoir: 'personal intimate design, emotional depth, authentic feel',
    poetry: 'artistic elegant design, creative typography space, lyrical atmosphere',
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

  let prompt = `A ${genre} book cover concept for "${title}", ${genreStyles[genre as keyof typeof genreStyles] || 'professional design'}`;
  if (color && colorMods[color as keyof typeof colorMods]) prompt += `, ${colorMods[color as keyof typeof colorMods]}`;
  if (vibe) prompt += `, incorporating themes of ${vibe}`;
  // Language style and strict no-text directive
  prompt += `, ${languageStyle(lang)}`;
  // Enforce flat 2D artwork (no mockups, no 3D, no shadows)
  prompt += `, flat 2D artwork, no book mockups, no 3D render, no drop shadows, no perspective book objects, no staged product shots`;
  prompt += `, cinematic composition, professional book cover design, clean space for typography, no text, no watermark, no frame, aspect ratio 2:3`;
  return prompt;
} 