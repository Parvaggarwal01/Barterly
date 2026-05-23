# Barterly Frontend

React frontend for Barterly, a peer-to-peer skill bartering platform where users can post skills, browse offers, send barter requests, chat in real time, save bookmarks, leave reviews, and manage profiles.

For full-stack setup, backend documentation, and architecture details, see the root [`README.md`](../README.md).

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS 4
- React Router 7
- Axios
- Socket.io client
- ESLint

## Features

- Public landing page and skill browsing
- Login, registration, email verification, and password reset flows
- User dashboard, profile, bookmarks, skills, barter requests, and messages
- Real-time chat powered by Socket.io
- Admin dashboard for users, skills, reports, categories, and approvals
- API service layer for backend communication

## Prerequisites

- Node.js 18 or higher
- npm
- Running Barterly backend API

## Environment Variables

Create a `.env` file inside `barterly-frontend`:

```env
VITE_API_URL=http://localhost:3000/api
```

`VITE_API_URL` should point to the backend API base URL. For local development, the backend usually runs on `http://localhost:3000`.

## Installation

```bash
cd barterly-frontend
npm install
```

## Development

Start the Vite development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Available Scripts

```bash
npm run dev
```

Runs the local development server.

```bash
npm run lint
```

Runs ESLint checks.

```bash
npm run build
```

Creates a production build in `dist`.

```bash
npm run preview
```

Serves the production build locally for review.

## Project Structure

```text
barterly-frontend/
├── public/                 # Static public assets
├── src/
│   ├── assets/             # Images and static app assets
│   ├── components/         # Shared UI components
│   │   ├── layout/         # Header, sidebar, footer
│   │   └── modals/         # Reusable modal components
│   ├── pages/              # Route-level pages
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── auth/           # Login, register, verify, reset
│   │   └── user/           # User dashboard pages
│   ├── services/           # API and Socket.io service wrappers
│   ├── App.jsx             # App routes
│   ├── index.css           # Global styles and Tailwind imports
│   └── main.jsx            # React entry point
├── index.html
├── package.json
└── vite.config.js
```

## Backend Connection

The frontend uses `src/services/api.js` for REST API requests and `src/services/socketService.js` for real-time chat.

If requests fail locally, check:

- The backend server is running.
- `VITE_API_URL` includes `/api`.
- The backend `FRONTEND_URL` allows `http://localhost:5173`.
- Your browser has the latest frontend code after restarting Vite.

## Contributor Notes

- Keep page-level logic inside `src/pages`.
- Put reusable UI in `src/components`.
- Use the existing service files instead of calling Axios directly from new pages.
- Keep pull requests focused on one issue.
- Run lint and build before opening a pull request.

## Verification

Before submitting frontend changes, run:

```bash
npm run lint
npm run build
```
