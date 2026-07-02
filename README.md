# 🌌 Aura-Events

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-orange?style=for-the-badge&logo=vercel&logoColor=white)](https://event-management-one-eta.vercel.app/)

🔗 **Live Demo:** [event-management-one-eta.vercel.app](https://event-management-one-eta.vercel.app)

A premium, dark-mode event discovery and ticketing platform. Aura-Events provides a fast, modern interface built on Next.js 16 (App Router), leveraging Supabase for database & session persistence, and Stripe for processing ticket sales.

---

## 🎨 Design & Aesthetic
Designed with a sleek dark-mode aesthetic:
* **Background:** Deep neutral canvas (`bg-neutral-950` / `#0a0a0a`).
* **Accents:** High-contrast, vibrant orange highlights (`bg-orange-600` / `#ea580c`).
* **Typography:** Clean modern sans-serif.

---

## 🚀 Key Features

* **🎭 Event Discovery Grid:** A listing layout showing live events with custom loading state skeletons and empty fallbacks.
* **🔒 Supabase Auth (SSR):** Cookie-backed server-side user session management supporting Email/Password and **Google OAuth**.
* **🎫 Stripe Ticketing:** Secure payments using Stripe Checkout allowing users to purchase tickets dynamically.
* **✍️ Content Management:** Create and edit event listings. Complete client-side validation on forms.
* **🛡️ Row-Level Security (RLS):** Database policies that restrict write operations strictly to the event organizer, keeping public reads fast and safe.

---

## 📂 Project Directory Structure

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

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/aura-events.git
cd aura-events
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root folder and add your project keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 3. Database Setup (Supabase SQL Editor)
Run the SQL queries inside `supabase-setup.sql` in your **Supabase SQL Editor** to automatically:
* Create the `public.events` database table.
* Configure Row-Level Security (RLS) policies.
* Allow read access to anyone, and write/delete privileges to the event organizer only.

### 4. Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it. 
*(If port 3000 is occupied, Next.js will automatically fall back to [http://localhost:3001](http://localhost:3001)).*

---

## 🔐 Google OAuth Configuration

### 1. Google Cloud Console Configuration
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project **Aura-Events**.
3. Go to **APIs & Services** > **OAuth consent screen**:
   * Set user type to **External**.
   * Add scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, and `openid`.
   * Under **Test Users**, add your personal testing Google accounts.
4. Go to **APIs & Services** > **Credentials**:
   * Click **Create Credentials** > **OAuth client ID**.
   * Select **Web application** as application type.
   * Under **Authorized redirect URIs**, add your Supabase project callback link:
     ```text
     https://<your-supabase-project-id>.supabase.co/auth/v1/callback
     ```
   * Save and copy your **Client ID** and **Client Secret**.

### 2. Connect to Supabase
1. In the [Supabase Dashboard](https://supabase.com/), go to **Authentication** > **Providers** > **Google**.
2. Toggle Google Auth **ON** and paste your credentials. Click **Save**.
3. Go to **Authentication** > **URL Configuration**:
   * Set the **Site URL** to `http://localhost:3000` (or `http://localhost:3001` if running on the fallback port).
   * In **Redirect URLs**, whitelist your local authentication routes:
     ```text
     http://localhost:3000/auth/callback
     http://localhost:3001/auth/callback
     ```

---

## 🌐 Production Deployment

This project is optimized for deployment on the [Vercel Platform](https://vercel.com/):

1. Commit your codebase and push it to a private or public **GitHub** repository.
2. Link your GitHub account to Vercel and import the repository.
3. Supply the environment variables from your `.env.local` inside the deployment configuration settings.
4. Deploy!
5. **CRITICAL:** Update your Vercel production URL in both the **Google Cloud Console** (under Authorized JavaScript Origins) and **Supabase URL Settings** (under Site URL and Redirect URLs) to allow OAuth logins in production.

---

## 🛠️ Troubleshooting

* **OAuth redirect fails:** Make sure the port you are currently running your app on (e.g. `http://localhost:3001`) is whitelisted in Supabase's **Redirect URLs** tab.
* **Next.js Dev Port busy:** Next.js automatically switches to `3001` or high if port `3000` is currently bound to another running node process.
* **RLS Permission Errors:** Ensure that you have run the schema migration in `supabase-setup.sql` to link the events' `organizer_id` to Supabase's Auth schema correctly.
