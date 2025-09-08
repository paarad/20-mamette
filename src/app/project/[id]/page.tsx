export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                Your Cover Concepts
              </h1>
              <p className="text-neutral-600">
                Choose your favorite and add your title overlay
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2 border border-neutral-200 rounded-lg hover:bg-white transition-colors">
                Generate More
              </button>
              <button className="px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                Export Selected
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cover Grid */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-[2/3] bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                    <div className="text-neutral-500 text-center">
                      <div className="w-16 h-16 bg-neutral-400 rounded-lg mx-auto mb-3"></div>
                      <p className="text-sm">Generated Cover {i}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Concept {i}</span>
                      <button className="text-sm text-neutral-800 hover:underline">
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Text Overlay Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-neutral-800 mb-6">
                Text Overlay
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                    placeholder="Your book title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                    placeholder="Author name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Typography Style
                  </label>
                  <div className="space-y-2">
                    {[
                      { name: 'Serif Classic', desc: 'Literary & Historical' },
                      { name: 'Bold Sans', desc: 'Thriller & Non-fiction' },
                      { name: 'Elegant Script', desc: 'Romance & Poetry' }
                    ].map((style) => (
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    {['#FFFFFF', '#000000', '#8B4513', '#FFD700', '#DC143C'].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 border-neutral-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <button className="w-full bg-neutral-800 text-white py-3 rounded-lg hover:bg-neutral-700 transition-colors">
                  Apply Text Overlay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 