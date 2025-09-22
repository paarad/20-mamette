import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { DEFAULT_USER_ID } from '@/lib/config';

interface LibraryItem {
  id: string;
  title: string | null;
  author: string | null;
  genre: string | null;
  generations: { url?: string | null }[] | null;
  favorite_asset_url: string | null;
  created_at: string;
}

function isLikelyPublicUrl(u: string | null | undefined): boolean {
  if (!u) return false;
  if (u.includes('/storage/v1/object/public/')) return true;
  // allow our own proxy thumbnails
  if (u.startsWith('/api/image-proxy')) return true;
  return false;
}

export default async function LibraryPage() {
  const { data: projects } = await supabaseAdmin
    .from('mamette_projects')
    .select('id,title,author,genre,generations,favorite_asset_url,created_at')
    .eq('user_id', DEFAULT_USER_ID)
    .order('created_at', { ascending: false })
    .limit(48);

  let list: LibraryItem[] = Array.isArray(projects) ? (projects as LibraryItem[]) : [];

  // Filter out items with no usable image
  list = list.filter((p) => {
    const firstUrl = Array.isArray(p.generations) && p.generations.length > 0 ? p.generations[0]?.url || null : null;
    const url = p.favorite_asset_url || firstUrl;
    return isLikelyPublicUrl(url);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                Your Library
              </h1>
              <p className="text-neutral-600">
                All your beautiful book covers in one place
              </p>
            </div>
            <Link href="/new" className="px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors">
              Create New Cover
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        {list.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {list.map((p: LibraryItem) => {
              const firstUrl = Array.isArray(p.generations) && p.generations.length > 0 ? p.generations[0]?.url : null;
              const url = p.favorite_asset_url || firstUrl;
              const title = p.title || 'Untitled';
              return (
                <Link key={p.id} href={`/project/${p.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 hover:shadow-md transition-shadow group">
                  <div className="aspect-square bg-neutral-200 relative overflow-hidden">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-sm">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-neutral-800 mb-1 truncate">
                      {title}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-2 truncate">{p.author || 'Unknown'}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full">
                        {p.genre || '—'}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">
              No covers yet
            </h3>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Start creating beautiful book covers with Mamette. Your first masterpiece is just a few clicks away.
            </p>
            <Link href="/new" className="px-8 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors">
              Create Your First Cover
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 