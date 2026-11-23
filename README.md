# 🚆 RailFood Audit — Real-Time Food Traceability & Safety Governance Platform

> A production-grade, mobile-first food traceability and quality audit platform designed for railway networks. Connects passenger on-train sensory feedback directly to base kitchens, catering contractors, and food safety officers using tamper-evident cryptographic QR packaging tokens.

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=react-query&logoColor=white)](https://tanstack.com/query)
[![Zod](https://img.shields.io/badge/Zod-3.24-3E67B1?logo=zod&logoColor=white)](https://zod.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-v5-brown)](https://zustand.docs.pmnd.rs/)
[![Recharts](https://img.shields.io/badge/Recharts-v2.15-22c55e)](https://recharts.org/)

---

## 💡 The Problem & The Solution

### The Challenge
Food grievances on passenger trains are notoriously difficult to resolve:
- **Lack of Traceability**: Grievances posted on social media or hotlines rarely contain the exact cooking batch, satellite kitchen, or catering licensee ID.
- **Subjective Disputes**: Without verified photographic evidence taken at the berth, complaints often result in a stalemate between passenger claims and vendor denials.
- **Slow Resolution**: Quality teams remain purely reactive, unable to catch widespread food contamination before multiple passengers fall ill.

### The Traceability Solution
Every authorized meal packaging box receives a tamper-evident sticker with a cryptographically generated, non-sequential QR token (e.g. `https://railfood.app/f/Xk9PqA72mZ`).

When the passenger scans the QR code with their smartphone:
1. **Zero Data Entry**: The web application immediately resolves the token to its origin: **Catering Vendor**, **Base Kitchen (FSSAI license)**, **Batch ID**, **Preparation Timestamp**, and **Train Number**.
2. **Instant Evidence Capture**: The passenger snaps 1–3 photos. The browser compresses the image from 10MB to <50KB using client-side HTML5 Canvas before uploading.
3. **Automated Triage**: An integrated sliding-window alert engine flags any base kitchen logging $\ge 3$ critical hygiene complaints within a 2-hour window as an emergency safety violation.

---

## ✨ Core Features

### 📱 1. Mobile Passenger Experience (Zero Install)
- **Instant QR Landing (`/f/:token`)**: Opens directly in any mobile browser without requiring app installation or account signup.
- **Interactive Ratings & Feedback**: Star ratings, categorized issue tags (*Hygiene, Foreign Contaminant, Spoilage, Packaging, Overcharging, Portion, Taste*).
- **Client-Side Photo Compression**: Off-screen HTML5 Canvas downscales high-res smartphone camera captures to under 50KB for reliable transmission over spotty rail track networks.
- **Real-Time Network Awareness**: Offline warning banner detects signal loss inside tunnels (`useOnlineStatus`).
- **Grievance Tracking (`/track/:ref`)**: Instant alphanumeric tracking code (e.g. `RAIL-2026-K7M91A`) with live resolution milestones (*New &rarr; Under Review &rarr; Inspector Assigned &rarr; Action Taken &rarr; Closed*).

### 📋 2. Inspector Review Workspace
- **Zone-Restricted Inbox**: Multi-criteria debounced search, status filters, and category chips.
- **Comprehensive Audit Trail**: Every status change permanently logs the inspector's ID, timestamp, and mandatory remarks.
- **Optimistic Updates**: Immediate UI feedback powered by TanStack React Query with automatic rollback on network failure.
- **Stress-Tested Rendering**: Optimized with `React.memo`, `useCallback`, and `useMemo` to handle **500+ live complaints** without UI frame drops.

### 📊 3. Executive Quality Analytics & Admin Operations
- **Interactive Recharts Telemetry**: Category distribution bar charts, severity donut breakdowns, and hourly complaint influx trendlines.
- **2-Hour Kitchen Safety Alert Engine**: Automatically escalates repeat hygiene violations originating from the same kitchen within a 2-hour window.
- **Vendor Performance Scorecards**: Tracks average ratings, total complaints, resolution rates, and repeat violator flags.
- **One-Click CSV Export**: Download complete complaint audit data directly into Excel/CSV.
- **Bulk QR Token Generator**: Batch management portal generating printable sticker sheets with random authorized tokens.

---

## 🏛️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer (SPA)                     │
│  React 19 • Vite 6 • Tailwind CSS • React Router 7          │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
     ┌─────────▼──────────┐        ┌──────────▼──────────┐
     │  Client State      │        │  Server State       │
     │  Zustand & Context │        │  TanStack Query v5  │
     │  (UI, Theme, Auth) │        │  (Cache, Auto-sync) │
     └────────────────────┘        └──────────┬──────────┘
                                              │ Axios HTTP
                                   ┌──────────▼──────────┐
                                   │  REST Backend API   │
                                   │  json-server        │
                                   │  (Port 3001)        │
                                   └─────────────────────┘
```

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | React 19 (Functional Components, Custom Hooks) |
| **Build & Tooling** | Vite 6, PostCSS, Autoprefixer |
| **Styling & Design System** | Tailwind CSS (Custom railway palette, WCAG 2.1 accessibility) |
| **Server State Management** | TanStack React Query v5 (5-min staleTime, 30s polling, optimistic mutations) |
| **Client Global State** | Zustand v5 (UI preferences, active alerts), React Context (Authentication) |
| **Routing & Navigation** | React Router v7 (Dynamic parameters, nested layout routes, protected role guards) |
| **Schema Validation** | Zod (Custom regex for Indian PNR & Mobile, `.superRefine()` multi-field rules) |
| **Visual Telemetry** | Recharts (Responsive SVG BarChart, PieChart, LineChart) |
| **Fault Isolation** | React Error Boundary (Emergency system recovery UI) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<YOUR-USERNAME>/railway-food-quality-audit.git
   cd railway-food-quality-audit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Start the Mock REST API Server**:
   In your first terminal:
   ```bash
   npm run api
   ```
   *The mock backend runs at `http://localhost:3001` watching `db.json`.*

5. **Start the Frontend Development Server**:
   In your second terminal:
   ```bash
   npm run dev
   ```
   *Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 🔑 Demo Access & Roles

The platform includes built-in demo credentials to explore different role perspectives:

| Role | Username / Identity | Zone | Permissions |
|---|---|---|---|
| **Passenger** | Public (No login needed) | Public | Scan QR tokens, submit feedback, track status via `/track` |
| **Safety Inspector** | `inspector.nr@railfood.gov.in` | Northern Zone | Review grievances, update action logs, verify photos |
| **Railway Admin** | `admin.safety@railfood.gov.in` | All India | Access `/admin/batches`, generate QR stickers, view scorecards |

*To switch roles, visit `/login` or use the role switcher in the sidebar.*

---

## 📁 Repository Structure

```text
├── public/
│   └── _redirects              # Netlify & Render SPA rewrite configuration
├── src/
│   ├── api/                    # Axios HTTP client, REST services, TanStack Query hooks
│   ├── components/             # Reusable atomic UI library (Button, Badge, Card, etc.)
│   ├── features/               # AuthContext & ProtectedRoute guards
│   ├── hooks/                  # Custom hooks (useDebounce, useOnlineStatus, useComplaintFilters)
│   ├── pages/                  # Route views (ComplaintsPage, VendorsPage, AnalyticsPage, etc.)
│   ├── store/                  # Zustand global UI store
│   ├── utils/                  # Alert engine, canvas resizer, validation schemas, CSV exporter
│   ├── App.jsx                 # Routing hierarchy & ErrorBoundary
│   ├── main.jsx                # Application root & QueryClientProvider
│   └── index.css               # Tailwind CSS directives
├── db.json                     # Relational database (Vendors, Kitchens, Batches, QR Tokens, Complaints)
├── vercel.json                 # Vercel SPA rewrite configuration
└── vite.config.js              # Vite bundler configuration
```

---

## 📦 Production Build & Deployment

To compile an optimized production build:
```bash
npm run build
npm run preview
```

### Deploying to Cloud Platforms
- **Vercel**: Configuration is pre-included in `vercel.json` (`rewrites: [{ source: "/(.*)", destination: "/index.html" }]`).
- **Netlify / Render**: Configuration is pre-included in `public/_redirects` (`/* /index.html 200`).

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
