# 📂 Deep Technical Architecture & Master Playbook: NextStep

This document serves as the absolute "Source of Truth" detailing every single functional layer of the NextStep engine. It is written precisely to serve as an architectural roadmap for engineers, and as a **Master Prompt Playbook** so that any advanced generative AI can seamlessly reconstruct this massive application piece-by-piece from total scratch.

---

## 🏗️ 1. Core Framework & Routing Engine
The application is built on the **Next.js 14+ App Router** to maximize native performance and SEO.
*   **Server vs Client Interlocks**: Heavy data lifting, API verifications, and cryptographic validations happen strictly inside `page.tsx` Server Components or `/api/...` endpoints. UI interactions (like the Razorpay Modal or the "Add Meeting Link" inputs) are sandboxed cleanly inside `'use client'` components.
*   **Fast Routing Magic**: The platform relies on Next.js native `fetch` mechanisms caching data efficiently. Heavy grids like `/admin/colleges` fetch data asynchronously ensuring the user never sees a freezing white screen.

---

## 🗄️ 2. The Supabase (PostgreSQL) Master Schema
Everything is governed by Supabase Row-Level Security (RLS). A user can theoretically fire any API command, but they can only ever see their own `id`.
1.  `users`: Core authentication identity mapping (managed by Supabase Auth natively).
2.  `student_profiles`: The master profile table. Stores `full_name`, `phone`, and critically houses the "Freemium Odometers": `used_free_counselling`, `purchased_counselling`, etc.
3.  `colleges`: The massive directory of institutions. Accommodates custom dynamic search filtering natively.
4.  `counselling_bookings`: Tracks all 1-on-1 scheduled sessions. Stores the `meeting_link` organically, meaning as soon as the Admin pastes a Zoom link, it binds permanently to the student's dashboard.
5.  `payment_transactions`: The unalterable ledger. Logs every single `rzp_payment_id` successful transaction the second Razorpay verifies it, automatically summing up to feed the Admin KPI Dashboard Revenue module.

---

## 💳 3. The Freemium Operations Pipeline
How does scheduling and the payment wall precisely function?
1. The student hits **"Confirm Booking"** on arbitrary date/time.
2. The frontend triggers `POST /api/bookings`. The Next.js Server immediately queries `student_profiles`.
3. If `used < free_limit` OR `purchased > 0`, the booking is magically created. If not, the Server rejects the DB write, intercepts the flow, and returns a raw `402 Payment Required` JSON payload.
4. The Frontend sniffs the `402` state silently, spins up the Razorpay SDK, and hits `/api/razorpay/order` to generate a secure RSA order.
5. The student completes the checkout natively in the modal.
6. The `onSuccess` handler fires to `/api/razorpay/verify`, which cryptographically authenticates the `crypto.createHmac` signature against your server secret.
7. Upon validation, the DB increments `purchased_counselling` by `+1`, logs the transaction to `payment_transactions`, and the Frontend seamlessly retries the original booking request from Step 1, letting the student through seamlessly. 

---

## ✉️ 4. Multi-Channel Notification Dispatcher
Located inside `src/lib/notifications/dispatch.ts`.
This generic function handles everything. The absolute *millisecond* an Admin changes a booking status to `confirmed` (while passing in a meeting link), the dispatcher generates a dynamic string: *"Your booking is confirmed! Join here: [LINK]"*.
It permanently commits this to the `notifications` DB table so the student sees a red dot on their bell icon (`in_app`), and instantly triggers a fast, asynchronous `Resend` worker thread to dump the identical message into the student's real-world Gmail inbox securely (`email`).

---

## 🤖 5. The "Master Prompt Sequence" (How to rebuild via AI)

If you ever wish to instruct an AI Assistant (like Claude or ChatGPT) to perfectly recreate this entire behemoth of an application from an empty folder, **DO NOT feed it one giant prompt.** A massive application requires sequential, methodical prompting so the AI doesn't hallucinate. 

Copy and paste these exact 5 phases sequentially into the AI:

### Phase 1: The Database & Auth Foundation
> *"You are building an advanced Next.js App Router educational SaaS called NextStep. Please initialize the application using standard Tailwind and TypeScript. I am using Supabase. First, give me the complete `.sql` migration files to create the schema. I need tables for `users`, fully-linked `student_profiles` (which must track free limitations and purchased credits using Integer columns), `colleges` (for directories), `counselling_bookings`, and a `payment_transactions` ledger for tracking revenue. You MUST strictly implement Postgres Row Level Security (RLS) policies on every table so students can only SELECT rows where `auth.uid() = id`, while Admins can SELECT all."*

### Phase 2: Core Dashboards & Layouts
> *"Now let's build the frontend. I need a stunning, premium UI styling using arbitrary glassmorphism and subtle Framer Motion `motion.div` fades. Create a dual dashboard architecture. Build `/dashboard` layouts specifically for authenticated students showcasing their bookings and a notification bell. Second, build walled-off `/admin` layouts showcasing high-level KPIs (Total Revenue, Total Students). DO NOT write the specific feature pages yet, just wire the Next.js `layout.tsx` wrappers and the Next.js API Middleware to verify admin authorization roles before letting them access the `/admin` routes."*

### Phase 3: The Bookings & Admin Management
> *"Implement the Booking flow. Create a beautifully responsive student booking page the user can interact with to pick dates. Build the `POST /api/bookings` route. Then, create the `/admin/bookings` page. The Admin booking dashboard must have completely dynamic state changes: If a booking is 'Pending', show a beautiful yellow input box for the Admin to paste a Zoom/Google Meeting link. When they click 'Confirm', the Next.js API Route should save the link to the database, transition the status strictly to 'Confirmed', and return a solid read-only green block containing the link."*

### Phase 4: The Freemium & Notification Engine
> *"Next up, integrate monetization and notifications. If a user hits the `POST /api/bookings` route but they've exceeded their free limit (as tracked in `student_profiles`), block it with a `402` error. Write a frontend hook that catches the `402`, opens checkout.js Razorpay logic via an `/api/razorpay/order` backend controller, and verifies the success hash purely on the server using `/api/razorpay/verify`. Once a payment clears, write exactly one Row to `payment_transactions`. Furthermore, whenever the Admin successfully hits 'Confirm' on a booking, I want you to use `Resend` SDK to natively trigger both an in-app and synchronous Email notification containing the dynamic Meeting URL to the student."*

### Phase 5: UI/UX Finesse & Polish
> *"Finally, we need to guarantee production-ready responsiveness. Scan the grids in the `/admin/colleges` page and the students `/dashboard`. Please update the Tailwind classes everywhere from rigid columns to adaptive breakpoints (`flex-col sm:flex-row`, `grid-cols-1 sm:grid-cols-2`). Replace any generic browser `<title>` metadata with `NextStep | Expert Guidance`, and universally route `icons: { icon: '/Nextstep_logo.png' }` seamlessly across all top-level layouts."*
