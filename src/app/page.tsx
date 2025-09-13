import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { DEFAULT_USER_ID } from '@/lib/config';

interface RecentItem {
  id: string;
  title: string | null;
  generations: { url?: string | null }[] | null;
  favorite_asset_url: string | null;
}

export default async function HomePage() {
  const { data: recent } = await supabaseAdmin
    .from('mamette_projects')
    .select('id,title,generations,favorite_asset_url')
    .eq('user_id', DEFAULT_USER_ID)
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-neutral-600 to-neutral-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-2xl font-bold text-neutral-800">Mamette</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/library" className="text-neutral-600 hover:text-neutral-800 transition-colors">
              Library
            </Link>
            <Link href="/new" className="px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors">
              Start Creating
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-neutral-800 mb-6 leading-tight">
              Your AI Muse for{' '}
              <span className="bg-gradient-to-r from-neutral-600 to-neutral-800 bg-clip-text text-transparent">
                Book Covers
              </span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Mamette helps you create beautiful, on-brand book covers in seconds. 
              Just give her your title, vibe, and vision—she&apos;ll do the rest.
            </p>
          </div>

          <div className="mb-12">
            <Link 
              href="/new"
              className="inline-flex items-center gap-3 px-8 py-4 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-all duration-200 text-lg font-medium shadow-lg hover:shadow-xl"
            >
              <span>Start with a title</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="text-sm text-neutral-500 mt-3">
              Free to try • No credit card required
            </p>
          </div>

          {/* Last search */}
          {Array.isArray(recent) && recent.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-800">Last search</h2>
                <Link href="/new" className="text-sm text-neutral-600 hover:text-neutral-800">New project</Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {(recent as RecentItem[]).map((p: RecentItem) => {
                  const firstUrl = Array.isArray(p.generations) && p.generations.length > 0 ? p.generations[0]?.url : null;
                  const url = p.favorite_asset_url || firstUrl;
                  return (
                    <Link key={p.id} href={`/project/${p.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200 hover:shadow-md transition-shadow">
                      <div className="aspect-[2/3] bg-neutral-200">
                        {url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt={p.title || 'Cover'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">No image</div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="text-sm font-medium text-neutral-800 truncate">{p.title || 'Untitled'}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sample Covers Preview */}
          <div className="mb-16">
            <p className="text-neutral-600 mb-8 text-lg">
              See what Mamette can create for you
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { title: 'The Midnight Garden', genre: 'Romance', mood: 'Elegant Script' },
                { title: 'Digital Fortress', genre: 'Thriller', mood: 'Bold Sans' },
                { title: 'Letters to Yesterday', genre: 'Literary', mood: 'Serif Classic' }
              ].map((book, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
                  <div className="aspect-[2/3] bg-gradient-to-br from-neutral-300 to-neutral-500 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg mx-auto mb-3"></div>
                        <div className="text-sm font-medium opacity-80">Sample Cover</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-neutral-800 mb-1">{book.title}</h3>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-600">{book.genre}</span>
                      <span className="text-neutral-500">{book.mood}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Lightning Fast</h3>
              <p className="text-neutral-600">From concept to cover in under 60 seconds</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Print Ready</h3>
              <p className="text-neutral-600">Export for ebook, print, and social media</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Made with Love</h3>
              <p className="text-neutral-600">Elegant designs that capture your story&apos;s essence</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">
              Ready to meet your muse?
            </h2>
            <p className="text-neutral-600 mb-6">
              Join thousands of authors who trust Mamette with their book covers. 
              Start creating beautiful covers that sell books.
            </p>
            <Link 
              href="/new"
              className="inline-flex items-center gap-3 px-8 py-4 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-colors font-medium"
            >
              Create Your First Cover
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-neutral-600 to-neutral-800 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="text-neutral-600">© 2024 Mamette</span>
          </div>
          {/* Removed auxiliary links */}
        </div>
      </footer>
    </div>
  );
}
