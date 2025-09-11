"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [vibe, setVibe] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const createRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, genre, vibe, color }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok) throw new Error(createJson.error || 'Failed to create project');

      const projectId = createJson.project.id;

      // Kick off generation (fire-and-forget)
      fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, genre, vibe, color, projectId }),
      }).catch(() => {});

      router.push(`/project/${projectId}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">Tell Mamette About Your Book</h1>
            <p className="text-neutral-600">Share your vision and let's create something beautiful together</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Book Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent" placeholder="Enter your book title..." required />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Author Name</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent" placeholder="Your name as it should appear" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Genre</label>
                <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent" required>
                  <option value="">Select a genre...</option>
                  <option value="fiction">Fiction</option>
                  <option value="mystery">Mystery/Thriller</option>
                  <option value="romance">Romance</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="sci-fi">Science Fiction</option>
                  <option value="non-fiction">Non-Fiction</option>
                  <option value="memoir">Memoir</option>
                  <option value="poetry">Poetry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Mood & Keywords</label>
                <textarea className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent" rows={3} value={vibe} onChange={(e) => setVibe(e.target.value)} placeholder="Describe the mood, atmosphere, or key visual elements..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Color Vibe</label>
                <div className="grid grid-cols-4 gap-3">
                  {['Warm', 'Cool', 'Dark', 'Bright', 'Earthy', 'Vibrant', 'Muted', 'Monochrome'].map((label) => {
                    const key = label.toLowerCase();
                    const selected = color === key;
                    return (
                      <button type="button" key={label} onClick={() => setColor(selected ? undefined : key)} className={`px-4 py-2 border rounded-lg transition-colors ${selected ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 hover:bg-neutral-100'}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button type="submit" disabled={submitting} className="w-full bg-neutral-800 text-white py-4 rounded-lg hover:bg-neutral-700 transition-colors font-medium disabled:opacity-60">
                {submitting ? 'Generating…' : 'Generate Cover Concepts'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 