# CV Portfolio - Backend Engineer

A modern, responsive CV portfolio website built with Next.js 14, TypeScript, and Tailwind CSS. Features internationalization support (Polish/English) and follows best practices for accessibility and SEO.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Animations**: Framer Motion with reduced motion support
- **Internationalization**: next-intl with Polish and English support
- **SEO Optimized**: next-seo and next-sitemap integration
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Responsive Design**: Mobile-first approach with beautiful gradients
- **Dark Mode Support**: Automatic theme switching

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Internationalization**: next-intl
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cv-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Internationalization

The website supports Polish (default) and English languages:

- Polish: `/pl` or `/` (default)
- English: `/en`

Translation files are located in the `messages/` directory.

## 🎨 Customization

### Hero Section
The main hero section includes:
- AI-generated avatar (placeholder SVG with gradient)
- Professional title and tagline
- Description text
- Call-to-action buttons (Download CV, Contact)

### Styling
- Uses CSS variables for theming
- Supports light and dark modes
- Responsive design with mobile-first approach
- Beautiful gradient backgrounds

## 📁 Project Structure

```
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx      # Root layout with i18n
│   │   └── page.tsx        # Home page
│   ├── api/
│   │   └── avatar/         # Avatar API route
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── HeroSection.tsx     # Main hero component
├── lib/
│   └── utils.ts           # Utility functions
├── messages/              # i18n translation files
├── middleware.ts          # i18n middleware
└── i18n.ts               # i18n configuration
```

## 🚀 Deployment

The project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
