# Railway Food Quality Audit Platform

> A comprehensive, mobile-first traceability and food quality audit platform for Indian Railways passengers and safety inspectors.

---

## Stage & Commit Progress Tracker

| Stage | Focus Area | Branch | Commit Message | Tag | Status |
|---|---|---|---|---|---|
| **Stage 1** | Pure JS Utility Layer & Mock Data | `stage-1-js-utility-layer` | `feat(utils): add pure utility functions with immutable updates and mock data` | `stage-1` | ✅ Completed |
| **Stage 2** | Vite + React Setup & Declarative List | `stage-2-vite-react-setup` | `chore: setup Vite React project with feature-based structure` | `stage-2` | 🔄 In Progress |
| **Stage 3** | Reusable UI Components | `stage-3-reusable-components` | `feat(ui): add reusable components with props and composition` | `stage-3` | ⏳ Pending |
| **Stage 4** | Tailwind Responsive Design & A11y | `stage-4-tailwind-a11y` | `style: add Tailwind responsive layouts and accessible UI` | `stage-4` | ⏳ Pending |
| **Stage 5** | useState & Events (Filters, Status Updates) | `stage-5-state-events` | `feat(dashboard): add filters, status updates with useState` | `stage-5` | ⏳ Pending |
| **Stage 6** | useEffect (Search Debounce, Persistence, Clock) | `stage-6-effects` | `feat(effects): add debounced search, persistence, live updates` | `stage-6` | ⏳ Pending |
| **Stage 7** | Performance (memo, useCallback, useMemo) | `stage-7-perf` | `perf: memoize list rendering and expensive calculations` | `stage-7` | ⏳ Pending |
| **Stage 8** | Custom Hooks Extraction | `stage-8-custom-hooks` | `refactor(hooks): extract reusable custom hooks` | `stage-8` | ⏳ Pending |
| **Stage 9** | Passenger Feedback Form & Photo Upload | `stage-9-feedback-form` | `feat(feedback): add passenger feedback form with photo upload` | `stage-9` | ⏳ Pending |
| **Stage 10** | Zod Schema Validation | `stage-10-zod-validation` | `feat(validation): add Zod schemas and dynamic error display` | `stage-10` | ⏳ Pending |
| **Stage 11** | REST API & json-server Integration | `stage-11-rest-api` | `feat(api): connect UI to REST API with loading/error states` | `stage-11` | ⏳ Pending |
| **Stage 12** | React Query Migration (Caching, Mutations) | `stage-12-react-query` | `refactor(api): migrate to React Query with caching and mutations` | `stage-12` | ⏳ Pending |
| **Stage 13** | React Router (Nested, Dynamic & Protected) | `stage-13-routing` | `feat(routing): add nested, dynamic and protected routes` | `stage-13` | ⏳ Pending |
| **Stage 14** | Global State, Analytics & Deployment | `stage-14-global-state` | `feat: add global state, analytics, QR generation and deployment config` | `stage-14` | ⏳ Pending |
| **Stage 15** | Comprehensive Documentation & EM Report | `stage-15-docs-report` | `docs: add README, syllabus mapping and project report` | `stage-15` | ⏳ Pending |

---

## Tech Stack
- **Frontend Core**: React 19, Vite, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Validation**: Zod
- **Data & Server Sync**: Axios, TanStack React Query, json-server
- **State Management**: React Context API, Zustand
- **Visuals & QR**: Recharts, qrcode.react, Lucide Icons

---

## Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local Vite development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```
