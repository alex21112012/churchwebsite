# St. Archangel Michael Serbian Orthodox Church Website

**🎁 Built in 5 days as a birthday gift**

A production-ready, bilingual (English/Serbian Cyrillic) church website with full CMS capabilities.

## 🌟 Features

- ✅ **Bilingual content management** (English/Serbian Cyrillic)
- ✅ **Complete admin panel** for managing events, news, organizations, schedule, and history
- ✅ **File upload and storage** via Supabase
- ✅ **Serverless API deployment** on Vercel
- ✅ **Type-safe full-stack** TypeScript
- ✅ **Responsive design** with Tailwind CSS + shadcn/ui
- ✅ **Nearly free hosting** ($15/year with Vercel + Supabase free tiers)

## 🚀 Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Vercel Serverless Functions + Express (dev)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Styling:** Tailwind CSS + shadcn/ui
- **Monorepo:** pnpm workspaces

## 📁 Project Structure

```
├── api/                      # Vercel serverless functions (production)
├── lib/
│   ├── church-api/          # Shared API handlers
│   ├── api-client-react/   # Generated API client
│   ├── api-spec/           # OpenAPI schema
│   └── db/                 # Database schema
├── artifacts/
│   ├── api-server/         # Express dev server
│   ├── church-website/     # React frontend
│   └── data/               # Static data files
├── scripts/                # Build scripts
├── SUPABASE_SETUP.sql     # Database setup script
└── vercel.json            # Deployment config
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 24+
- pnpm (install with: `npm install -g pnpm`)
- Supabase account (free tier)
- Vercel account (free tier)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL in `SUPABASE_SETUP.sql` in Supabase SQL Editor
3. Create a storage bucket named `church-uploads` (public)
4. Get your project URL and service role key

### 3. Environment Variables

Create `.env` file in root (for development):

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PASSWORD=YourSecurePassword123!
PORT=8080
```

### 4. Development

**Run API server:**
```bash
pnpm --filter @workspace/api-server run dev
```

**Run frontend (in another terminal):**
```bash
pnpm --filter @workspace/church-website run dev
```

Frontend will be at: `http://localhost:5173`
API will be at: `http://localhost:8080`

### 5. Production Deployment

**Deploy to Vercel:**

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
4. Deploy!

**Build locally to test:**
```bash
NODE_ENV=production BASE_PATH=/ pnpm --filter @workspace/church-website run build
```

## 🔐 Admin Panel

Access the admin panel at: `https://yoursite.com/#admin`

Default password (change this!): `StMichael2024!`

### Admin Features:
- Manage church news (pinned and regular)
- Manage events with multiple images
- Manage organizations
- Update service schedule
- Edit church history with timeline
- Manage mission news (separate section)

## 📊 Database Schema

- `church_events` - Church events with bilingual content
- `church_organizations` - Church organizations (choir, folklore, etc.)
- `church_news` - Parish news and announcements
- `mission_news` - Mission-specific news
- `church_schedule` - Service schedule (singleton)
- `church_history` - Church history with timeline (singleton)

## 💰 Hosting Costs

**Current setup (free tier):**
- Vercel: $0/month (Hobby plan)
- Supabase: $0/month (Free tier, 500MB DB + 1GB storage)
- Domain: ~$15/year (.org domain)

**Total: ~$15/year** 🎉

**If you grow beyond free tier:**
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Total: ~$45/month

## 🌍 Bilingual Support

The site fully supports English and Serbian Cyrillic:
- All UI text is bilingual
- All content has English and Serbian versions
- Proper Cyrillic font support (Cormorant Garamond)
- Language switcher in navigation

## 📝 Content Management

Non-technical users can manage all content through the admin panel:
- No coding required
- Simple forms for all content types
- Image upload support
- Rich text editing for news/events
- Real-time preview

## 🔧 Maintenance

**Update content:**
- Use admin panel (no code changes needed)

**Update dependencies:**
```bash
pnpm update --recursive
```

**Type checking:**
```bash
pnpm run typecheck
```

## 🎓 Project Stats

- **Development time:** 5 days
- **Lines of code:** ~5,000+
- **Market value:** $12,000-16,000
- **Actual cost:** $0 (birthday gift)
- **Developer:** 4th semester CPA student at Seneca College

## 🤝 Contributing

This is a personal project, but if you want to improve it:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request



**Built with ❤️ by a student who wanted to give his brother the best birthday gift ever.**

*May St. Archangel Michael protect and guide this community.* 🙏
