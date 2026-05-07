# FeedSpace: Complete Functionality Documentation

## 1. Product Overview
FeedSpace is a testimonial and customer feedback platform for collecting, moderating, and showcasing user-generated reviews.

It supports:
- Text feedback
- Audio feedback
- Video feedback

The product includes:
- Public collection pages
- Internal management dashboard
- Embeddable widgets
- Analytics and AI insights (plan-gated)
- Billing, team collaboration, and webhooks (plan-gated)

## 2. Architecture and Tech Stack
### Frontend
- React + Vite
- Tailwind CSS + reusable UI primitives
- React Router for route-level experiences

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Zod request validation

### Third-party and infrastructure
- Cloudinary for upload/sign flow (media storage integration)
- SMTP/Nodemailer for transactional emails (OTP/verification/password reset)
- Stripe for subscription lifecycle

## 3. User Lifecycle and Authentication
### Account access
- Register with email/password
- Login with email/password
- JWT session token storage in client localStorage
- Authenticated "me" endpoint to hydrate user state on app load

### Email verification flow
- OTP verification for new accounts
- Resend verification code
- Login can enforce verified-email requirement before full product access

### Password recovery
- Forgot password with OTP flow
- Reset password endpoint

### Session handling
- Logout removes client token
- Protected routes redirect unauthenticated users to login

## 4. Plans and Feature Gating
FeedSpace uses plan-based restrictions and unlocks.

### Plan limits (implemented)
- Projects:
  - Free: 1
  - Pro: 5
  - Business: unlimited
- Monthly response cap:
  - Free: 50
  - Pro: unlimited
  - Business: unlimited
- Media duration limits:
  - Free: 10 seconds
  - Pro: 30 seconds
  - Business: 60 seconds

### Plan-gated modules
- AI insights: Business only
- Team management: Business only
- Webhook management: Business only
- API key regeneration endpoint: Business only

## 5. Project and Portal Management
Each project acts as a feedback portal/workspace.

### Project capabilities
- Create, list, update, delete project
- Auto slug generation + uniqueness checks
- Project metadata (name, organization, purpose, product type, website, description, logo)
- Theme/custom CSS fields
- Portal link and public routes tied to slug

### Project analytics summary
- Feedback totals and type/status breakdown
- Link opens and unique visitors
- Response rate calculation
- Daily timeline metrics
- Recent responder list

## 6. Feedback Collection System
### Public submission
Customers submit feedback through public route by project slug.

### Supported types
- Text
- Audio
- Video

### Submission features
- Metadata support (including media duration)
- Plan-based monthly limits and duration enforcement
- Optional media URL for text
- Required media URL for audio/video

## 7. Upload and Media Flow
### Signed uploads
- Public signed upload endpoint
- Authenticated signed upload endpoint

### Browser recording support
- Frontend supports media recording and upload workflows
- Uploaded media URL stored with feedback item

## 8. Moderation and Review Workflow
From the dashboard/project management page, users can:
- View all submissions
- Filter by status and type
- Search by name/message/email
- Approve or reject submissions
- Delete submissions
- Open spotlight links for approved content
- Download media (plan-gated behavior in UI)

## 9. Public Experiences
### Public feedback page
- Route: /feedback/:slug
- Collects new testimonials from visitors

### Wall of Love page
- Route: /wall/:slug
- Displays approved testimonials publicly
- Optional branding display based on plan

### Review spotlight page
- Route: /spotlight/:slug/:feedbackId
- Public-facing focused testimonial presentation

### Widget page
- Route: /widget/:slug
- Embeddable review experience for external sites

### Floating widget page
- Route: /floating/:slug
- Alternate embeddable/public display mode

## 10. Wall Editor and Saved Layout System
The wall page includes owner-only layout editing capabilities.

### Owner-only editor controls
- Toggle edit mode
- Drag testimonial cards
- Resize testimonial cards
- Change wall theme colors
- Change background pattern (dots/grid/lines)

### Persistence behavior
- Save wall settings to project-level wallSettings
- Autosave with debounce while editing
- Per-project saved layout and theme
- Shared wall link reflects saved layout

### Security model
- Frontend checks ownership for showing editor controls
- Backend enforces project ownership for update operations

## 11. Embeds and Layout Options
Embed code generation supports style/layout variants.

### Layout types
- simple
- carousel
- bubble
- post

### Plan restrictions
- Free: simple, carousel
- Pro/Business: simple, carousel, bubble, post

### Enforcement
- UI selectors show plan-allowed options
- Widget route validates requested layout and falls back to allowed defaults

### Embed UX
- Copy embed code from dashboard and project pages
- Layout-aware iframe source and default heights
- Live preview modal for selected embed layout
- In-modal layout switcher for style comparison without closing

## 12. Dashboard Experience
Dashboard provides an at-a-glance operational view.

### Primary sections
- KPI cards (portals, visitors, feedback, response rate)
- Recent activity
- Quick actions
- Portal performance tiles
- Project cards with sharing and embed tools

### Onboarding
- First-time Driver.js product tour for newly signed-in users
- Tour is shown once per user on that browser/device

## 13. AI Insights (Business)
Business users can run AI endpoints per project:
- Summarization
- Highlights extraction
- Sentiment analysis

These are authenticated and plan-protected server routes.

## 14. Team Collaboration (Business)
Business plan supports team features:
- List team members
- Invite member by email/role
- Remove team member
- Accept invite flow via token route

## 15. Webhooks (Business)
Webhook module supports:
- List webhooks per project
- Create webhook endpoint config
- Delete webhook
- Test webhook

Webhook dispatch is used for feedback lifecycle events.

## 16. Billing and Subscription
Stripe-backed billing module includes:
- Subscription status retrieval
- Checkout session creation
- Subscription cancellation
- Billing webhook endpoint

## 17. API Surface Summary
Major API groups:
- /auth
- /projects
- /feedback
- /public
- /uploads
- /ai
- /billing
- /v1
- /projects/team/accept/:token

## 18. Security and Reliability Notes
- JWT auth for protected APIs
- Ownership checks for project-scoped data changes
- Zod validation for request schemas
- Plan gate middleware for paid-only modules
- Rate limits for sensitive/high-volume routes (configured in middleware)
- Defensive async handler pattern and structured API response shape

## 19. Branding and White-label Controls
Project-level customization includes:
- Theme colors
- Logo field
- Custom CSS
- Public wall styling controls
- Branding visibility behavior based on plan

## 20. Current Product Positioning
FeedSpace is a production-oriented SaaS MVP with:
- End-to-end testimonial capture
- Public showcase surfaces
- Embedding workflows
- Plan-based expansion path from solo creator to business team

It is ready for real feedback operations with moderation, analytics, and extensibility modules (AI, webhooks, billing, team).