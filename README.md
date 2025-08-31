# CV Portfolio - Backend Engineer

Modern portfolio website built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 🌍 **Internationalization** - Polish and English support with next-intl
- 🎨 **Modern UI** - Tailwind CSS with shadcn/ui components
- 🌙 **Dark Mode** - Theme switching with system preference detection
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Performance** - Optimized with Next.js App Router
- 🔍 **SEO Optimized** - Meta tags, sitemap, and robots.txt
- 🧪 **Testing** - Jest and React Testing Library
- 🎭 **Animations** - Framer Motion with reduced motion support
- 📊 **Analytics** - Microsoft Clarity for behavioral analysis
- 🔒 **Privacy** - GDPR-compliant consent management

## Analytics & Privacy

### Microsoft Clarity
This project includes Microsoft Clarity for behavioral analytics:
- Session recordings
- Heatmaps (clicks, scroll, mouse movement)
- User behavior insights
- GDPR-compliant consent management

### Privacy Features
- Consent banner with granular controls
- Local storage for user preferences
- Respect for user privacy choices
- No tracking without explicit consent

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kod5-cursor-vibing
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure Microsoft Clarity:
   - Get your Project ID from [Microsoft Clarity](https://clarity.microsoft.com/)
   - Add `NEXT_PUBLIC_CLARITY_PROJECT_ID=your_project_id` to `.env.local`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run end-to-end tests

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── lib/                  # Utility functions and hooks
│   ├── hooks/            # Custom React hooks
│   └── ...               # Other utilities
├── messages/             # Internationalization files
├── public/               # Static assets
├── __tests__/            # Test files
└── docs/                 # Documentation
```

## Analytics Configuration

### Microsoft Clarity Setup

1. **Get Project ID**:
   - Visit [Microsoft Clarity](https://clarity.microsoft.com/)
   - Create a new project for your domain
   - Copy the Project ID from project settings

2. **Environment Variables**:
   ```bash
   NEXT_PUBLIC_CLARITY_PROJECT_ID=your_clarity_project_id
   ```

3. **Consent Management**:
   - Users will see a consent banner on first visit
   - They can accept/reject all or customize individual settings
   - Preferences are stored in localStorage
   - Clarity only loads after user consent

### Privacy Compliance

The analytics implementation follows GDPR/RODO requirements:
- ✅ Explicit consent before tracking
- ✅ Granular control over different analytics tools
- ✅ Easy opt-out mechanism
- ✅ Transparent data collection practices
- ✅ No tracking without consent

## Testing

### Unit Tests
```bash
npm test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Type Checking
```bash
npm run type-check
```

## Deployment

The application is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub.
