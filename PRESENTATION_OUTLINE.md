# 🖥️ 10-Slide Project Presentation (PPT) Outline
**Title**: Railway Food Quality Audit & Traceability Platform  
**Subtitle**: An End-to-End Reactive System for Passenger Hygiene Audits and Zonal Food Safety Governance  

---

### Slide 1: Title & Team Information
- **Project Title**: Railway Food Quality Audit & Traceability Platform
- **Course Focus**: INT252 (Web Development with ReactJS) & Engineering Management (EM)
- **Key Proposition**: Transforming reactive passenger grievance complaints into proactive, batch-traceable railway quality governance.

---

### Slide 2: Problem Statement & The Real-World Challenge
- Over 24 million passengers travel daily across Indian Railways.
- Existing grievance channels (Rail Madad, 139, Twitter/X, physical registers) fail because:
  - 90% of complaints cannot be mapped to the actual cooking kitchen or vendor.
  - Lack of photographic evidence creates a subjective dispute.
  - Complaints take days to triage, leaving subsequent passengers vulnerable to spoiled food batches.

---

### Slide 3: The Core Solution: Packaging Token Traceability
- **Cryptographic Packaging Token**: Random 10-character token (e.g. `/f/Xk9PqA72mZ`) printed on tamper-evident packaging stickers.
- **Pre-linked Database Entity**:
  $$\text{Vendor} \longleftrightarrow \text{Kitchen} \longleftrightarrow \text{Batch ID} \longleftrightarrow \text{Item} \longleftrightarrow \text{Train Number}$$
- **Zero Passenger Guesswork**: Passenger scans QR &rarr; metadata resolves automatically &rarr; photo and rating attached &rarr; root-cause identified instantly.

---

### Slide 4: System Architecture & User Roles
- **Passenger Portal (Public, Zero-Login)**: Mobile web application, touch-optimized, camera capture with client-side canvas downscaling.
- **Safety Inspector Dashboard (Staff)**: Zone-restricted review inbox, photo proof inspection, status workflow (*New &rarr; Under Review &rarr; Inspector Assigned &rarr; Action Taken &rarr; Closed*).
- **Railway Admin Portal (Admin)**: Vendor scorecards, Recharts sensory analytics, batch generation, and printable QR sticker sheets.

---

### Slide 5: Frontend Technical Stack & Modern React 19 Patterns
- **Build Engine & Core**: React 19, Vite 6, JavaScript (ES6+).
- **Styling & Accessibility**: Tailwind CSS mobile-first, semantic HTML landmarks, WCAG 2.1 accessible focus rings (`focus-visible`).
- **Validation**: Declarative Zod schemas with custom regex (PNR, mobile) and `.superRefine()` cross-field rules.
- **Data Visualizations**: Recharts (Bar, Donut, Line charts).

---

### Slide 6: State Architecture: Decoupling Local, Global, and Server State
- **Local State (`useState`)**: Isolated form controls, hover star states.
- **Server State (`TanStack React Query v5`)**: Caching, 30s background sync, window-focus revalidation, optimistic mutations with rollback.
- **Global Client State (`Zustand` & `Context`)**: Session auth, role-based guards, UI themes, and sidebar toggles.
- **Why Not Redux?**: Zustand eliminates boilerplate and unnecessary re-renders with hook selectors.

---

### Slide 7: Engineering Management: Quality Governance & Safety Algorithms
- **2-Hour Kitchen Safety Sliding-Window Engine**: Automatically flags critical alert if 3+ hygiene/foreign object issues occur from the same kitchen within 2 hours.
- **Vendor Governance**: Objective scorecard metrics (Average rating, repeat violation flag, complaint frequency per 1,000 meals).
- **Data Portability**: One-click RFC 4180 CSV export for divisional railway quality audits.

---

### Slide 8: Performance Engineering & Optimization Results
- **Diagnosis**: Using dev `RenderCounter` (`useRef`) to observe unnecessary render cycles.
- **State Localization**: Isolated the 1-second audit clock to stop parent re-renders.
- **Memoization (`React.memo`, `useMemo`, `useCallback`)**: Stress-tested with **500+ bulk complaints**, proving only active cards re-render.
- **Client-Side Image Downscaling**: HTML5 Canvas shrinks 5–10MB camera captures to <50KB before transmission.

---

### Slide 9: Risk Management, Cost-Benefit Analysis & KPIs
- **Risk Mitigation**: Offline warning banner (`useOnlineStatus`) for railway corridor dead-zones.
- **Cost-Benefit Ratio**: Estimated Benefit-Cost Ratio of **12.84** across an annualized division through reduced food spoilage and vendor penalty recovery.
- **Key Target KPIs**:
  - Mean Time to Triage (MTTT): $\le 15$ minutes.
  - Mean Time to Resolution (MTTR): $\le 4$ hours.
  - Traceability Accuracy: $\ge 98\%$.

---

### Slide 10: Conclusion & Future Roadmap
- **Academic Achievement**: Complete coverage of INT252 Units I–VI across 15 structured Git commit stages.
- **Future Scope**:
  1. Edge AI Computer Vision (TensorFlow.js) for automated foreign object detection.
  2. Integration with CRIS / NTES live train telemetry APIs.
  3. Multilingual voice feedback across 12 Indian regional languages.
- **Live Demo & Q&A Session**.
