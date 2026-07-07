# 🌌 Aura-Events

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-orange?style=for-the-badge&logo=vercel&logoColor=white)](https://event-management-one-eta.vercel.app/)

**A premium, dark-mode event discovery and ticketing platform.**

Aura-Events is a fast, modern web app built on Next.js 16 (App Router), with Supabase handling the database and session persistence, and Stripe powering ticket sales.

🔗 **Live Demo:** [event-management-one-eta.vercel.app](https://event-management-one-eta.vercel.app)

---

## 📋 Table of Contents

- [Design & Aesthetic](#-design--aesthetic)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Local Development Setup](#️-local-development-setup)
- [Google OAuth Configuration](#-google-oauth-configuration)
- [Production Deployment](#-production-deployment)
- [Troubleshooting](#️-troubleshooting)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎨 Design & Aesthetic

Aura-Events is built around a sleek, dark-mode-first visual identity:

| Element | Value |
|---|---|
| Background | Deep neutral canvas — `bg-neutral-950` (`#0a0a0a`) |
| Accent | High-contrast vibrant orange — `bg-orange-600` (`#ea580c`) |
| Typography | Clean, modern sans-serif |

---

## 🚀 Key Features

- **🎭 Event Discovery Grid** — A responsive listing layout for live events, complete with loading-state skeletons and empty-state fallbacks.
- **🔒 Supabase Auth (SSR)** — Cookie-backed, server-side session management supporting Email/Password and **Google OAuth**.
- **🎫 Stripe Ticketing** — Secure, dynamic ticket purchases powered by Stripe Checkout.
- **✍️ Content Management** — Create and edit event listings, with full client-side form validation.
- **🛡️ Row-Level Security (RLS)** — Database policies that restrict writes to the event organizer while keeping public reads fast and open.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.0 |
| Styling | Tailwind CSS v4 |
| Database & Auth | Supabase (Postgres, SSR sessions, RLS) |
| Payments | Stripe Checkout |
| Hosting | Vercel |

---

## 📂 Project Structure

```text
├── app/
│   ├── api/
│   │   └── checkout/          # Stripe Checkout session API handler
│   ├── auth/
│   │   └── callback/          # OAuth redirect code exchange endpoint
│   ├── create/                # Secure page to create new event listings
│   ├── dashboard/             # User dashboard managing booked tickets/listings
│   ├── events/
│   │   └── [id]/              # Individual event details & booking page
│   │       └── edit/          # Organizer edit portal for an event
│   ├── login/                 # Unified sign-in/sign-up forms
│   ├── globals.css            # Custom CSS configurations and utility rules
│   ├── layout.tsx             # Root page wrapper containing navigation and context
│   └── page.tsx               # Homepage rendering the discovery matrix
├── components/                # Reusable UI widgets (Navbar, Spinners, Alerts, Event Cards)
├── public/                    # Assets and static images
├── types/                     # Shared TypeScript interface definitions
├── utils/
│   ├── format.ts              # Custom pricing & date utility formatting functions
│   ├── supabase.ts            # Client-side Supabase configuration
│   └── supabase-server.ts     # Server-side cookie-aware Supabase configuration
├── supabase-setup.sql         # SQL script to initiate databases, triggers, and RLS
└── package.json               # Project manifest and dev scripts
```

---

## ⚙️ Local Development Setup

### 1. Clone & install dependencies

```bash
git clone https://github.com/your-username/aura-events.git
cd aura-events
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the root folder with your project keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 3. Set up the database (Supabase SQL Editor)

Run the queries in `supabase-setup.sql` inside your **Supabase SQL Editor** to automatically:

- Create the `public.events` table
- Configure Row-Level Security (RLS) policies
- Allow public read access, restricting write/delete privileges to the event organizer

### 4. Run the app

```bash
npm run dev
```

Open **http://localhost:3000** to view it.

> If port `3000` is already in use, Next.js will automatically fall back to **http://localhost:3001**.

---

## 🔐 Google OAuth Configuration

### 1. Google Cloud Console setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and select your **Aura-Events** project.
2. Go to **APIs & Services → OAuth consent screen**:
   - Set the user type to **External**.
   - Add scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, and `openid`.
   - Under **Test Users**, add your personal testing Google accounts.
3. Go to **APIs & Services → Credentials**:
   - Click **Create Credentials → OAuth client ID**.
   - Select **Web application** as the application type.
   - Under **Authorized redirect URIs**, add your Supabase callback URL:

     ```text
     https://<your-supabase-project-id>.supabase.co/auth/v1/callback
     ```

   - Save, then copy your **Client ID** and **Client Secret**.

### 2. Connect to Supabase

1. In the [Supabase Dashboard](https://supabase.com/), go to **Authentication → Providers → Google**.
2. Toggle Google Auth **ON**, paste your credentials, and click **Save**.
3. Go to **Authentication → URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (or `http://localhost:3001` on the fallback port).
   - In **Redirect URLs**, whitelist your local auth routes:

     ```text
     http://localhost:3000/auth/callback
     http://localhost:3001/auth/callback
     ```

---

## 🌐 Production Deployment

Aura-Events is optimized for deployment on [Vercel](https://vercel.com/):

1. Push your codebase to a GitHub repository (public or private).
2. Link your GitHub account to Vercel and import the repository.
3. Add the environment variables from `.env.local` to your Vercel project settings.
4. Deploy.
5. **Critical:** Update your production URL in both:
   - **Google Cloud Console** → Authorized JavaScript Origins
   - **Supabase** → Site URL and Redirect URLs

   This step is required for OAuth logins to work in production.

---

## 🛠️ Troubleshooting

| Issue | Fix |
|---|---|
| OAuth redirect fails | Confirm the port your app is running on (e.g. `http://localhost:3001`) is whitelisted under Supabase's **Redirect URLs**. |
| Dev server port busy | Next.js automatically falls back to `3001` (or higher) if port `3000` is already bound to another process. |
| RLS permission errors | Make sure `supabase-setup.sql` has been run so `organizer_id` is correctly linked to Supabase's Auth schema. |

---

## 🗺️ Roadmap

- [ ] Event search & filtering by category/date
- [ ] Email notifications for ticket purchases
- [ ] Organizer analytics dashboard
- [ ] Refund handling via Stripe

---

## 📄 License

This project is available under the MIT License. See `LICENSE` for details.
