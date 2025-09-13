import { NextRequest, NextResponse } from 'next/server';
import { replicateTextToImage } from '@/lib/replicate';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, style } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });

    const modelSlug = process.env.REPLICATE_MOCKUP_MODEL;
    const versionOverride = process.env.REPLICATE_MOCKUP_VERSION || process.env.REPLICATE_VERSION;
    if (!modelSlug) {
      return NextResponse.json({
        error: 'AI mockup model not configured. Set REPLICATE_MOCKUP_MODEL (and optional REPLICATE_MOCKUP_VERSION) in .env.'
      }, { status: 400 });
    }

    const stylePrompt = buildStylePrompt(style as string | undefined);

    const prompt = `Photorealistic product mockup of a single book with the provided cover image printed on the front, ${stylePrompt}. Maintain realistic lighting and materials. Do not add text or logos. Do not crop the cover. Use the provided image EXACTLY as the cover artwork, unchanged.`;

    const negativePrompt = 'text, letters, words, typography, captions, watermarks, UI, hands covering book, fingers obscuring cover, blur, distortion, extra logos, extra images';

    const outputs = await replicateTextToImage({
      prompt,
      negativePrompt,
      width: 1536,
      height: 1024,
      guidanceScale: 3.0,
      numInferenceSteps: 26,
      modelSlugOverride: modelSlug,
      versionOverride,
      extraInputs: {
        // Common condition keys across IP-Adapter / ControlNet style models
        image: imageUrl,
        image_url: imageUrl,
        image_prompt: imageUrl,
        input_image: imageUrl,
        ip_adapter_image: imageUrl,
        control_image: imageUrl,
        // Nudge to preserve input faithfully
        strength: 0.2,
        conditioning_scale: 0.95,
      },
    });

    const url = outputs?.[0];
    if (!url) return NextResponse.json({ error: 'No mockup generated' }, { status: 500 });
    return NextResponse.json({ success: true, url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildStylePrompt(style?: string) {
  switch ((style || '').toLowerCase()) {
    case 'desk':
      return 'on a wooden desk with soft daylight, subtle shadows, minimal props';
    case 'studio':
      return 'studio backdrop, soft key light, crisp shadows, product photography';
    case 'cozy':
      return 'on a cozy table with a mug and warm light, shallow depth of field';
    case 'minimal':
      return 'minimal background, neutral tones, clean composition, product packshot';
    default:
      return 'on a neutral surface with soft light';
  }
} 