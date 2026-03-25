<div align="center">
  <img src="public/Nextstep_logo.png" alt="NextStep Logo" width="200" />
  <h1>NextStep Educational SaaS Platform</h1>
  <p><i>The Complete A-Z Architecture for Booking Premium Counselling & Campus Visits.</i></p>
</div>

<hr />

## 🌟 The Vision
**NextStep** is a state-of-the-art Web Application designed connecting absolute ease-of-use with beautiful UI. NextStep allows students to dynamically find verified educational institutions, track metrics, apply for 1-1 expert counselling, and book VIP on-campus tours seamlessly. It relies heavily on a built-in bespoke freemium engine, tracking usage and securely gating access natively via Razorpay.

---

## 🚀 Key Features Built-In

1. **Freemium Odometers Engine** 💳 
   * Fully automated limit tracking: 3 Free Counselling Sessions & 1 Free College Visit. Once exceeded, the NextStep API natively detects the cap, suspends the booking, securely initiates a Razorpay Checkout Session, processes cryptography, grants premium pass credits, and automatically resumes the booking.
2. **Beautiful Reactive Dashboards** 📊 
   * Separated `student` and `admin` realms completely walled off by PostgreSQL Row-Level Security checks.
   * Total platform interaction statistics, historical logs, payment transaction ledgers, and dynamic form grids.
3. **Admin Central Control** ⚙️ 
   * Custom CSV database ingestors for adding verified Colleges. Action-driven tables pushing UI updates when Meeting Links are shared, triggering real-time UI state changes.
4. **Resend Email & Notification Dispatching** ✉️ 
   * Seamless multi-modal architecture. Every status flip (e.g. *Pending* -> *Confirmed*) natively compiles custom message strings containing hyperlinked meeting URLs, drops them securely in the student's Next.js notification center (`in_app`), and simultaneously fires a worker thread to dump identical emails right into their inbox securely (`email`).

---

## 🛠 Tech Stack

- **Framework**: `Next.js 15+` (App Router)
- **Styling**: `TailwindCSS` + `Framer Motion` for micro-interactions
- **Database**: `Supabase` (PostgreSQL) + Role-Level Security (RLS)
- **Authentication**: `Supabase Auth` (Email/Password strictly validated)
- **Payments Engine**: `Razorpay` SDK/API
- **Email Delivery**: `Resend`

---

## ⚙️ Quick Start

### 1. Requirements
Ensure you have NodeJS v18+ and `npm` installed.

### 2. Environment Setup
Create a `.env.local` directly at the application root containing:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RESEND_API_KEY=...
```

### 3. Install & Go
```bash
npm install
npm run dev
```
<i>Visit http://localhost:3000 to launch the application natively.</i>
