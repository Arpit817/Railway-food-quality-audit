# 📘 INT252: Syllabus-to-Code Mapping Document

This document proves complete compliance of the **Railway Food Quality Audit Platform** with the academic syllabus for **INT252: Web App Development with ReactJS**. Every theoretical unit is mapped directly to its concrete implementation within the codebase.

---

### Unit I: Modern JavaScript (ES6+), Immutability, and React Foundations

| Syllabus Topic | Practical Concept & Why It Matters | Implementation Location in Project |
|---|---|---|
| **Arrow functions, `let`/`const`, Destructuring, Spread/Rest** | Pure functional code, parameter extraction, and immutable data propagation. | [src/utils/complaintUtils.js](file:///c:/Users/Arpit/Desktop/EM%20Project/src/utils/complaintUtils.js), [src/components/ui/Button.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/ui/Button.jsx) |
| **Higher-Order Array Methods (`map`, `filter`, `reduce`)** | Grouping complaints by category, multi-criteria filtering, and calculating vendor scorecards without loops. | `groupComplaintsBy` uses `reduce`, `filterComplaints` uses `filter`, `getVendorStats` uses `reduce` in [src/utils/complaintUtils.js](file:///c:/Users/Arpit/Desktop/EM%20Project/src/utils/complaintUtils.js) |
| **Immutability & Pure Functions** | Ensuring state transitions return fresh object references without mutating previous memory. | `updateComplaintStatus()` in [src/utils/complaintUtils.js](file:///c:/Users/Arpit/Desktop/EM%20Project/src/utils/complaintUtils.js) |
| **Shallow vs Deep Copy & Referential Equality** | Proving `prevProps !== nextProps` behavior for React diffing algorithms. | Verified and logged in [test-stage1.js](file:///c:/Users/Arpit/Desktop/EM%20Project/test-stage1.js) lines 60–90 |
| **SPA vs MPA, Declarative UI, Virtual DOM & Reconciliation** | Rendering UI declaratively using JSX; using stable unique keys (`key={item.id}`) to minimize real DOM mutations. | [src/pages/ComplaintsPage.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/pages/ComplaintsPage.jsx), [src/App.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/App.jsx) |
| **Feature-Based Folder Structure** | Structuring application directories by domain concern rather than technical layers. | `src/features/{auth, feedback}`, `src/components/ui`, `src/hooks`, `src/pages` |

---

### Unit II: Components, Props, Composition, Tailwind, and Accessibility (A11y)

| Syllabus Topic | Practical Concept & Why It Matters | Implementation Location in Project |
|---|---|---|
| **Props, Destructuring & Default Props** | Passing data and callbacks down component trees with fallback parameters. | [src/components/ui/Button.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/ui/Button.jsx), [src/components/ui/Badge.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/ui/Badge.jsx) |
| **Component Composition & `children` Prop** | Compound Component pattern allowing flexible internal layout slots (`Card.Header`, `Card.Body`, `Card.Footer`). | [src/components/ui/Card.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/ui/Card.jsx) |
| **Conditional Rendering** | Rendering empty states vs active panels, and dynamic workflow action buttons based on status. | [src/components/ComplaintDetailPanel.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/ComplaintDetailPanel.jsx) lines 70–210 |
| **Lifting State Up** | Holding shared complaint selection in a common parent and passing update callbacks down. | [src/pages/ComplaintsPage.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/pages/ComplaintsPage.jsx) |
| **Tailwind CSS & Mobile-First Breakpoints** | Utility-first styling with responsive modifiers (`sm:`, `md:`, `lg:`) and custom semantic theme tokens. | [tailwind.config.js](file:///c:/Users/Arpit/Desktop/EM%20Project/tailwind.config.js), [src/components/ui/Layout.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/ui/Layout.jsx) |
| **Accessibility (WCAG 2.1 & Semantic HTML)** | Screen-reader friendly landmarks (`nav`, `main`, `aside`, `time`), high-contrast focus rings (`focus-visible`), and ARIA labels. | [src/components/ui/Layout.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/ui/Layout.jsx), [src/components/FilterBar.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/FilterBar.jsx) |

---

### Unit III: State, Events, Effects, Performance, and Custom Hooks

| Syllabus Topic | Practical Concept & Why It Matters | Implementation Location in Project |
|---|---|---|
| **`useState`, State Batching & Functional Updates** | Managing interactive form state; using `setComplaintList(prev => ...)` to avoid stale closures. | [src/components/PassengerMobileView.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/PassengerMobileView.jsx), [src/pages/ComplaintsPage.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/pages/ComplaintsPage.jsx) |
| **Derived State (Single Source of Truth)** | Calculating filtered lists and severity counts on the fly rather than keeping redundant state variables. | [src/hooks/useComplaintFilters.js](file:///c:/Users/Arpit/Desktop/EM%20Project/src/hooks/useComplaintFilters.js) |
| **`useEffect`, Dependency Array & Cleanup Functions** | Synchronizing `document.title`, debouncing search input with `clearTimeout`, and managing `setInterval` audit clock timers. | [src/components/FilterBar.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/FilterBar.jsx), [src/components/AuditClock.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/AuditClock.jsx), [src/components/ui/Toast.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/ui/Toast.jsx) |
| **Performance: `React.memo`, `useMemo`, `useCallback`** | Memoizing 500+ item card lists, stabilizing event handler memory addresses, and memoizing expensive filter calculations. | [src/components/ComplaintCard.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/ComplaintCard.jsx), [src/pages/ComplaintsPage.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/pages/ComplaintsPage.jsx) |
| **State Localization (Pushing State Down)** | Moving 1-second ticking clock out of parent down to leaf node to eliminate application-wide re-renders. | [src/components/AuditClock.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/AuditClock.jsx) |
| **Custom Hooks Architecture** | Encapsulating reusable business concerns (`useDebounce`, `useLocalStorage`, `useOnlineStatus`, `useToggle`, `useComplaintFilters`). | [src/hooks/](file:///c:/Users/Arpit/Desktop/EM%20Project/src/hooks/) directory |

---

### Unit IV: Advanced Forms, Uncontrolled Components, and Zod Validation

| Syllabus Topic | Practical Concept & Why It Matters | Implementation Location in Project |
|---|---|---|
| **Controlled Form Components** | React controls `rating`, `category`, `comment`, `phone` with real-time derived severity calculations. | [src/components/PassengerMobileView.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/PassengerMobileView.jsx) |
| **Uncontrolled Component (`useRef`)** | Reading DOM input values directly upon submission without triggering re-renders (`seatRef.current.value`). | [src/components/PassengerMobileView.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/PassengerMobileView.jsx) line 60 |
| **Schema-Based Validation with Zod** | Centralized declarative schema models with custom regex (Indian PNR, Mobile) and `.superRefine()`. | [src/utils/validationSchemas.js](file:///c:/Users/Arpit/Desktop/EM%20Project/src/utils/validationSchemas.js) |
| **Validate-on-Blur and Validate-on-Submit** | Transforming Zod `safeParse()` issues into component error maps and auto-focusing the first invalid field. | [src/components/PassengerMobileView.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/PassengerMobileView.jsx) lines 65–130 |
| **Client-Side Image Processing** | HTML5 Canvas downscaling resizing 5MB smartphone camera photos to <50KB before upload. | [src/utils/imageResizer.js](file:///c:/Users/Arpit/Desktop/EM%20Project/src/utils/imageResizer.js) |

---

### Unit V: Asynchronous REST APIs, TanStack React Query, and React Router

| Syllabus Topic | Practical Concept & Why It Matters | Implementation Location in Project |
|---|---|---|
| **HTTP/REST Client with Axios** | Centralized client with request/response interceptors, error normalization, and environment base URLs. | [src/api/client.js](file:///c:/Users/Arpit/Desktop/EM%20Project/src/api/client.js), [src/api/complaintsApi.js](file:///c:/Users/Arpit/Desktop/EM%20Project/src/api/complaintsApi.js) |
| **Client State vs Server State** | Explaining why remote server data requires caching, deduplication, and background sync instead of `useState`. | Documented in Viva Q&As; implemented via React Query in [src/api/queries.js](file:///c:/Users/Arpit/Desktop/EM%20Project/src/api/queries.js) |
| **TanStack React Query (v5)** | Caching with `staleTime`, background revalidation (`refetchInterval: 30000`), query invalidation, and optimistic status updates with cache rollback. | [src/api/queries.js](file:///c:/Users/Arpit/Desktop/EM%20Project/src/api/queries.js), [src/api/queryClient.js](file:///c:/Users/Arpit/Desktop/EM%20Project/src/api/queryClient.js) |
| **Client-Side Routing with React Router** | Route hierarchies, Layout route (`/dashboard`) with persistent navigation, and dynamic route rendering via `<Outlet />`. | [src/App.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/App.jsx), [src/pages/DashboardLayout.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/pages/DashboardLayout.jsx) |
| **Dynamic Parameters & Query Strings** | Reading `:token` via `useParams()`, and synchronizing filters via `useSearchParams()`. | [src/pages/QRLandingPage.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/pages/QRLandingPage.jsx), [src/pages/ComplaintsPage.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/pages/ComplaintsPage.jsx) |
| **Route Protection & Role Guards** | Restricting unauthorized access with `<ProtectedRoute>` and rendering 403 Forbidden screens. | [src/features/auth/ProtectedRoute.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/features/auth/ProtectedRoute.jsx) |
| **Code Splitting with `React.lazy` + `Suspense`** | Lazy-loading pages to reduce initial bundle download sizes and improve performance. | [src/App.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/App.jsx) lines 6–22 |

---

### Unit VI: Global State, Visualization, Error Boundaries, and Deployment

| Syllabus Topic | Practical Concept & Why It Matters | Implementation Location in Project |
|---|---|---|
| **Global State Management (Zustand & Context API)** | Using Context for user session/auth and Zustand for lightweight UI preferences without Redux boilerplate. | [src/features/auth/AuthContext.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/features/auth/AuthContext.jsx), [src/store/uiStore.js](file:///c:/Users/Arpit/Desktop/EM%20Project/src/store/uiStore.js) |
| **Data Visualizations (Recharts)** | Rendering interactive BarCharts, Donut PieCharts, and LineCharts with custom tooltips. | [src/pages/QualityAnalyticsPage.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/pages/QualityAnalyticsPage.jsx) |
| **Domain Safety Rules & Algorithms** | Sliding-window algorithm evaluating timestamps to flag 3+ hygiene issues in 2 hours from the same kitchen. | [src/utils/alertEngine.js](file:///c:/Users/Arpit/Desktop/EM%20Project/src/utils/alertEngine.js) |
| **React Error Boundary** | Catching unhandled JavaScript runtime exceptions using class lifecycle methods (`componentDidCatch`). | [src/components/ErrorBoundary.jsx](file:///c:/Users/Arpit/Desktop/EM%20Project/src/components/ErrorBoundary.jsx) |
| **Cloud Deployment Configurations** | SPA rewrite rule (`/* -> /index.html 200`) for zero-configuration deployment on Vercel, Netlify, and Render. | [vercel.json](file:///c:/Users/Arpit/Desktop/EM%20Project/vercel.json), [public/_redirects](file:///c:/Users/Arpit/Desktop/EM%20Project/public/_redirects) |
