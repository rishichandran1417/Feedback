#  College — Student Feedback & Grievance Management System

A secure, production-grade, full-stack web application designed for collegiate institutions to manage student complaints, academic suggestions, and infrastructure grievances from initial submission to administrative remediation.

Built with **React 19 + TypeScript + Vite**, **Tailwind CSS**, **Supabase (PostgreSQL, Auth, RLS, Storage)**, **Recharts**, **React Hook Form + Zod**, **SheetJS (XLSX)**, and an event-driven **Resend Automated Email Notification Engine**.

---

## 1. Visual & Product Design Direction

Adheres strictly to a **Clean, Minimal, Whitespace-First** design philosophy inspired by Linear, Stripe, and university administrative registries:
- **Restrained Academic Palette:** Clean white `#FFFFFF` canvas, soft neutral secondary surfaces `#F8FAFC`, deep slate primary typography `#172033`, muted secondary labels `#64748B`, and subtle `#E2E8F0` hairline borders.
- **Generous Spacing System:** Centered maximum-width container (`max-w-7xl`), 32–48px horizontal desktop margins, 32–40px section breathing room, and 20–24px content group spacing.
- **Calm, High-Contrast Typography:** Built on Inter typography with strict hierarchy (28px semibold headers, 18px section titles, 14px body text, 12px uppercase table headings).
- **Subtle Micro-Badges:** Semantic status and priority indicators with soft backgrounds and matching tinted border accents (e.g., emerald for resolved, amber for pending/info request, blue for in-progress, rose for overdue).

---

## 2. System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (VITE)                          │
│  React 19 + TypeScript + Tailwind CSS (Whitespace-First Minimal UI)    │
│  React Hook Form + Zod • Recharts • SheetJS XLSX • Lucide Icons        │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │                                │
                    │ Supabase JS SDK                │ LocalStorage Mock Engine
                    │ (When .env provided)           │ (Out-of-the-box fallback)
                    ▼                                ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────┐
│          SUPABASE BACKEND             │  │   LOCAL PERSISTENT ENGINE   │
│  PostgreSQL Normalized Schema         │  │  Full In-Memory LocalStorage│
│  Row Level Security (RLS) Policies    │  │  Simulated RLS & Role Filter│
│  Storage Buckets (Short-lived URLs)   │  │  Audit Trail Logging Engine │
│  Trigger Functions & Auto-Ref No.     │  │  Transactional Outbox Queue │
└───────────────────▲───────────────────┘  └──────────────▲──────────────┘
                    │                                     │
                    ▼                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│            AUTOMATED EMAIL NOTIFICATION SYSTEM (RESEND)                │
│  Supabase Edge Function: `supabase/functions/send-email/index.ts`       │
│  Transactional Outbox Pattern • Idempotency Protection • Bounded Retry  │
│  Branded Responsive HTML Email Templates with Plain-Text Fallbacks     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Capabilities & Workflows

### A. Student Portal
1. **Domain-Restricted Authentication:**
   - Registration and access strictly enforced for verified college email addresses ending with the configurable domain (e.g. `@college.edu`).
   - Rejection of generic non-institutional domains (e.g. `@gmail.com`, `@yahoo.com`).
   - Secure login, session persistence, and password recovery flows.
2. **Dashboard & KPIs:**
   - Real-time summary cards: Total Submissions, Open Complaints, In-Progress, and Resolved.
   - Attention banner when an administrative officer requests additional details.
   - Live activity timeline.
3. **Formal Feedback Submission:**
   - Multi-type selection: **Complaint**, **Suggestion**, or **General Feedback**.
   - Dynamic category loading linked to college departments.
   - Specific location tagging (campus block, hall, laboratory, or desk).
   - Priority grading (Low, Medium, High, Urgent).
   - **Confidential Evidence Upload:** Supports JPG, PNG, PDF, and DOCX up to configurable limit (default 10MB) stored in secure, private storage.
   - **Anonymous Feedback Toggle:** Optional policy-governed anonymity hiding student identity from departmental staff while preserving ticket tracking.
   - **Unique Reference Generation:** Issues an official registry code (e.g., `FB-2026-1001`).
4. **Submissions Registry & Communication:**
   - Multi-criteria search and filtering by reference number, subject, type, category, and status.
   - Interactive detail modal with immutable status audit history, resolution summaries, and permitted evidence download.
   - Two-way messaging thread allowing students to reply to official inquiries.

---

