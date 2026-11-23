# 🎓 Viva Voce: 20 Core Technical Questions & Model Answers
**Target Audience**: University Faculty & Evaluators (INT252 & Engineering Management)

---

### React & Architecture Questions (INT252)

#### Q1: Why did you choose a Single Page Application (SPA) architecture using React and Vite instead of a traditional Multi-Page Application (MPA)?
**Answer**: An SPA eliminates full-page server reloads by loading a single HTML shell and dynamically rewriting the DOM in response to user actions. For passengers on moving trains with spotty connectivity, and for safety inspectors managing live grievance streams, an SPA delivers instantaneous navigation, smooth transitions, and preserves client state without re-fetching layout assets.

#### Q2: What is the Virtual DOM and how does React reconciliation utilize keys during list rendering?
**Answer**: The Virtual DOM is a lightweight JavaScript representation of the real DOM tree kept in memory. When state updates, React runs a diffing algorithm (Reconciliation) between the previous and current Virtual DOM trees. When rendering lists using `.map()`, supplying unique, stable keys (`key={complaint.id}`) allows React's algorithm to uniquely track which elements were added, removed, or re-ordered, preventing costly re-creations of all real DOM nodes.

#### Q3: What is "Lifting State Up" and where did you implement it?
**Answer**: Lifting State Up is the pattern of moving shared state to the closest common ancestor when two or more sibling components need access to the same data. We implemented it in `ComplaintsPage.jsx`, where the complaint collection and the selected complaint ID reside in the parent, allowing the left inbox list and right detail panel to synchronize seamlessly via callback props.

#### Q4: What is the difference between Controlled and Uncontrolled components in React?
**Answer**: In a Controlled component, form inputs derive their value directly from React state (`value={comment}`) and update via `onChange` events, making React the single source of truth. In an Uncontrolled component, form data is handled by the DOM itself, and we query the value imperatively using a `useRef` hook (e.g. `seatRef.current.value` in our feedback form).

#### Q5: What is Derived State, and why is storing derived values in `useState` considered an anti-pattern?
**Answer**: Derived State refers to values calculated dynamically from existing state or props during render. Storing derived values (like `filteredComplaints` or `highSeverityCount`) in separate `useState` variables creates redundant state, introduces synchronization bugs, and triggers unnecessary extra re-renders. We calculated derived counts on the fly using `useMemo` and custom hooks.

#### Q6: Explain the `useEffect` dependency array and why cleanup functions are mandatory.
**Answer**: The dependency array controls when an effect executes: omitting it runs on every render, an empty array `[]` runs once on mount, and specifying variables `[filters]` runs when those variables change referentially. Cleanup functions (returned from the effect) are mandatory for cancelling ongoing subscriptions, clearing timers (`clearInterval`), and aborting fetch requests to prevent memory leaks and zombie state updates on unmounted components.

#### Q7: How does `React.memo` differ from `useMemo` and `useCallback`?
**Answer**: `React.memo` is a Higher-Order Component that memoizes a rendered component, skipping re-renders if its props have not changed. `useMemo` memoizes the *result of an expensive computation* across renders. `useCallback` memoizes the *definition of a callback function* so that passing event handlers to memoized child components does not break their referential equality.

#### Q8: How did you diagnose and solve unnecessary re-renders in your dashboard?
**Answer**: We built a custom `RenderCounter` using `useRef` to visually track component re-renders. In Stage 6, placing a 1-second ticking clock in the parent component forced all 500 complaint cards to re-render every second. In Stage 7, we pushed that state down into an isolated `<AuditClock />` component, stabilized callback handlers with `useCallback`, and wrapped `ComplaintCard` in `React.memo`, freezing unnecessary re-renders completely.

#### Q9: What are the Rules of Hooks?
**Answer**: (1) Only call hooks at the top level of React functions—never inside loops, conditions, or nested functions. (2) Only call hooks from React function components or custom hooks (`use*`). This guarantees that React can preserve hook state across multiple renders based on consistent call order.

#### Q10: Why migrate from `useEffect` data fetching to TanStack React Query?
**Answer**: Fetching data inside `useEffect` creates boilerplate, causes race conditions if parameters change rapidly, lacks in-memory caching, and does not support automatic background revalidation. TanStack React Query treats remote data as *Server State*, providing declarative query keys, background synchronization every 30 seconds, window-focus re-fetching, and optimistic updates with rollback.

