export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">
              Tell Mamette About Your Book
            </h1>
            <p className="text-neutral-600">
              Share your vision and let's create something beautiful together
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Book Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                  placeholder="Enter your book title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Author Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                  placeholder="Your name as it should appear"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Genre
                </label>
                <select className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent">
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
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Mood & Keywords
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the mood, atmosphere, or key visual elements... (e.g., dark and mysterious, bright and hopeful, vintage library)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Color Vibe
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {['Warm', 'Cool', 'Dark', 'Bright', 'Earthy', 'Vibrant', 'Muted', 'Monochrome'].map((vibe) => (
                    <button
                      key={vibe}
                      className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>
              
              <button className="w-full bg-neutral-800 text-white py-4 rounded-lg hover:bg-neutral-700 transition-colors font-medium">
                Generate Cover Concepts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 