# ElMourdy Educational Platform

The production frontend for **ElMourdy**, a complete Arabic learning platform built for secondary-school students, parents, teachers, and teaching assistants.

ElMourdy combines structured curriculum delivery, protected video lessons, assessments, progress tracking, family visibility, and day-to-day platform administration in a responsive Arabic-first experience. The application is live at [mourdy.com](https://mourdy.com).

## What Makes ElMourdy Different

- A native right-to-left interface designed specifically for Arabic content
- Dedicated experiences for students, parents, teachers, and assistants
- Real API-backed data instead of client-side demo records
- Protected adaptive video playback with multiple HLS quality levels
- Fine-grained role and assistant permission enforcement
- Student progress, examination results, error review, and attendance insights
- Teacher tools for managing the complete academic and operational workflow
- Paginated administration screens for large operational datasets
- Locally hosted Cairo fonts, responsive layouts, dark mode, and accessible navigation

## Platform Experiences

### Students

- Create and verify an account
- Browse subjects, chapters, lessons, and lectures
- Redeem lesson activation codes
- Watch protected adaptive-streaming videos
- Resume playback from the last saved position
- Take grade-scoped examinations and review mistakes
- Track academic progress and announcements
- Manage account security and registered devices

### Parents

- Register a dedicated parent account
- Access linked students through the verified parent phone number
- Review results, mistakes, activity, and progress
- Switch between multiple linked students from one dashboard

### Teachers

- Monitor live operational and academic dashboard metrics
- Manage students, parents, enrollments, devices, and account status
- Preview the platform exactly as a selected student sees it
- Create and organize academic years and curriculum content
- Upload, process, publish, retry, and remove lecture videos
- Add lecture thumbnails, descriptions, attachments, scheduling, and free-preview access
- Create examinations, announcements, and activation-code batches
- Review detailed reports and support requests
- Create assistants and assign granular permissions
- Review human-readable assistant activity logs

### Teaching Assistants

- Access only the administrative areas explicitly granted by the teacher
- Process student, device, support, content, assessment, code, and reporting tasks
- Produce auditable administrative actions without exposing student activity in the assistant audit view

## Technology Stack

| Area | Technology |
| --- | --- |
| UI | React 18, TypeScript, Tailwind CSS 4 |
| Build | Vite 6 |
| Video | HLS.js with native HLS fallback |
| Icons | Lucide React |
| Testing | Vitest, Testing Library, JSDOM |
| Quality | TypeScript and ESLint |
| Hosting | Vercel with SPA rewrites and immutable font caching |
| API | Ruby on Rails backend in the separate `ElMourdy_Backend` repository |

## Architecture

```text
src/
├── app/          Application bootstrap, routing, policies, and error handling
├── assets/       Source-controlled visual and font assets
├── features/     Role-oriented pages and complete user workflows
├── shared/       API clients, authentication, domain services, and reusable UI
└── styles/       Design tokens, themes, local fonts, and global behavior

public/
├── fonts/        Self-hosted Cairo webfont files
├── robots.txt    Search crawler policy
├── sitemap.xml   Public search index map
└── *.html        Privacy, terms, and data-deletion documents
```

The route policy is enforced before rendering protected pages. Authentication state is restored from the backend session API, while shared domain clients keep network behavior independent from page components.

## Local Development

Copy `.env.example` to `.env.local` when you need to override the API endpoint. Production defaults to `https://api.mourdy.com/api`, while local development defaults to `http://localhost:3000/api`.

### Requirements

- Node.js 20 or newer
- npm
- A running ElMourdy Rails API

### Installation

```bash
git clone https://github.com/MoemenAbdElMordy/ElMourdy.git
cd ElMourdy
npm install
```

Create a local `.env` file when the backend is not running on the default address:

```env
VITE_API_URL=http://127.0.0.1:3000/api
```

Start the development server:

```bash
npm run dev
```

Vite will print the local URL, normally `http://localhost:5173`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm run typecheck` | Validate the complete TypeScript project |
| `npm run lint` | Run ESLint with zero warnings allowed |
| `npm run test` | Run the automated frontend tests |
| `npm run build` | Generate the optimized production bundle |
| `npm run check` | Run type checking, linting, tests, and production build |

## Video Playback

The player requests a short-lived playback session from the backend and plays HLS manifests through HLS.js where necessary. It supports multiple qualities, secure delivery URLs, playback-position persistence, moving student watermarks, curriculum navigation, and lecture notes.

Lecture cards use teacher-managed thumbnails and show the student's saved progress. The dashboard identifies the most recently watched unfinished lecture and opens it at the last persisted playback position.

Original media files and storage credentials never pass through the frontend repository.

## Performance and User Experience

- Cairo Arabic and Latin subsets are hosted on the same origin and preloaded before application startup
- Font files use long-lived immutable browser caching
- Route-level application code is split from the initial public bundle
- Scrollbars remain visually hidden without disabling mouse, keyboard, or touch scrolling
- Modals preserve focus and scroll position during controlled input updates
- Layouts adapt across mobile, tablet, and desktop breakpoints
- Shared pagination keeps large administrative lists responsive and consistent

## Security Model

- The backend is the source of truth for identity, role, status, and permissions
- Protected routes reject unauthorized roles before rendering their page
- The frontend never determines privileges from user-selected account types
- Session tokens are transmitted through the API authorization header
- Video access uses short-lived server-issued playback credentials
- No production secrets or account passwords belong in this repository

## Quality Gate

Run the complete verification command before publishing changes:

```bash
npm run check
```

A change is considered ready only when type checking, linting, tests, and the optimized production build all succeed.

## Deployment

The production site is deployed through Vercel. `vercel.json` provides client-side route rewrites and immutable caching for locally hosted fonts.

Set the production API address in the hosting environment:

```env
VITE_API_URL=https://api.example.com/api
```

Build output is generated in `dist/` and must not be committed.

## Related Repository

The Rails API, MySQL schema, authentication, authorization, media processing, and operational services are maintained in [ElMourdy_Backend](https://github.com/MoemenAbdElMordy/ElMourdy_Backend).

## License

Private and proprietary software. All rights reserved.
