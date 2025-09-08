export default function LibraryPage() {
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
            <button className="px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors">
              Create New Cover
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-700">Genre:</label>
              <select className="px-3 py-1 border border-neutral-200 rounded-md text-sm">
                <option value="">All Genres</option>
                <option value="fiction">Fiction</option>
                <option value="mystery">Mystery</option>
                <option value="romance">Romance</option>
                <option value="fantasy">Fantasy</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-700">Sort by:</label>
              <select className="px-3 py-1 border border-neutral-200 rounded-md text-sm">
                <option value="recent">Most Recent</option>
                <option value="title">Title A-Z</option>
                <option value="genre">Genre</option>
              </select>
            </div>
            <div className="ml-auto">
              <div className="flex gap-2">
                <button className="p-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button className="p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 bg-neutral-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 hover:shadow-md transition-shadow group">
              <div className="aspect-[2/3] bg-gradient-to-br from-neutral-200 to-neutral-300 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-neutral-500 text-center">
                    <div className="w-12 h-12 bg-neutral-400 rounded-lg mx-auto mb-2"></div>
                    <p className="text-xs">Cover {i}</p>
                  </div>
                </div>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <button className="p-2 bg-white rounded-lg shadow-md hover:bg-neutral-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-white rounded-lg shadow-md hover:bg-neutral-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-neutral-800 mb-1 truncate">
                  The Mystery of Book {i}
                </h3>
                <p className="text-sm text-neutral-600 mb-2">Author Name</p>
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full">
                    Mystery
                  </span>
                  <span className="text-xs text-neutral-500">
                    2 days ago
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (show when no projects) */}
        {false && (
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
            <button className="px-8 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors">
              Create Your First Cover
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 