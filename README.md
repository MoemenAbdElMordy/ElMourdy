# ElMourdy Educational Platform

A modern, responsive frontend for an Arabic educational platform. ElMourdy is built with a native right-to-left experience and provides dedicated workflows for students, parents, teachers, and teaching assistants.

## Overview

The application demonstrates a complete multi-role learning experience, including course navigation, video lessons, examinations, progress tracking, announcements, activation codes, student management, and administrative tools. It currently uses mock data and is ready to be connected to a production backend.

## Key Features

- Native Arabic RTL layout with locally hosted Cairo fonts
- Responsive user interface with light and dark themes
- Role-based navigation and access control
- Student dashboards, subjects, chapters, lessons, and video content
- Exams, results, error reviews, and progress tracking
- Parent dashboards for monitoring student performance
- Teacher and assistant administration dashboards
- Student, content, announcement, exam, and activation-code management
- Accessible navigation, error boundaries, and loading states
- Hash-based routing with browser back and forward support

## Technology Stack

- React 18
- TypeScript
- Vite 6
- Tailwind CSS 4
- Lucide React
- Vitest and Testing Library
- ESLint

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm

### Installation

```bash
git clone https://github.com/MoemenAbdElMordy/ElMourdy.git
cd ElMourdy
npm install
```

### Development

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create an optimized production build |
| `npm run typecheck` | Validate TypeScript types |
| `npm run lint` | Run ESLint with zero warnings allowed |
| `npm run test` | Run the automated test suite |
| `npm run check` | Run type checking, linting, tests, and the production build |

## Project Structure

```text
src/
├── app/        # Application shell, routing, and access policies
├── assets/     # Local fonts and static assets
├── data/       # Mock data and data-layer contracts
├── features/   # Public, student, parent, and administration features
├── pages/      # Route-level page organization
├── shared/     # Reusable UI components and utilities
└── styles/     # Global styles, themes, and design tokens
```

## Quality Assurance

Run the complete quality gate before submitting changes:

```bash
npm run check
```

This command validates types, enforces linting rules, runs all tests, and verifies that the production bundle builds successfully.

## Current Status

This repository contains the frontend implementation. Authentication, persistent data, media delivery, and other server-side capabilities are represented through demo flows and mock data until a backend integration is added.

## License

This project is private and proprietary. All rights reserved.
