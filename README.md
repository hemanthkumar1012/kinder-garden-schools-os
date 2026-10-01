# Kinder Garden Schools OS

Admission + Gallery + Feedback + Webinars + Fees for Kinder Garden / Play / Pre Schools.

## Stack

Backend: Express + Mongoose + CORS + dotenv + JWT + bcryptjs + multer + node-cron
Frontend: Next.js App Router + Tailwind CSS
Current local database: MongoDB
Production target: Supabase Postgres + Supabase Storage + Supabase Edge Functions, with the frontend deployed separately.

## Local setup

MongoDB must be running for the current local Express/Mongoose implementation.

### Backend

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/kinder-garden-os
JWT_SECRET=replace-with-a-long-random-secret
```

Then:

```bash
cd backend
npm install
npm start
```

Backend: `http://localhost:5000`
Health check: `http://localhost:5000/health`

### Frontend

Create `frontend/.env.local` from `frontend/.env.local.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Then:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000` (or the next available port shown by Next.js)

## Main pages

```
/login
/dashboard
/admissions
/classes
/gallery
/feedback
/webinars
/fees
/settings
/public/[subdomain]
```

## Application flow

1. Register a school with a unique subdomain.
2. Login to the school workspace.
3. Configure school settings, UPI, logo and visibility controls.
4. Create classes and manage capacity.
5. Receive admission inquiries and move applicants through their status flow.
6. Create gallery albums and control public visibility.
7. Review parent feedback and control public approval.
8. Create webinars, track registrations and manage webinar status.
9. Create fee plans with clear payment installments and record payments.
10. Share the public school experience at `/public/YOUR_SUBDOMAIN`.

## Production architecture

Supabase is the production platform selected for the data and serverless backend layer. Supabase provides managed Postgres, Storage, Auth, Realtime and Edge Functions. Its Edge Functions use TypeScript/Deno and are deployed globally. citeturn757819search5turn757819search8

The existing Express/Mongoose backend is still the local implementation. Moving it to Supabase requires a deliberate PostgreSQL migration because the current data layer uses MongoDB/Mongoose. We will not silently mix the two data models.

The intended production flow is:

`Next.js frontend → Supabase Edge Functions → Supabase Postgres / Storage`

For Edge Functions, Supabase documents deployment with `supabase functions deploy`; deployed functions are served from the project Edge Functions URL. citeturn757819search1

## Scope

The implementation follows the supplied Kinder Garden School OS build sheet. UI improvements are visual and workflow-oriented; the application modules remain within the specified admission, class, gallery, feedback, webinar, fee, WhatsApp mock, dashboard, settings and public-school scope.