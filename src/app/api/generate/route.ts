import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { title, author, genre, vibe, color, projectId } = await request.json();

    if (!title || !genre) {
      return NextResponse.json(
        { error: 'Title and genre are required' },
        { status: 400 }
      );
    }

    // Create the AI prompt based on Mamette's system
    const systemPrompt = `You are an award-winning book cover designer. Create a striking, genre-specific cover concept that visually communicates the story's tone, using color, composition, and symbolism. Leave space for title and author. No text. No watermark. No frame.`;
    
    const dynamicPrompt = buildPrompt(title, genre, vibe, color);

    // Create generation record
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        project_id: projectId,
        provider: 'dalle',
        prompt: dynamicPrompt,
        status: 'generating'
      })
      .select()
      .single();

    if (genError) {
      console.error('Database error:', genError);
      return NextResponse.json(
        { error: 'Failed to create generation record' },
        { status: 500 }
      );
    }

    try {
      // Generate multiple variations (4-6 concepts)
      const imagePromises = Array.from({ length: 4 }, () =>
        openai.images.generate({
          model: "dall-e-3",
          prompt: dynamicPrompt,
          n: 1,
          size: "1024x1792", // Aspect ratio 2:3 for book covers
          quality: "hd",
          style: "natural"
        })
      );

      const results = await Promise.allSettled(imagePromises);
      const successfulImages = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value.data[0].url)
        .filter(Boolean);

      if (successfulImages.length === 0) {
        // Update generation status to failed
        await supabase
          .from('generations')
          .update({ status: 'failed' })
          .eq('id', generation.id);

        return NextResponse.json(
          { error: 'Failed to generate any images' },
          { status: 500 }
        );
      }

      // Update generation with successful images
      const { error: updateError } = await supabase
        .from('generations')
        .update({
          status: 'completed',
          images: successfulImages
        })
        .eq('id', generation.id);

      if (updateError) {
        console.error('Failed to update generation:', updateError);
      }

      return NextResponse.json({
        success: true,
        generationId: generation.id,
        images: successfulImages
      });

    } catch (aiError) {
      console.error('OpenAI API error:', aiError);
      
      // Update generation status to failed
      await supabase
        .from('generations')
        .update({ status: 'failed' })
        .eq('id', generation.id);

      return NextResponse.json(
        { error: 'Failed to generate images' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildPrompt(title: string, genre: string, vibe?: string, color?: string): string {
  const genreStyles = {
    fiction: "literary fiction, clean modern design, thoughtful composition",
    mystery: "suspenseful thriller, dark atmospheric lighting, noir elements",
    romance: "romantic elegance, soft lighting, emotional warmth",
    fantasy: "magical elements, rich colors, enchanting atmosphere",
    'sci-fi': "futuristic design, technological elements, cosmic themes",
    'non-fiction': "professional clean design, bold typography space, authoritative feel",
    memoir: "personal intimate design, emotional depth, authentic feel",
    poetry: "artistic elegant design, creative typography space, lyrical atmosphere"
  };

  const colorMods = {
    warm: "warm color palette, golden tones, inviting atmosphere",
    cool: "cool color palette, blues and teals, calming mood",
    dark: "dark moody palette, deep shadows, dramatic contrast",
    bright: "bright vibrant colors, high energy, optimistic feel",
    earthy: "earth tones, natural colors, organic feel",
    vibrant: "saturated vibrant colors, bold and striking",
    muted: "muted subtle colors, sophisticated restraint",
    monochrome: "monochromatic design, single color focus"
  };

  let prompt = `A ${genre} book cover concept, ${genreStyles[genre as keyof typeof genreStyles] || 'professional design'}`;
  
  if (color && colorMods[color as keyof typeof colorMods]) {
    prompt += `, ${colorMods[color as keyof typeof colorMods]}`;
  }
  
  if (vibe) {
    prompt += `, incorporating themes of ${vibe}`;
  }
  
  prompt += `, cinematic composition, professional book cover design, clean space for typography, no text, no watermark, no frame, aspect ratio 2:3`;
  
  return prompt;
} 