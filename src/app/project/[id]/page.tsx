"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MockupCanvas = dynamic(() => import('./MockupCanvas'), { ssr: false });

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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProject();
    const t = setInterval(fetchProject, 4000);
    return () => clearInterval(t);
  }, [projectId]);

  useEffect(() => {
    // Auto-start generation when landing with an empty project
    if (!project || generating) return;
    const hasGenerations = Array.isArray(project.generations) && project.generations.length > 0;
    if (!hasGenerations) {
      handleGenerateMore();
    }
    // Only run when project reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

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

  function handleExport() {
    if (!project) return;
    const url = project.favorite_asset_url || (project.generations?.[0]?.url || '');
    if (!url) return;
    const nameSafe = (project.title || 'mamette-cover').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const filename = `${nameSafe}.png`;
    const apiUrl = `/api/export?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    window.open(apiUrl, '_blank');
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
              <div className="mt-2 flex items-center gap-3 text-sm text-neutral-600">
                <Link href="/" className="hover:underline">← Home</Link>
                <span>•</span>
                <Link href="/library" className="hover:underline">Gallery</Link>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleGenerateMore} disabled={generating} className="px-6 py-2 border border-neutral-200 rounded-lg hover:bg-white transition-colors disabled:opacity-60">
                {generating ? 'Generating…' : 'Generate More'}
              </button>
              <button onClick={handleExport} className="px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors">
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
              generating ? (
                <div className="text-neutral-500">Generating…</div>
              ) : (
                <div className="text-neutral-600">No generations yet. Click &quot;Generate More&quot; to create some.</div>
              )
            )}
          </div>

          {true && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Mockup Studio</h3>
              {(() => {
                const sourceUrl = project.favorite_asset_url || (project.generations?.[0]?.url || '');
                if (!sourceUrl) {
                  return <div className="text-sm text-neutral-500">Select or generate a cover first.</div>;
                }
                return <MockupCanvas imageUrl={sourceUrl} defaultTitle={project.title} defaultAuthor={project.author} />;
              })()}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
} 