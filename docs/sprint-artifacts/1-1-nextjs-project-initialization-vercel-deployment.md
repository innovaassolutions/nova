# Story 1.1: Next.js Project Initialization & Vercel Deployment

Status: done

## Story

As a developer,
I want to initialize a Next.js 15 project with TypeScript and deploy it to Vercel,
so that we have a working foundation for building NovaCRM.

## Acceptance Criteria

**Given** I need to start the NovaCRM project
**When** I initialize the Next.js 15 application
**Then** the project is created with the following configuration:
- Next.js 15.x with App Router enabled
- React 19.x
- TypeScript 5.3+ with strict mode
- TailwindCSS 3.4 configured
- ESLint and Prettier configured for code quality
- Git repository initialized with .gitignore

**And** when I configure TailwindCSS
**Then** the tailwind.config.ts includes:
- Catppuccin Mocha color palette variables [Source: Architecture.md§7.1, UX-Design.md§Design System Foundation]
- Innovaas Orange (#F25C05) primary color
- Plus Jakarta Sans font family integration
- Custom spacing scale and shadow system [Source: UX-Design.md§A.2, A.3]
- Responsive breakpoints: 768px (tablet), 1024px (desktop), 1440px (large) [Source: UX-Design.md§9.1]

**And** when I deploy to Vercel
**Then** the application deploys successfully via GitHub integration:
- Main branch auto-deploys to production
- Environment variables configured in Vercel dashboard
- Build completes in <2 minutes
- Live URL accessible at *.vercel.app domain

## Tasks / Subtasks

- [x] 1. Initialize Next.js 15 project with TypeScript (AC: 1)
  - [x] 1.1 Run `npx create-next-app@latest` with TypeScript template
  - [x] 1.2 Verify Next.js 15.x and React 19.x installed
  - [x] 1.3 Enable strict mode in tsconfig.json
  - [x] 1.4 Confirm App Router structure created (app/ directory)
  - [x] 1.5 Initialize Git repository with .gitignore

- [x] 2. Install and configure TailwindCSS 3.4 (AC: 2)
  - [x] 2.1 Install TailwindCSS, PostCSS, Autoprefixer
  - [x] 2.2 Create tailwind.config.ts with Catppuccin Mocha color palette
  - [x] 2.3 Add Innovaas Orange (#F25C05) as primary color
  - [x] 2.4 Configure responsive breakpoints (768px, 1024px, 1440px)
  - [x] 2.5 Set up custom spacing and shadow system
  - [x] 2.6 Test Tailwind classes render correctly

- [x] 3. Configure Google Fonts - Plus Jakarta Sans (AC: 2)
  - [x] 3.1 Install next/font package
  - [x] 3.2 Import Plus Jakarta Sans with weights 400, 600, 800
  - [x] 3.3 Apply font to layout.tsx globally
  - [x] 3.4 Verify font renders in browser

- [x] 4. Install core dependencies (AC: 1)
  - [x] 4.1 Install @supabase/supabase-js ^2.39.0
  - [x] 4.2 Install @supabase/ssr ^0.8.0
  - [x] 4.3 Install papaparse ^5.4.1 for CSV parsing
  - [x] 4.4 Verify all dependencies in package.json

- [x] 5. Configure environment variables template (AC: 1, 3)
  - [x] 5.1 Create .env.local.example with required variables
  - [x] 5.2 Add NEXT_PUBLIC_SUPABASE_URL placeholder
  - [x] 5.3 Add NEXT_PUBLIC_SUPABASE_ANON_KEY placeholder
  - [x] 5.4 Add SUPABASE_SERVICE_ROLE_KEY placeholder
  - [x] 5.5 Add .env.local to .gitignore

- [x] 6. Configure next.config.ts for Supabase images (AC: 1)
  - [x] 6.1 Add image domains: uavqmlqkuvjhgnuwcsqx.supabase.co
  - [x] 6.2 Verify image configuration syntax correct

- [x] 7. Set up ESLint and Prettier (AC: 1)
  - [x] 7.1 Configure ESLint with Next.js recommended rules
  - [x] 7.2 Install Prettier and eslint-config-prettier
  - [x] 7.3 Create .prettierrc with 2-space indentation
  - [x] 7.4 Run eslint and prettier to verify configuration

- [x] 8. Create initial homepage placeholder (AC: 1)
  - [x] 8.1 Edit app/page.tsx with "NovaCRM" title
  - [x] 8.2 Apply Catppuccin Mocha dark background
  - [x] 8.3 Style text with Plus Jakarta Sans and Innovaas Orange
  - [x] 8.4 Test homepage renders locally

- [x] 9. Initialize GitHub repository (AC: 3)
  - [x] 9.1 Create repository on GitHub: NovaCRM
  - [x] 9.2 Push initial commit to main branch
  - [x] 9.3 Verify repository accessible

- [x] 10. Deploy to Vercel (AC: 3)
  - [x] 10.1 Connect GitHub repository to Vercel
  - [x] 10.2 Configure build settings (Framework: Next.js, Build Command: auto)
  - [x] 10.3 Add environment variables in Vercel dashboard
  - [x] 10.4 Trigger deployment from main branch
  - [x] 10.5 Verify build completes in <2 minutes
  - [x] 10.6 Access live URL and confirm homepage renders
  - [x] 10.7 Test that Tailwind styles are applied correctly

- [x] 11. Verify all acceptance criteria satisfied (AC: All)
  - [x] 11.1 Next.js 15 + React 19 + TypeScript running
  - [x] 11.2 TailwindCSS with Catppuccin Mocha + Innovaas Orange configured
  - [x] 11.3 Vercel deployment successful with live URL
  - [x] 11.4 All environment variables template created
  - [x] 11.5 Git repository initialized and pushed

## Dev Notes

### Architecture Requirements

**Technology Stack** [Source: Architecture.md§1]
- **Framework:** Next.js 15 with App Router (file-based routing, server components default)
- **Language:** TypeScript 5.3+ with strict mode enabled
- **React Version:** 19.x (latest)
- **Database:** Supabase (PostgreSQL 15, Singapore region)
- **Deployment:** Vercel (serverless, GitHub integration)

**Key Dependencies (Exact Versions)** [Source: Architecture.md§1.1]
```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/ssr": "^0.8.0",
  "papaparse": "^5.4.1",
  "typescript": "^5.3.0"
}
```

**Supabase Connection Details** [Source: Architecture.md§1.3]
- Supabase URL: `https://uavqmlqkuvjhgnuwcsqx.supabase.co`
- Region: Asia-Pacific Southeast 1 (Singapore)
- Connection Pooling: PgBouncer (port 6543) for app, direct (port 5432) for migrations

**Image Configuration** [Source: Architecture.md§6.2]
- Add image domain to next.config.ts: `uavqmlqkuvjhgnuwcsqx.supabase.co`
- Required for Supabase Storage image optimization

### Design System Requirements

**Color Palette - Catppuccin Mocha** [Source: UX-Design.md§Design System Foundation]
```css
/* Base Colors */
--mocha-base: #1e1e2e         /* Primary background */
--mocha-mantle: #181825       /* Elevated surfaces (cards, sidebar) */
--mocha-crust: #11111b        /* Deepest background */
--mocha-surface0: #313244     /* Interactive elements */
--mocha-surface1: #45475a     /* Hover states */
--mocha-surface2: #585b70     /* Borders, dividers */

/* Text Colors */
--mocha-text: #cdd6f4         /* Primary text (high contrast) */
--mocha-subtext0: #a6adc8     /* Secondary text, labels */
--mocha-subtext1: #bac2de     /* Tertiary text */
--mocha-overlay0: #6c7086     /* Disabled text, placeholders */

/* Innovaas Brand */
--innovaas-orange: #F25C05      /* Primary brand color, CTAs */
--innovaas-orange-hover: #D94C04 /* Hover state */
--innovaas-orange-soft: #ff7b3d  /* Accents, gradients */

/* Accents (Data Visualization) */
--mocha-blue: #89b4fa        /* Info, data points */
--mocha-green: #a6e3a1       /* Success, positive metrics */
--mocha-red: #f38ba8         /* Error, negative metrics */
--mocha-yellow: #f9e2af      /* Warning, pending states */
```

**Typography - Plus Jakarta Sans** [Source: UX-Design.md§Typography]
- **Font Stack:** 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif
- **Weights to load:** 400 (Regular), 600 (Semi Bold), 800 (Extra Bold)
- **Implementation:** Use next/font/google for optimization
- **Global Application:** Apply to body via layout.tsx

**Font Weights Usage:**
- 800 (Extra Bold): Page titles, logo "Nova", stat values
- 700 (Bold): Card titles, table data values, company names
- 600 (Semi Bold): Nav labels, stat labels, buttons, table headers
- 400 (Regular): Body text, descriptions, table cells

**Type Scale:**
- Page Title: 2rem (32px), weight 800
- Card Title: 1.25rem (20px), weight 700
- Body: 1rem (16px), weight 400
- Small: 0.875rem (14px), weight 400
- Tiny: 0.75rem (12px), weight 600

**Responsive Breakpoints** [Source: UX-Design.md§9.1]
```javascript
screens: {
  'sm': '640px',   // Default Tailwind
  'md': '768px',   // Tablet (sidebar collapses to icons)
  'lg': '1024px',  // Desktop (full sidebar)
  'xl': '1440px',  // Large desktop
}
```

**Spacing Scale** [Source: UX-Design.md§A.2]
- Base unit: 0.25rem (4px)
- Spacing follows Tailwind defaults (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64)

**Shadow System** [Source: UX-Design.md§A.3]
```javascript
boxShadow: {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  orange: '0 4px 12px rgba(242, 92, 5, 0.3)', // For orange elements
}
```

### File Structure Requirements

**Expected Directory Structure After Initialization:**
```
NovaCRM/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with font configuration
│   ├── page.tsx            # Homepage placeholder
│   ├── globals.css         # Global styles, Tailwind imports
│   └── lib/                # Utilities (create for Supabase clients later)
├── public/                 # Static assets
├── .env.local.example      # Environment variables template
├── .gitignore              # Git exclusions
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier configuration
└── README.md               # Project documentation
```

### Testing Requirements

**Manual Verification Tests:**
1. **Local Development Server:**
   - Run `npm run dev`
   - Verify server starts on port 3000
   - Check console for no errors
   - Access http://localhost:3000
   - Verify dark background (Catppuccin Mocha) renders
   - Verify Plus Jakarta Sans font loads
   - Verify Innovaas Orange (#F25C05) accent renders

2. **Tailwind Configuration Test:**
   - Apply various Tailwind classes to test elements
   - Test responsive breakpoints (resize browser to 768px, 1024px)
   - Test custom colors: `bg-mocha-base`, `text-innovaas-orange`
   - Test custom shadows: `shadow-orange`

3. **Build Process Test:**
   - Run `npm run build`
   - Verify build completes successfully
   - Check for no TypeScript errors
   - Check for no ESLint warnings (blockers only)
   - Run `npm run start` to test production build
   - Verify production build renders correctly

4. **Vercel Deployment Test:**
   - Trigger deployment from GitHub push
   - Monitor build logs in Vercel dashboard
   - Verify build completes in <2 minutes
   - Access production URL (*.vercel.app)
   - Verify homepage renders with correct styling
   - Test on mobile device (responsive design)

**No Automated Tests Required for This Story:**
- This is infrastructure setup
- Manual verification sufficient for MVP
- Automated tests will be added in future stories for application logic

### Technical Implementation Guidance

**Step-by-Step Implementation Guide:**

1. **Create Next.js Project:**
   ```bash
   npx create-next-app@latest novacrm --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
   cd novacrm
   ```
   - Answer prompts: TypeScript (Yes), ESLint (Yes), Tailwind (Yes), src/ directory (No), App Router (Yes), import alias (Yes, @/*)

2. **Install Core Dependencies:**
   ```bash
   npm install @supabase/supabase-js@2.39.0 @supabase/ssr@0.8.0 papaparse@5.4.1
   npm install --save-dev @types/papaparse prettier eslint-config-prettier
   ```

3. **Configure TailwindCSS (tailwind.config.ts):**
   ```typescript
   import type { Config } from "tailwindcss";

   const config: Config = {
     content: [
       "./pages/**/*.{js,ts,jsx,tsx,mdx}",
       "./components/**/*.{js,ts,jsx,tsx,mdx}",
       "./app/**/*.{js,ts,jsx,tsx,mdx}",
     ],
     theme: {
       extend: {
         colors: {
           // Catppuccin Mocha Base Colors
           'mocha-base': '#1e1e2e',
           'mocha-mantle': '#181825',
           'mocha-crust': '#11111b',
           'mocha-surface0': '#313244',
           'mocha-surface1': '#45475a',
           'mocha-surface2': '#585b70',

           // Catppuccin Mocha Text Colors
           'mocha-text': '#cdd6f4',
           'mocha-subtext0': '#a6adc8',
           'mocha-subtext1': '#bac2de',
           'mocha-overlay0': '#6c7086',
           'mocha-overlay1': '#7f849c',
           'mocha-overlay2': '#9399b2',

           // Innovaas Brand Colors
           'innovaas-orange': '#F25C05',
           'innovaas-orange-hover': '#D94C04',
           'innovaas-orange-soft': '#ff7b3d',

           // Catppuccin Mocha Accents
           'mocha-blue': '#89b4fa',
           'mocha-sapphire': '#74c7ec',
           'mocha-teal': '#94e2d5',
           'mocha-green': '#a6e3a1',
           'mocha-yellow': '#f9e2af',
           'mocha-peach': '#fab387',
           'mocha-red': '#f38ba8',
           'mocha-lavender': '#b4befe',
           'mocha-mauve': '#cba6f7',
         },
         fontFamily: {
           sans: ['var(--font-plus-jakarta-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
         },
         boxShadow: {
           orange: '0 4px 12px rgba(242, 92, 5, 0.3)',
         },
       },
       screens: {
         'sm': '640px',
         'md': '768px',
         'lg': '1024px',
         'xl': '1440px',
       },
     },
     plugins: [],
   };
   export default config;
   ```

4. **Configure Google Fonts (app/layout.tsx):**
   ```typescript
   import { Plus_Jakarta_Sans } from 'next/font/google';
   import './globals.css';

   const plusJakartaSans = Plus_Jakarta_Sans({
     subsets: ['latin'],
     weight: ['400', '600', '800'],
     variable: '--font-plus-jakarta-sans',
   });

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en">
         <body className={`${plusJakartaSans.variable} font-sans bg-mocha-base text-mocha-text antialiased`}>
           {children}
         </body>
       </html>
     );
   }
   ```

5. **Update Global Styles (app/globals.css):**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   @layer base {
     html {
       @apply bg-mocha-base;
     }
     body {
       @apply text-mocha-text;
     }
   }
   ```

6. **Create Homepage Placeholder (app/page.tsx):**
   ```typescript
   export default function Home() {
     return (
       <main className="min-h-screen flex items-center justify-center bg-mocha-base">
         <div className="text-center">
           <h1 className="text-6xl font-extrabold mb-4">
             <span className="text-innovaas-orange">Nova</span>
             <span className="text-mocha-text">CRM</span>
           </h1>
           <p className="text-mocha-subtext0 text-lg">
             LinkedIn-first CRM for INNOVAAS Sales Team
           </p>
         </div>
       </main>
     );
   }
   ```

7. **Configure next.config.ts:**
   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     images: {
       domains: ['uavqmlqkuvjhgnuwcsqx.supabase.co'],
     },
   };

   export default nextConfig;
   ```

8. **Create Environment Variables Template (.env.local.example):**
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

9. **Configure Prettier (.prettierrc):**
   ```json
   {
     "semi": true,
     "singleQuote": true,
     "tabWidth": 2,
     "trailingComma": "es5"
   }
   ```

10. **Update .eslintrc.json:**
    ```json
    {
      "extends": [
        "next/core-web-vitals",
        "prettier"
      ]
    }
    ```

11. **Initialize Git and Push to GitHub:**
    ```bash
    git init
    git add .
    git commit -m "Initial commit: Next.js 15 + TypeScript + TailwindCSS + Catppuccin Mocha"
    # Create repository on GitHub, then:
    git remote add origin https://github.com/your-username/novacrm.git
    git branch -M main
    git push -u origin main
    ```

12. **Deploy to Vercel:**
    - Go to https://vercel.com/new
    - Import GitHub repository
    - Framework Preset: Next.js (auto-detected)
    - Build Command: `next build` (default)
    - Output Directory: `.next` (default)
    - Add environment variables:
      - NEXT_PUBLIC_SUPABASE_URL
      - NEXT_PUBLIC_SUPABASE_ANON_KEY
      - SUPABASE_SERVICE_ROLE_KEY
    - Click "Deploy"
    - Wait for build to complete (<2 minutes)
    - Access production URL

### Project Context Reference

**Related Documentation:**
- [Architecture.md](../Architecture.md) - Complete technical architecture
- [UX-Design.md](../UX-Design.md) - Complete design system specification
- [PRD.md](../prd.md) - Product requirements

**Related Stories:**
- **Next Story:** 1.2 - Supabase Database Setup & Schema Initialization
- **Depends On:** None (foundation story)

### Known Issues and Considerations

**Potential Issues:**
1. **Next.js 15 + React 19 Compatibility:** Ensure using latest versions, some packages may have peer dependency warnings
2. **Vercel Build Time:** First deployment may take longer due to dependency installation caching
3. **Environment Variables:** Must be set in Vercel dashboard before deployment succeeds
4. **Font Loading:** Plus Jakarta Sans may flash FOUT (Flash of Unstyled Text) on slow connections - acceptable for MVP

**Future Enhancements (Not in Scope):**
- Custom 404 and error pages
- Favicon and app icons
- SEO metadata (Open Graph, Twitter Cards)
- Analytics integration (Vercel Analytics)
- Performance monitoring

### References

All technical details cited with source paths:
- [Source: Architecture.md§1 - Technology Stack]
- [Source: Architecture.md§1.1 - Key Dependencies]
- [Source: Architecture.md§1.3 - Supabase Connection Details]
- [Source: Architecture.md§6.1 - Vercel Deployment Configuration]
- [Source: Architecture.md§6.2 - Image Domain Configuration]
- [Source: UX-Design.md§Design System Foundation - Color Palette]
- [Source: UX-Design.md§Typography - Font Configuration]
- [Source: UX-Design.md§9.1 - Responsive Breakpoints]
- [Source: UX-Design.md§A.2 - Spacing Scale]
- [Source: UX-Design.md§A.3 - Shadow System]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context will be added by execution workflow -->

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Implementation Plan

Verified existing Next.js 15 setup and implemented missing design system configuration:
1. Verified Tasks 1, 4, 9 already completed (Next.js project, dependencies, GitHub repo)
2. Configured TailwindCSS with complete Catppuccin Mocha color palette (Task 2)
3. Integrated Plus Jakarta Sans font in layout.tsx (Task 3)
4. Created .env.local.example template (Task 5)
5. Configured Supabase image domains in next.config.ts (Task 6)
6. Installed Prettier and created .prettierrc configuration (Task 7)
7. Updated homepage with Catppuccin Mocha dark theme and Innovaas Orange branding (Task 8)
8. Tested local development server and production build (Task 8.4)
9. Committed and pushed changes to GitHub (Task 9)

### Debug Log References

- Development server started successfully at http://localhost:3000
- Production build completed in 2.9s
- All TypeScript strict mode checks passed
- No ESLint errors

### Completion Notes List

**Completed:**
- ✅ Next.js 15.5.7 with React 19.x and TypeScript 5.3+ configured
- ✅ TailwindCSS 3.4 with complete Catppuccin Mocha color palette
- ✅ Innovaas Orange (#F25C05) configured as primary brand color
- ✅ Responsive breakpoints: 768px (md), 1024px (lg), 1440px (xl)
- ✅ Plus Jakarta Sans font with weights 400, 600, 800
- ✅ Global styles with Catppuccin Mocha base colors (bg-mocha-base, text-mocha-text)
- ✅ **Nova CRM logo integrated** from @designguidanceandlogo/ directory
  - Horizontal logo (200×60px) displayed on homepage
  - Icon logo (60×60px) configured as favicon
  - Exploding star/nova design with Innovaas Orange core
  - Follows official brand guidelines (20px clear space, dark background optimized)
- ✅ Supabase image domain configured (uavqmlqkuvjhgnuwcsqx.supabase.co)
- ✅ Environment variables template created (.env.local.example)
- ✅ Prettier configured with 2-space indentation
- ✅ Production build successful (1.4s with logo optimization)
- ✅ Changes committed and pushed to GitHub (commits 3af4ce1, a301424)
- ✅ **Vercel deployment verified and live** at https://nova-cyan-mu.vercel.app/
  - Homepage renders correctly with Nova CRM logo
  - Catppuccin Mocha dark theme applied (bg-mocha-base, text-mocha-text)
  - Plus Jakarta Sans font loading correctly
  - Favicon (nova-crm-icon.svg) configured
  - Vercel cache optimized (HIT status)
  - Build time: <2 minutes ✅
  - All environment variables configured in Vercel dashboard

### File List

**Modified Files:**
- `app/layout.tsx` - Added Plus Jakarta Sans font configuration, Catppuccin Mocha styling, and favicon metadata
- `app/page.tsx` - Integrated Nova CRM logo with Next.js Image component
- `app/globals.css` - Updated with Catppuccin Mocha base colors
- `tailwind.config.ts` - Complete Catppuccin Mocha color palette and custom configuration
- `next.config.ts` - Added Supabase image domain configuration
- `package.json` - Added Prettier and eslint-config-prettier
- `package-lock.json` - Updated lockfile
- `tsconfig.json` - TypeScript configuration adjustments from Next.js

**Created Files:**
- `.prettierrc` - Prettier configuration (2-space indentation, single quotes)
- `.env.local.example` - Environment variables template for Supabase credentials
- `public/nova-crm-logo.svg` - Horizontal logo (200×60px) from design guidance
- `public/nova-crm-logo-stacked.svg` - Stacked logo (140×100px) for mobile/sidebar
- `public/nova-crm-icon.svg` - Icon logo (60×60px) for favicon and app icons

## Change Log

- 2025-12-09: Story created from Epic 1, Story 1.1 with comprehensive context
