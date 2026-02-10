# Resolut

**Optimize your resume, get the job you want.**

AI-powered resume customization tool that tailors your resume for specific job postings while preserving your authentic voice and tone.

## Features

- 🎯 **ATS Optimization** - Automatically incorporates relevant keywords from job descriptions
- 🎨 **Tone Preservation** - Maintains your unique writing style and personality
- 📄 **2-Page Enforcement** - Keeps resumes concise and recruiter-friendly
- 🔄 **Easy Comparison** - Side-by-side view of original vs. optimized resume
- 📥 **PDF Export** - Download professionally formatted PDFs
- 📋 **Text Copy** - Quick copy for application forms
- 🌓 **Dark/Light Mode** - Beautiful UI with theme switching
- 🔒 **Password Protected** - Secure beta access control

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Claude API (Anthropic)
- **Document Parsing:** unpdf, mammoth
- **PDF Generation:** @react-pdf/renderer
- **State Management:** Zustand
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Anthropic API key ([get one here](https://console.anthropic.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/resolut.git
cd resolut

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY and BETA_PASSWORD to .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create a `.env.local` file with:

```env
ANTHROPIC_API_KEY=your_api_key_here
BETA_PASSWORD=your_beta_password_here
```

## How It Works

1. **Upload Resume** - PDF or DOCX format
2. **Paste Job URL** - From LinkedIn, Indeed, or any job board
3. **AI Customization** - Claude analyzes your tone and optimizes with ATS keywords
4. **Download** - Get your customized resume as PDF or copy text

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add ANTHROPIC_API_KEY
vercel env add BETA_PASSWORD

# Deploy to production
vercel --prod
```

## Cost Optimization

- Uses Claude 3 Haiku for keyword extraction (~$0.01-0.03 per job)
- Uses Claude Sonnet 4.5 for resume customization (~$0.08-0.25 per resume)
- Total cost per customization: ~$0.10-0.30

## Security

- Password-protected beta access
- Secure cookie-based authentication
- Environment variables for sensitive data
- No data persistence - all processing is stateless

## Project Structure

```
resume-customizer/
├── app/
│   ├── api/          # API routes
│   ├── login/        # Auth page
│   └── page.tsx      # Main app
├── components/
│   ├── resume/       # Resume components
│   ├── job/          # Job input components
│   ├── theme/        # Theme toggle
│   └── ui/           # UI primitives
├── lib/
│   ├── claude/       # Claude API client
│   ├── parsers/      # Document parsers
│   ├── generators/   # PDF generator
│   └── store/        # Zustand store
└── middleware.ts     # Auth middleware
```

## License

MIT

## Acknowledgments

- Built with [Claude AI](https://claude.ai)
- Powered by [Anthropic API](https://anthropic.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)

---

**Timeline:** Built in ~9 hours from concept to deployed beta 🚀

Made with ❤️ by [Your Name]

# Deployment test - Mon Feb  9 21:54:01 PST 2026

# Deployment test 2 - Mon Feb  9 21:58:32 PST 2026
# Trigger deployment Mon Feb  9 23:28:21 PST 2026