### B. Administrator Portal
1. **Overview Dashboard & Institutional KPIs:**
   - Dynamically calculated from actual database records (no hardcoded fake statistics).
   - Metrics: Total Received, Pending Review, In-Progress, Resolved, Overdue Tickets, and Average Resolution Time (in hours and days).
   - Interactive Recharts:
     - Workflow Distribution Donut Chart
     - Grievances by Category Horizontal Bar Chart
     - Intake Volume Trend Over Time
2. **Master Submission Management:**
   - Searchable, sortable, paginated data grid.
   - Multi-filters: Status, Type, Category, Department, Priority, Date Range, and Overdue Only.
3. **7-Stage Configurable Status Workflow:**
   1. `Submitted`
   2. `Pending Review`
   3. `In Progress`
   4. `Awaiting Student Response`
   5. `Resolved`
   6. `Closed`
   7. `Reopened`
4. **Mandatory Resolution Summary:**
   - Marking a ticket as `Resolved` enforces entry of an official remediation summary before saving, triggering a dedicated resolution email to the student.
5. **Private Staff Notes vs. Student Remarks:**
   - Clearly distinguished message types. Private internal notes are protected by database RLS and never exposed to student views, notifications, or email dispatches.
6. **Department & Category Master:**
   - Add/edit departments, contact emails, and heads of department.
   - Configure category SLAs and resolution targets.
   - Safeguard: Prevents deleting categories referenced by existing grievances.
7. **User Management:**
   - Account inspection and activation/suspension toggles.
   - Protected role promotion safeguard preventing removal of the last active administrator.
8. **Reports & Exports:**
   - Filter by date range, department, category, and status.
   - Export to **CSV** and **Excel (.xlsx)**.
   - **Formula Injection Sanitization:** Neutralizes spreadsheet formula injection attempts (cells starting with `=`, `+`, `-`, or `@` are safely escaped).

---

### C. Automated Email Communication System (Resend)
Integrated via **Resend** and Supabase Edge Function (`supabase/functions/send-email/index.ts`):
1. **Submission Acknowledgement:** Dispatched upon ticket creation containing reference number, subject, and secure portal link.
2. **Status Change Update:** Dispatched when status moves between workflow stages.
3. **Issue Resolved Email:** Transmits the official administrative resolution summary and 14-day reopening instructions.
4. **Issue Reopened Alert:** Notifies student when a case is reopened for investigation.
5. **Officer Reply / Information Request:** Sends student-visible replies and instructions when additional evidence is required.
6. **Transactional Outbox Table (`email_notifications`):**
   - Tracks `queued`, `sending`, `sent_to_provider`, `delivered`, and `failed` delivery states.
   - Protected with unique `idempotency_key` constraints to eliminate duplicate sends.
   - Admin Email Notification Hub featuring delivery logs, event toggles, and manual retry triggers.

---

## 4. Database Schema & Migration Files

All SQL scripts are located under `supabase/migrations/`:

