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

## Deployment (free tiers)

Recommended free setup:

- API: Render (free web service)
- Database: MongoDB Atlas (M0 free cluster)
- Web app: Vercel (free static hosting)

### One-click deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Tushar-programador/relook)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTushar-programador%2Frelook&root-directory=apps%2Fweb&project-name=relook-web&env=VITE_API_URL)

### Environment variables (prefilled)

Set these on your hosting providers. Use the Example value format as guidance, not literal secrets.

| Variable | App | Required | Example value | Notes |
| --- | --- | --- | --- | --- |
| NODE_ENV | API | Yes | production | Keep as production in hosted API |
| PORT | API | Yes | 10000 | Render injects port automatically; do not hardcode elsewhere |
| CLIENT_URL | API | Yes | https://relook-web.vercel.app | Main web origin allowed by CORS |
| CLIENT_URLS | API | No | https://relook-web-git-main.vercel.app,https://relook-web-preview.vercel.app | Optional extra origins, comma-separated |
| MONGODB_URI | API | Yes | mongodb+srv://user:password@cluster.mongodb.net/feedspace | Use Atlas connection string |
| JWT_SECRET | API | Yes | a-very-long-random-string-at-least-32-chars | Generate a strong secret |
| JWT_EXPIRES_IN | API | Yes | 7d | Token expiration window |
| OTP_EXPIRES_MINUTES | API | Yes | 10 | OTP validity time in minutes |
| SMTP_HOST | API | No | smtp.gmail.com | Optional, but recommended for real emails |
| SMTP_PORT | API | No | 587 | Usually 587 (TLS) or 465 (SSL) |
| SMTP_USER | API | No | noreply@yourdomain.com | SMTP username |
| SMTP_PASS | API | No | app-password-or-smtp-password | SMTP password or app password |
| SMTP_FROM_EMAIL | API | No | noreply@yourdomain.com | Sender email address |
| SMTP_FROM_NAME | API | No | FeedSpace | Sender display name |
| CLOUDINARY_CLOUD_NAME | API | Yes | your-cloud-name | Required for media uploads |
| CLOUDINARY_API_KEY | API | Yes | 123456789012345 | Cloudinary API key |
| CLOUDINARY_API_SECRET | API | Yes | your-cloudinary-api-secret | Cloudinary secret |
| VITE_API_URL | Web | Yes | https://feedspace-api.onrender.com/api | Public API base URL used by frontend |

### 1. Create production secrets

1. Copy `.env.example` to `.env` locally and fill every required value.
2. Generate a strong JWT secret (32+ chars).
3. Create MongoDB Atlas connection string and use it as `MONGODB_URI`.
4. Create Cloudinary credentials for media uploads.

### 2. Deploy API to Render (free)

1. Push this repository to GitHub.
2. In Render, create a new Blueprint and select this repository.
3. Render will detect `render.yaml` at the project root.
4. Set secret environment variables in Render:
  - `CLIENT_URL` (your Vercel site URL)
  - `CLIENT_URLS` (optional comma-separated preview URLs)
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `SMTP_*` (optional but recommended for real email delivery)
  - `CLOUDINARY_*`
5. Deploy and verify: `https://<your-render-domain>/api/health`

### 3. Deploy web to Vercel (free)

1. Import this repository in Vercel.
2. Configure the project root as `apps/web`.
3. Set build command to `npm run build` and output directory to `dist`.
4. Set environment variable:
  - `VITE_API_URL=https://<your-render-domain>/api`
5. Deploy and confirm dashboard/public pages load correctly.

### 4. Production checks

- Test auth flow (`register`, `login`, `verify-email`).
- Test public feedback submit and media upload.
- Confirm CORS works from your Vercel domain.
- Confirm API health endpoint returns success.

### Free tier notes

- Render free web services may sleep after inactivity; first request can be slow.
- Vercel free tier is suitable for personal and MVP projects.
- MongoDB Atlas M0 has strict storage/throughput limits.

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