# 🎨 Mamette - Your AI Muse for Book Covers

Beautiful, on-brand book covers in seconds. Just give Mamette your title, vibe, and vision—she'll do the rest.

## ✨ Features

- **Lightning Fast**: From concept to cover in under 60 seconds
- **AI-Powered**: DALL-E 3 integration for stunning book cover concepts
- **Multiple Formats**: Export for ebook (JPG), print (PDF), and social media (square)
- **Typography System**: Three elegant presets (Serif Classic, Bold Sans, Elegant Script)
- **Author-Friendly**: Designed specifically for indie authors and publishers

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI DALL-E 3
- **Styling**: Tailwind CSS with neutral design system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:paarad/20-mamette.git
   cd 20-mamette
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the SQL schema from `src/lib/database.sql` in your Supabase SQL editor
   - This will create all necessary tables with Row Level Security

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 User Flow

1. **Describe your book** (title, author, genre, vibe)
2. **Generate 4-8 unique cover images** using DALL-E
3. **Add title + author overlay** with typography presets
4. **Export your favorite** in the format you need
5. **Save or share** your cover

## 🎯 Export Formats

| Format | Specifications |
|--------|---------------|
| **Ebook JPG** | 1024×1536 @ 72 DPI |
| **Print PDF** | 6×9 in @ 300 DPI with bleed |
| **Square JPG** | 1080×1080 for social media |

## 🏗 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── new/                  # Cover creation flow
│   ├── project/[id]/         # Project view & editor
│   ├── library/              # User's saved covers
│   └── api/
│       ├── generate/         # DALL-E generation
│       └── projects/         # Project management
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── mamette/              # Custom components
├── lib/
│   ├── supabase.ts          # Database client
│   ├── database.sql         # Schema & migrations
│   └── utils.ts             # Utilities
└── types/                   # TypeScript definitions
```

## 🎨 Brand & Design

**Tone**: Creative, elegant, slightly nostalgic  
**Style**: Light, neutral UI with boutique/artistic vibes  
**Mascot**: Mamette - your gentle French artistic assistant  

## 🔧 Development

### Key Components

- **Project Creation Flow** (`/new`): Step-by-step book cover creation
- **Cover Gallery** (`/project/[id]`): Generated covers with text overlay editor
- **Library** (`/library`): User's saved projects and covers

### API Routes

- `POST /api/projects` - Create new project
- `GET /api/projects` - Fetch user projects  
- `POST /api/generate` - Generate cover concepts with DALL-E

### Database Schema

See `src/lib/database.sql` for complete schema including:
- Users, Projects, Generations, Assets, Favorites
- Row Level Security policies
- Optimized indexes

## 🎭 AI Prompt System

Mamette uses a sophisticated prompt system:

```
System: "You are an award-winning book cover designer..."
Dynamic: "A [genre] book cover, [style], [color], [vibe]..."
```

Genre-specific styles ensure covers match expectations while maintaining artistic quality.

## 📈 Success Metrics

- % of users who export at least 1 cover
- Time-to-first-cover (target: < 1 min)
- Number of variations generated per project
- User return rate

## 🔮 Future Ideas

- **Mockups**: Kindle, physical book, social banners
- **Series Consistency**: Theme locking across multiple books  
- **Prompt Presets**: Genre-specific starting points
- **Voice Input**: "Tell Mamette your story"
- **AI Feedback**: Smart suggestions for cover optimization

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ for indie authors and publishers worldwide.