| File | Purpose |
|------|---------|
| [`01_initial_schema.sql`](file:///c:/Users/rishi/Music/Feedback/supabase/migrations/01_initial_schema.sql) | Tables: `profiles`, `user_roles`, `departments`, `categories`, `submissions`, `submission_attachments`, `submission_messages`, `submission_status_history`, `notifications`, `system_settings` |
| [`02_rls_policies.sql`](file:///c:/Users/rishi/Music/Feedback/supabase/migrations/02_rls_policies.sql) | Row Level Security policies, `is_admin()` function, last admin deletion guard, private internal note isolation |
| [`03_seed_data.sql`](file:///c:/Users/rishi/Music/Feedback/supabase/migrations/03_seed_data.sql) | Seed data for 6 demonstration departments, categories with realistic SLA days, and institution settings |
| [`04_email_notifications_outbox.sql`](file:///c:/Users/rishi/Music/Feedback/supabase/migrations/04_email_notifications_outbox.sql) | `email_notifications` outbox table, queue indexes, and automated PostgreSQL trigger functions |

### Database Tables Summary

1. `profiles` — User identity, verified college email, student ID, department, timestamps.
2. `user_roles` — Strict role assignment (`student` or `administrator`).
3. `departments` — College units (Academic Affairs, Facilities, IT Services, Residential Life, Financial Aid, Examination Cell).
4. `categories` — Classifications with target SLA turnaround days (e.g., 1 to 7 days).
5. `submissions` — Grievance details, ownership, reference number, status, department routing, due date, resolution summary.
6. `submission_attachments` — Private evidence file metadata and secure storage paths.
7. `submission_messages` — Communication thread (`student_reply`, `admin_reply`, `info_request`, and `internal_note`).
8. `submission_status_history` — Immutable audit trail with previous status, new status, actor, and timestamp.
9. `notifications` — In-app alerts with unread counter.
10. `system_settings` — Configurable email domain, upload limits, and college metadata.
11. `email_notifications` — Transactional outbox with provider message IDs, attempt counts, and idempotency keys.

---

## 5. Local Setup & Running Instructions

### Prerequisites
- **Node.js:** v18.0.0 or higher (v24 LTS recommended)
- **npm:** v9.0.0 or higher

### Installation
```bash
# Clone or navigate to the project directory
cd c:\Users\rishi\Music\Feedback

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be accessible at: **`http://localhost:5173/`**

### Pre-Configured Demo Accounts
The system includes quick 1-click evaluation access in the header navigation and login screen:
- **Student Account:** `arjun.patel@college.edu` (Student ID: `AIT-2024-CS-084`)
- **Administrator Account:** `dean.academics@college.edu` (Dean Dr. Alistair Vance)

---

## 6. Supabase & Resend Production Deployment

### Step 1: Connect Real Supabase Project
1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor, execute the migration files in order:
   - `supabase/migrations/01_initial_schema.sql`
   - `supabase/migrations/02_rls_policies.sql`
   - `supabase/migrations/03_seed_data.sql`
   - `supabase/migrations/04_email_notifications_outbox.sql`
3. In Supabase Dashboard -> Storage, create a private bucket named `evidence`.
4. Copy your project URL and public Anon key into `.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
   ```

### Step 2: Configure Resend Transactional Emails
1. Sign up at [resend.com](https://resend.com) and create an API key (`re_...`).
2. Verify your sending domain (e.g. `notifications@cet.ac.in`).
3. Deploy the Edge Function using the Supabase CLI:
   ```bash
   supabase functions deploy send-email
   supabase secrets set RESEND_API_KEY=re_your_api_key_here
   supabase secrets set RESEND_SENDER_NAME="College of Engineering Trivandrum Grievance Cell"
   supabase secrets set RESEND_SENDER_EMAIL="notifications@cet.ac.in"
   ```

---

## 7. Testing & Verification Checklist

| # | Acceptance Criteria | Implementation Details | Status |
|---|---------------------|------------------------|:------:|
| 1 | Student email domain validation | Only email addresses matching `@college.edu` are accepted during login and registration | Verified |
| 2 | Rejection of unauthorized domains | Displays clear descriptive error message rejecting `@gmail.com` or unauthorized domains | Verified |
| 3 | Role-Based Access Control | Strict RLS; students cannot access admin routes or assign themselves admin roles | Verified |
| 4 | Grievance submission with evidence | Dynamic categories, priority, location, and drag & drop file upload (JPG/PNG/PDF/DOCX) | Verified |
| 5 | Evidence security & privacy | Validates size limits (<10MB), stored in private bucket, accessible only to authorized owner/admin | Verified |
| 6 | Student submission tracking | Full status history, administrator replies, and resolution summaries viewable | Verified |
| 7 | Isolation between student records | RLS prevents students from accessing other students' complaints by ID or direct URL | Verified |
| 8 | Administrative note privacy | `is_internal = true` staff notes are strictly excluded from student queries and emails | Verified |
| 9 | 7-Stage status management | Submitted -> Pending Review -> In Progress -> Awaiting Student -> Resolved -> Closed -> Reopened | Verified |
| 10 | Mandatory resolution summary | Enforces detailed resolution notes before transition to `Resolved` | Verified |
| 11 | Immutable audit history | Automatically records every status change with timestamp, previous state, and actor | Verified |
| 12 | Dynamic metrics & charts | Real calculations for total, pending, in-progress, resolved, overdue, and avg resolution time | Verified |
| 13 | Overdue issue detection | Dynamically calculates overdue tickets where `due_date < now` and status is unresolved | Verified |
| 14 | Category & Department CRUD | Master management with safeguards preventing deletion of categories referenced by tickets | Verified |
| 15 | CSV & Excel (.xlsx) export | Clean formatted exports with spreadsheet formula injection sanitization | Verified |
| 16 | Transactional email outbox | Event-driven queue via Resend with idempotency keys and retry capabilities | Verified |
| 17 | Responsive whitespace-first UI | Linear/Stripe-inspired minimal interface with generous spacing and mobile drawer support | Verified |
| 18 | Production build pass | `npm run build` compiles with 0 errors in Vite + TypeScript | Verified |
