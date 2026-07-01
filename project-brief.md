# Product Requirement Document (PRD)

## Project: Dark-Mode Event Ticketing Platform

---

## 1. Project Summary & Purpose

The **Event Ticketing Platform** is a full-stack web application engineered to allow users to discover, create, and manage live event listings. Designed with a premium, modern dark-mode aesthetic utilizing vibrant orange accents, the platform delivers a fast, intuitive experience for both event organizers and attendees.

The primary objective is to leverage a highly efficient architecture (**Next.js App Router** and **Supabase**) to provide seamless user authentication, real-time data rendering, and secure event publication.

---

## 2. System Architecture & How It Works

The platform operates on a decoupled full-stack model where the frontend interacts dynamically with a managed cloud database and authentication service.

```
+-------------------------------------------------------------+
|                        FRONTEND                             |
|  Next.js 14+ (App Router) | Tailwind CSS | TypeScript       |
+------------------------------------+------------------------+
                                     |
                         HTTPS / WebSockets (API)
                                     |
+------------------------------------v------------------------+
|                        BACKEND                              |
|                   Supabase Platform                         |
|  +--------------------+  +-------------------------------+  |
|  |   Supabase Auth    |  |  PostgreSQL Database (RLS)    |  |
|  |  (User Sessions)   |  |  ('events' Table Data)        |  |
|  +--------------------+  +-------------------------------+  |
+-------------------------------------------------------------+

```

### 2.1 User Authentication Flow

1. **Sign Up / Sign In:** Users interact with a dedicated login route. Authentication requests are routed directly to **Supabase Auth**.
2. **Session Persistence:** Supabase securely stores tokens on the client client-side. The universal navigation bar tracks changes in auth state via `onAuthStateChange`.
3. **Route Protection:** Access to premium actions (like creating an event) requires an active session validation check.

### 2.2 Data Fetching & Mutation Flow

1. **Event Discovery (Read):** The homepage automatically initializes a client-side or server-side fetch requesting all rows from the public database schema, tracking loading states instantly.
2. **Event Creation (Write):** Validated users submit form payload data. The system extracts the active user's unique identifier (`auth.uid()`) and writes it directly to the table row as `organizer_id`.
3. **Security (Row Level Security):** The database relies on PostgreSQL **RLS policies** to inspect the token payload, ensuring anonymous clients can read entries, but only authenticated users matching their specific account IDs can modify data.

---

## 3. Database Schema Specification

The backend relies on a core PostgreSQL data architecture hosted on Supabase:

### `public.events` Table

| Column Name | Data Type | Constraints / Modifiers | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | `PRIMARY KEY`, Default: `gen_random_uuid()` | Unique event identifier. |
| `title` | `text` | `NOT NULL` | The headline name of the event. |
| `description` | `text` | Optional | Contextual text details about the event. |
| `date` | `timestamp with time zone` | `NOT NULL` | Calendar date and exact clock time. |
| `location` | `text` | `NOT NULL` | Physical address or digital link venue. |
| `price` | `numeric` | `NOT NULL`, Default: `0` | Cost of registration/ticket. |
| `image_url` | `text` | Optional | Web address linking to the event promotional banner. |
| `organizer_id` | `uuid` | `NOT NULL`, `REFERENCES auth.users(id)` | Foreign key binding the event to its creator. |
| `created_at` | `timestamp with time zone` | `NOT NULL`, Default: `now()` | Automated system creation timestamp. |

---

## 4. Feature & UI Requirements

### 4.1 Global UI Theme

* **Color Palette:** Primary background must be a deeply saturated dark layer (`bg-neutral-950` or similar dark charcoal tones), typography utilizing bright text (`text-neutral-50`), and all primary action buttons or accents using pure orange values (`orange-600` / `#ff5722`).

### 4.2 Reusable Navigation Component

* Must show a persistent layout across all views.
* Tracks authentication sessions. Guests see a **"Sign In"** CTA. Authenticated users see a **"Create Event"** option alongside a **"Sign Out"** function.

### 4.3 Feature Set Breakdown

* **Discovery Matrix:** A clean landing view providing a grid display of all live event components. Includes custom UI modules indicating loading states and a beautiful fallback view if no items exist in the database.
* **Authentication Terminal:** An intuitive interface allowing unified sign-up and login capabilities, safely handling credentials over Supabase secure protocols.
* **Creation Portal:** An input system gathering essential event variables. Form must assert client-side validation on numbers and dates before performing operations against the remote server.

---

## 5. Step-by-Step Implementation Roadmap

The execution phase is strictly modular. **Rule for Execution:** *The developer or autonomous agent (e.g., Cline, Antigravity) must completely build, test, and verify the stability of the current phase before transitioning to the next successive phase.*

### 🟩 Phase 1: Core Architecture & Setup

* Establish the base file system inside the Next.js App Router workspace.
* Create a dedicated client module (`utils/supabase.ts`) parsing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
* Confirm local variables interface successfully without compilation errors.
* **Upon successful completion, move immediately to Phase 2.**

### 🟩 Phase 2: Navigation & Authentication

* Develop the persistent `Navbar` element using client hooks to listen to active session states.
* Build the login view interface at `app/login/page.tsx` integrating email-password authentication.
* Verify user creation and login state changes directly inside the Supabase Auth dashboard panel.
* **Upon successful completion, move immediately to Phase 3.**

### 🟩 Phase 3: Dynamic Homepage & State Matrix

* Clear out default placeholder views in `app/page.tsx`.
* Connect queries hitting the `events` data table sorted chronologically.
* Design standard grid components pulling live strings (Title, Date, Price, Location) from database payloads.
* Integrate explicit testing logic for loading spinners and empty database array configurations.
* **Upon successful completion, move immediately to Phase 4.**

### 🟩 Phase 4: Secure Event Creation Form

* Construct the interactive portal at `app/create/page.tsx`.
* Introduce explicit route redirection blocking anonymous unauthenticated hits.
* Standardize data inputs mapping precisely to the system database properties.
* Execute an operational test inserting a real event row, confirming immediate runtime rendering on the application homepage.
* **Upon successful completion, move immediately to Phase 5.**

### 🟩 Phase 5: Advanced Features & E-Commerce Integration

* Connect secondary workflows including advanced filtering by price or location.
* Introduce transactional validation steps using Stripe elements for commercial ticket sales.
* Conduct extensive final optimization passes across cross-browser environments.