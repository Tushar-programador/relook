# FeedSpace

FeedSpace is a production-oriented MVP for collecting, moderating, and embedding customer testimonials across video, audio, and text.

## Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, Vite, Tailwind CSS, shadcn-style UI primitives
- Storage: Cloudflare R2 or AWS S3 via signed uploads

## Apps

```text
apps/
  api/   Express API with auth, projects, feedback, analytics, uploads
  web/   React dashboard, public feedback page, embed widget
```

## Features implemented

- JWT auth with register, login, and current user endpoints
- OTP email verification flow and resend verification endpoint
- Forgot-password OTP flow with reset-password endpoint
- Multi-project dashboard with unique slug generation
- Public feedback collection for text, audio, and video
- Browser recording support via MediaRecorder
- Signed upload flow for public and authenticated uploads
- Feedback moderation and analytics dashboard
- Public approved-feedback feed and embeddable widget page

## Local development

1. Copy `.env.example` to `.env` in the workspace root.
2. Copy `apps/web/.env.example` to `apps/web/.env` if you need a custom API URL.
3. Start MongoDB with `docker compose up -d`.
4. Install dependencies with `npm install`.
5. Start both apps with `npm run dev`.

## API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `POST /api/projects`
- `GET /api/projects`
- `PATCH /api/projects/:id`
- `GET /api/projects/:id/analytics`
- `POST /api/feedback/:slug`
- `GET /api/feedback/project/:projectId`
- `PATCH /api/feedback/:id/status`
- `GET /api/public/:slug/feedback`
- `POST /api/uploads/public/sign`
- `POST /api/uploads/sign`

## Email delivery notes

- OTP emails are sent via Nodemailer.
- Configure SMTP variables in `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`).
- If SMTP is not configured, the API logs OTP values in server logs for local development only.