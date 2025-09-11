import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { DEFAULT_USER_ID } from '@/lib/config';
import { detectLanguage, languageStyle } from '@/lib/lang';
import { imageHasText } from '@/lib/ocr';
import { replicateTextToImage, fetchImageAsDataUrl } from '@/lib/replicate';

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
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    const lang = detectLanguage(text);
    const prompt = buildPrompt({ title: inferred.title, genre: 'poetry', vibe: inferred.vibe, lang, sourceText: text });
    const abstractFallbackPrompt = `${prompt}, abstract minimal composition, non-literal motifs, organic shapes and textures, landscape or scenery without words, silhouettes only, avoid any shapes resembling letters or numbers, no glyphs, no scripts (Latin, Cyrillic, Arabic, Chinese, Japanese, Korean), no calligraphy, no runes, no symbols, no text-like marks`;

    const provider = process.env.MAMETTE_IMAGE_PROVIDER || 'dalle';

    const desired = 2;
    const maxAttempts = provider === 'replicate' ? 16 : 24;
    const abstractAfter = provider === 'replicate' ? 6 : 8;
    const cleanDataUrls: string[] = [];
    let attempts = 0;

    while (cleanDataUrls.length < desired && attempts < maxAttempts) {
      attempts += 1;
      try {
        const promptToUse = attempts > abstractAfter ? abstractFallbackPrompt : prompt;
        if (provider === 'replicate') {
          const outputs = await replicateTextToImage({
            prompt: promptToUse,
            negativePrompt: 'text, letters, words, characters, typography, captions, logos, watermarks, glyphs, scripts, symbols, UI',
            width: 1024,
            height: 1792,
            numInferenceSteps: 24,
            guidanceScale: 3.0,
          });
          const url = outputs?.[0];
          if (!url) continue;
          const dataUrl = await fetchImageAsDataUrl(url);
          const hasText = await imageHasText(dataUrl);
          if (!hasText) cleanDataUrls.push(url);
        } else {
          const gen = await openai.images.generate({
            model: 'dall-e-3',
            prompt: promptToUse,
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
        }
      } catch (_e) {}
    }

    if (cleanDataUrls.length === 0) {
      return NextResponse.json({ error: 'No text-free images generated' }, { status: 500 });
    }

    const newEntries = cleanDataUrls.map((url: string) => ({
      url,
      provider: provider === 'replicate' ? 'replicate' : 'dalle',
      status: 'completed',
      created_at: new Date().toISOString(),
    }));

    await supabaseAdmin
      .from('mamette_projects')
      .update({ generations: newEntries, prompt })
      .eq('id', project.id);

    return NextResponse.json({ success: true, projectId: project.id, images: cleanDataUrls });
  } catch (_e) {
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

  prompt += `, flat 2D artwork, no book mockups, no physical book, no 3D, no bevel, no emboss, no drop shadows, no reflections, no perspective product shots, no hands, no devices, no borders, no frames, no logos, no UI, no text, no typography, no letters, no numbers, no glyphs, no scripts (Latin, Cyrillic, Arabic, Chinese, Japanese, Korean), no calligraphy, no runes, no symbols, no signage, no captions, avoid any text-like marks`;
  prompt += `, simple poster-style composition, single-image output, aspect ratio 2:3`;
  return prompt;
} 