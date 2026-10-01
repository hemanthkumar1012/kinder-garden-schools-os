# Kinder Garden Schools OS

Admission + Gallery + Feedback + Webinars for Kinder Garden / Play / Pre Schools.

## Stack (from build sheet)

Backend: express mongoose cors dotenv jsonwebtoken bcryptjs multer node-cron
Frontend: Next.js (App Router) + Tailwind

## Run

```bash
# MongoDB must be running
cd backend && npm install && npm start    # :5000
cd frontend && npm install && npm run dev # :3000
```

## Structure

```
backend/
  models/   Company Class Student Admission Gallery Feedback Webinar WebinarRegistration Fee
  routes/   auth classes admissions gallery feedback webinars fees whatsapp
frontend/
  app/login dashboard admissions classes gallery feedback webinars fees public/[subdomain]
```

## Flow

1. Register school (subdomain) → Login
2. Create classes → Create admissions (ADM-YYYY-XXXX + photo)
3. Gallery / Feedback / Webinars / Fees from sidebar
4. Public site: /public/YOUR_SUBDOMAIN
