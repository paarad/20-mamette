"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface GenerationEntry {
  url: string;
  provider: string;
  status: string;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  author: string;
  genre: string;
  vibe: string | null;
  color: string | null;
  prompt: string | null;
  generations: GenerationEntry[];
  favorite_asset_url: string | null;
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load project');
      setProject(json.project);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProject();
    const t = setInterval(fetchProject, 4000);
    return () => clearInterval(t);
  }, [projectId]);

  async function handleGenerateMore() {
    if (!project) return;
    setGenerating(true);
    try {
      await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          title: project.title,
          author: project.author,
          genre: project.genre,
          vibe: project.vibe || undefined,
          color: project.color || undefined,
        }),
      });
    } finally {
      setGenerating(false);
      fetchProject();
    }
  }

  async function setFavorite(url: string) {
    if (!project) return;
    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite_asset_url: url }),
    });
    if (res.ok) fetchProject();
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading…</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>;
  if (!project) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">Your Cover Concepts</h1>
              <p className="text-neutral-600">Choose your favorite and add your title overlay</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleGenerateMore} disabled={generating} className="px-6 py-2 border border-neutral-200 rounded-lg hover:bg-white transition-colors disabled:opacity-60">
                {generating ? 'Generating…' : 'Generate More'}
              </button>
              <button className="px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                Export Selected
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {project.generations?.length ? (
              <div className="grid md:grid-cols-2 gap-6">
                {project.generations.map((g, i) => (
                  <div key={g.created_at + i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-[2/3] bg-neutral-200 relative">
                      {g.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={g.url} alt={`Generated Cover ${i + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-500">Pending…</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Concept {i + 1}</span>
                        <button onClick={() => setFavorite(g.url)} className={`text-sm hover:underline ${project.favorite_asset_url === g.url ? 'text-neutral-900' : 'text-neutral-700'}`}>
                          {project.favorite_asset_url === g.url ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-neutral-600">No generations yet. Click "Generate More" to create some.</div>
            )}
          </div>

          {false && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-neutral-800 mb-6">Text Overlay</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Title</label>
                  <input type="text" defaultValue={project?.title || ''} className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Author</label>
                  <input type="text" defaultValue={project?.author || ''} className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Typography Style</label>
                  <div className="space-y-2">
                    {[{ name: 'Serif Classic', desc: 'Literary & Historical' }, { name: 'Bold Sans', desc: 'Thriller & Non-fiction' }, { name: 'Elegant Script', desc: 'Romance & Poetry' }].map((style) => (
                      <label key={style.name} className="flex items-center p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">
                        <input type="radio" name="typography" className="mr-3" />
                        <div>
                          <div className="font-medium text-sm">{style.name}</div>
                          <div className="text-xs text-neutral-600">{style.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Text Color</label>
                  <div className="flex gap-2">
                    {['#FFFFFF', '#000000', '#8B4513', '#FFD700', '#DC143C'].map((c) => (
                      <button key={c} className="w-8 h-8 rounded-full border-2 border-neutral-300" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <button className="w-full bg-neutral-800 text-white py-3 rounded-lg hover:bg-neutral-700 transition-colors">Apply Text Overlay</button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
} 