#### Q11: How do Optimistic Updates work in your platform?
**Answer**: When an inspector updates a complaint status, our `useUpdateComplaintStatusMutation` uses `onMutate` to cancel outgoing refetches, snapshot the current cache, and update the UI immediately without waiting for server latency. If the network call fails, `onError` automatically restores the snapshot context; when it settles, `invalidateQueries` guarantees exact consistency with the backend database.

#### Q12: How did you implement client-side image optimization, and why?
**Answer**: Rather than uploading raw 5MB–10MB phone camera photos over weak train network connections, our `imageResizer.js` utility draws the file onto an off-screen HTML5 `<canvas>` element, downscales the dimensions to a maximum of 800×600 pixels, and exports a compressed JPEG Data URL (<50KB). This reduces payload weight by over 95% before network transmission.

---

### Engineering Management & Product Architecture Questions (EM)

#### Q13: How does your platform ensure food traceability from plate to kitchen?
**Answer**: Traditional railway complaint channels require passengers to know and type train numbers, catering vendors, and base kitchen licenses, leading to human error and untraceable grievances. Our platform prints non-sequential cryptographic QR tokens on authorized packaging stickers pre-linked to batch, kitchen, item, and vendor records. Scanning the QR code binds the grievance directly to the cooking batch with zero user entry error.

#### Q14: Explain the sliding-window Kitchen Safety Alert Engine.
**Answer**: To proactively prevent mass food-poisoning outbreaks, `alertEngine.js` evaluates incoming complaints chronologically. If 3 or more high-severity complaints (`hygiene_issue`, `foreign_object`, `stale_spoiled_food`) originate from the same base kitchen within a sliding 2-hour window, the system automatically triggers an emergency alert banner across inspector dashboards and alerts health inspection teams.

#### Q15: How did you decide between Local State, Global State, and Server State?
**Answer**: We applied the separation-of-concerns matrix:
- **Local State (`useState`)**: Ephemeral, component-specific inputs (comment text, rating hover).
- **Server State (`TanStack React Query`)**: Remote database collections requiring caching, background polling, and deduplication (complaints, vendors, batches).
- **Global Client State (`Zustand` & `Context`)**: Cross-cutting UI preferences and authentication sessions (logged-in user role, sidebar toggle, active theme).

#### Q16: Why did you use Zustand instead of Redux Toolkit?
**Answer**: For our client-side UI preferences, Redux Toolkit introduces unnecessary boilerplate (actions, reducers, dispatchers, store providers). Zustand is lightweight (<1KB), supports hook-based selectors that prevent unnecessary re-renders, requires zero wrapping providers, and provides clean state mutability via an intuitive API.

#### Q17: How did you approach error handling and fault tolerance?
**Answer**: We applied defense-in-depth:
1. Form input validation using declarative Zod schemas before submission.
2. HTTP error normalization via Axios response interceptors.
3. Network retry policies configured in React Query.
4. Component tree fault isolation using a React `ErrorBoundary` to display a graceful emergency recovery screen rather than a blank white page crash.

#### Q18: What is the purpose of SPA rewrite rules (`_redirects` / `vercel.json`)?
**Answer**: In a Single Page Application, client-side routes like `/dashboard/complaints` or `/f/Xk9PqA72mZ` exist only in browser memory, not as physical files on the server. If a user refreshes the page, a traditional web server returns a 404 error. The rewrite rule instructs the hosting server (Vercel/Netlify/Render) to redirect all incoming requests (`/*`) to `index.html` with an HTTP 200 status, allowing React Router to handle the route.

#### Q19: What are the primary KPIs defined in your Engineering Management report?
**Answer**:
1. *Mean Time to Triage (MTTT)*: $\le 15$ minutes on active trains.
2. *Mean Time to Resolution (MTTR)*: $\le 4$ hours for official vendor corrective action.
3. *Complaints per 1,000 Meals*: Normalizing grievance rates across private catering licensees.
4. *Traceability Rate*: Percentage of grievances mapped directly to verified cooking batches ($\ge 98\%$).

#### Q20: What are the future technological expansions planned for this platform?
**Answer**: (1) Edge AI Computer Vision using TensorFlow.js to automatically verify and classify foreign contaminants in photos before submission. (2) Direct integration with the Centre for Railway Information Systems (CRIS) and Rail Madad backends. (3) Multilingual voice feedback across 12 regional languages for passengers with limited literacy.
