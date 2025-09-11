import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { detectLanguage, languageStyle } from '@/lib/lang';
import { imageHasText } from '@/lib/ocr';
import { replicateTextToImage, fetchImageAsDataUrl } from '@/lib/replicate';

export async function POST(request: NextRequest) {
  try {
    const { title, author, genre, vibe, color, projectId } = await request.json();

    if (!projectId || !title || !genre) {
      return NextResponse.json(
        { error: 'projectId, title and genre are required' },
        { status: 400 }
      );
    }

    const lang = detectLanguage(`${title}\n${author || ''}\n${vibe || ''}`);
    const dynamicPrompt = buildPrompt({ title, genre, vibe, color, lang, sourceText: vibe });
    const abstractFallbackPrompt = `${dynamicPrompt}, abstract minimal composition, non-literal motifs, organic shapes and textures, landscape or scenery without words, silhouettes only, avoid any shapes resembling letters or numbers, no glyphs, no scripts (Latin, Cyrillic, Arabic, Chinese, Japanese, Korean), no calligraphy, no runes, no symbols, no text-like marks`;

    const { data: project } = await supabaseAdmin
      .from('mamette_projects')
      .select('generations')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const desired = 4;
    const maxAttempts = 20;
    const abstractAfter = 8;
    const cleanUrls: string[] = [];
    const allUrls: string[] = [];
    let attempts = 0;

    const ocrEnabled = process.env.MAMETTE_OCR_ENABLED === 'true';

    while (cleanUrls.length < desired && attempts < maxAttempts) {
      attempts += 1;
      try {
        const promptToUse = attempts > abstractAfter ? abstractFallbackPrompt : dynamicPrompt;
        const outputs = await replicateTextToImage({
          prompt: promptToUse,
          negativePrompt: 'text, letters, words, characters, typography, captions, logos, watermarks, glyphs, scripts, symbols, UI',
          width: 1024,
          height: 1792,
          numInferenceSteps: 26,
          guidanceScale: 3.0,
        });
        const url = outputs?.[0];
        if (!url) continue;
        allUrls.push(url);
        if (!ocrEnabled) {
          cleanUrls.push(url);
          continue;
        }
        const dataUrl = await fetchImageAsDataUrl(url);
        const hasText = await imageHasText(dataUrl);
        if (!hasText) cleanUrls.push(url);
      } catch (_e) {
        // continue attempts
      }
    }

    const imagesToSave = (ocrEnabled ? (cleanUrls.length > 0 ? cleanUrls : allUrls.slice(0, desired)) : allUrls.slice(0, desired));

    if (imagesToSave.length === 0) {
      return NextResponse.json({ error: 'No images generated' }, { status: 500 });
    }

    const newEntries = imagesToSave.map((url: string) => ({
      url,
      provider: 'replicate',
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
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, projectId, images: imagesToSave, filtered: ocrEnabled && cleanUrls.length > 0 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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
    fiction: 'literary fiction, clean modern design, thoughtful composition',
    mystery: 'suspenseful thriller, dark atmospheric lighting, noir elements',
    romance: 'romantic elegance, soft lighting, emotional warmth',
    fantasy: 'magical elements, rich colors, enchanting atmosphere',
    'sci-fi': 'futuristic design, technological elements, cosmic themes',
    'non-fiction': 'professional clean design, authoritative feel',
    memoir: 'personal intimate design, emotional depth, authentic feel',
    poetry: 'artistic elegant design, lyrical atmosphere',
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

  let prompt = `A ${genre} cover artwork (image only) for "${title}", ${genreStyles[genre as keyof typeof genreStyles] || 'refined design'}`;
  if (color && colorMods[color as keyof typeof colorMods]) prompt += `, ${colorMods[color as keyof typeof colorMods]}`;
  if (vibe) prompt += `, incorporating themes of ${vibe}`;

  prompt += `, ${languageStyle(lang)}`;

  if (sourceText && sourceText.trim().length > 0) {
    const text = truncateClean(sourceText, 900);
    prompt += `, use ONLY the following text as thematic reference, do not invent motifs beyond it, do not display text: """${text}"""`;
  }

  prompt += `, flat 2D artwork, no book mockups, no physical book, no 3D, no bevel, no emboss, no drop shadows, no reflections, no perspective product shots, no hands, no devices, no borders, no frames, no logos, no UI, no text, no typography, no letters, no numbers, no glyphs, no scripts (Latin, Cyrillic, Arabic, Chinese, Japanese, Korean), no calligraphy, no runes, no symbols, no signage, no captions, avoid any text-like marks`;
  prompt += `, simple poster-style composition, single-image output`;
  prompt += `, aspect ratio 2:3`;
  return prompt;
}

function truncateClean(s: string, n: number) {
  const cleaned = s.replace(/\s+/g, ' ').trim();
  return cleaned.length > n ? cleaned.slice(0, n - 1) + '…' : cleaned;
} 