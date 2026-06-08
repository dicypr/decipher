# DECIPHER 💎

> Decode your day. Earn gems. Build streaks. Unlock themes.

A gamified productivity app with AI-powered daily reflections and weekly pattern insights.

## Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth + PostgreSQL)
- **AI**: Groq API (llama-3.3-70b)
- **Deployment**: Vercel

## Features
- 📋 Daily goal tracking with gem rewards
- ⏱️ Pomodoro timer (+5 gems per session)
- 💎 Gem economy — earn, spend, repair streaks
- 🔥 Streak system with streak shields
- 📊 GitHub-style yearly consistency grid
- 🎨 Themes marketplace (community contributed)
- 🤖 AI end-of-day reflection (Groq)
- 📈 AI weekly pattern insights (Groq)

## Setup

### 1. Clone and install
```bash
git clone https://github.com/dicypr/decipher
cd decipher
npm install
```

### 2. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the SQL Editor
3. Enable Google OAuth in Authentication > Providers (optional)

### 3. Environment variables
```bash
cp .env.local.example .env.local
```
Fill in your Supabase URL, anon key, and Groq API key.

### 4. Run locally
```bash
npm run dev
```

## Contributing Themes

Themes live in `/themes` as JSON files. Submit yours via PR:

```json
{
  "id": "your-theme-id",
  "name": "Your Theme Name",
  "author": "your-github-username",
  "price": 200,
  "colors": {
    "background": "#...",
    "primary": "#...",
    "accent": "#...",
    "text": "#...",
    "surface": "#..."
  }
}
```

## License
MIT
