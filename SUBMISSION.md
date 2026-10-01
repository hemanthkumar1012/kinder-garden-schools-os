# Submission Notes

## Product

Kinder Garden Schools OS — Admission + Gallery + Feedback + Webinars + Fees for Kinder Garden / Play / Pre Schools.

## Technology

- Backend: Express.js + Mongoose
- Database: MongoDB
- Authentication: JWT + bcryptjs
- Uploads: multer
- Scheduling: node-cron
- Frontend: Next.js App Router + Tailwind CSS
- CORS and environment configuration included

## Implemented Modules

- Company registration and login with subdomain
- Dashboard with students, admissions, inquiries, feedback and webinar statistics
- Classes: Playgroup, Nursery, Jr KG, Sr KG, Day Care
- Capacity tracking and Full/Available state
- Admissions with generated admission number and optional child photo
- Admission status flow: pending, admitted, rejected, waitlist
- Gallery albums, categories, up to 20 images and public visibility
- Parent feedback with rating, approval and public visibility
- Average approved rating
- Webinars, topics, speaker details, registration capacity and status
- Webinar registrations
- Fees with payment plans, installments and payment tracking
- WhatsApp mock messages in Marathi/Hindi/English
- Settings: school profile, language, UPI ID, WhatsApp token, Razorpay key, logo and visibility controls
- Public school website with classes, gallery, feedback, webinars and admission inquiry
- Public school route: `/school/[subdomain]`

## Main Routes

### Admin

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
```

### Public

```
/school/[subdomain]
```

## Backend API Groups

```
/api/auth
/api/settings
/api/classes
/api/admissions
/api/gallery
/api/feedback
/api/webinars
/api/fees
/api/whatsapp
```

## Local Run

MongoDB must be running.

Backend:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Environment examples are provided in:

```
backend/.env.example
frontend/.env.local.example
```

## Architecture

```
Next.js frontend
      |
      v
Express.js API
      |
      v
Mongoose
      |
      v
MongoDB
```

The project uses MongoDB as its database layer.

## Scope

The implementation stays within the supplied Kinder Garden School OS build sheet. UI work improves presentation and workflow clarity without adding unrelated product modules.
