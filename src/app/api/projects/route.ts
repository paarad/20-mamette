import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { title, author, genre, vibe, color, userId } = await request.json();

    if (!title || !author || !genre) {
      return NextResponse.json(
        { error: 'Title, author, and genre are required' },
        { status: 400 }
      );
    }

    // Create new project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId || '00000000-0000-0000-0000-000000000000', // Temporary for MVP
        title,
        author,
        genre,
        vibe,
        color
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project
    });

  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000000';

    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        generations (
          id,
          status,
          images,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      projects: projects || []
    });

  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 