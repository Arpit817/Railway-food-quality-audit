# 📑 Engineering Management (EM) Project Report
## Project: Railway Food Quality Audit & Traceability Platform
**Course**: Engineering Management (EM)  
**Industry Domain**: Indian Railways Passenger Amenities, Food Safety & Supply Chain Governance  

---

### 1. Executive Summary & Problem Diagnosis
Indian Railways serves over 24 million passengers daily across 13,000+ trains. Despite stringent FSSAI and IRCTC catering guidelines, public dissatisfaction with meal hygiene, foreign contaminants, and portion sizes remains acute.

**Root-Cause Diagnosis (Ishikawa Fishbone Analysis)**:
1. **Methods**: Grievances filed on social media or physical complaint books lack traceability to the specific cooking facility or catering licensee.
2. **Material**: Packaged meals lack cryptographic identity; food served in coach B2 cannot be differentiated from meals served in coach S5.
3. **Measurement**: Lack of photographic evidence creates a "passenger's word vs vendor's word" stalemate.
4. **Environment**: Low cellular bandwidth along rail corridors causes mobile upload forms to fail.

**Engineering Solution**: An end-to-end food quality audit platform combining non-sequential packaging QR tokens, client-side Canvas downscaling, role-based inspector triage, and automated safety alert rules.

---

### 2. Stakeholder Analysis & Power/Interest Matrix

| Stakeholder Group | Interest in Project | Power Level | Strategic Engagement Strategy |
|---|---|---|---|
| **Railway Board & Ministry of Railways** | Brand reputation, passenger satisfaction, public health safety | **High Power / High Interest** | **Manage Closely**: Executive dashboards, monthly KPI reports, vendor compliance ratings. |
| **Zonal Food Safety Officers / Inspectors** | Efficient grievance triage, verified photo evidence, action audit logs | **High Power / High Interest** | **Manage Closely**: Streamlined master-detail review workspace, zone-based routing. |
| **Catering Licensees / Private Vendors** | Contractual penalties, fair dispute resolution, feedback transparency | **High Power / Low Interest** | **Keep Satisfied**: Objective evidence logs, clear severity weighting, elimination of fake claims. |
| **Train Passengers (Public)** | Easy meal feedback, rapid resolution, food hygiene guarantees | **Low Power / High Interest** | **Keep Informed**: Zero-install mobile QR portal, SMS/Ref tracking, anonymous filing. |
| **Kitchen Operations Staff / Cooks** | Operational workloads, batch sticker application | **Low Power / Low Interest** | **Monitor**: One-click printable batch sticker generation sheets. |

```
High Power  │  [KEEP SATISFIED]             [MANAGE CLOSELY]
            │  • Private Catering Vendors   • Railway Safety Board
            │                               • Food Safety Inspectors
            ├───────────────────────────────────────────────────────
Low Power   │  [MONITOR]                    [KEEP INFORMED]
            │  • Base Kitchen Staff         • Train Passengers
            └───────────────────────────────────────────────────────
                      Low Interest                     High Interest
```

---

### 3. SWOT Analysis

```
STRENGTHS                                     WEAKNESSES
• Guaranteed traceability via unique tokens   • Dependency on kitchen staff affixing stickers
• Client-side image compression (<50KB)       • Requires internet connection for live sync
• Zero-login mobile web passenger access      • Mock REST backend in current prototype
• Automated 2-hour kitchen safety alarms

OPPORTUNITIES                                 THREATS
• Integration with official Rail Madad & PNR  • Malicious scanning by non-passengers (mitigated)
• Computer vision AI for hygiene scoring      • Vendor pushback against strict penalty clauses
• Expansion to station food stalls & Jan Aahar • Cellular dead-zones in remote rail corridors
```

---

### 4. Risk Register & Mitigation Strategy

| Risk ID | Description | Severity | Probability | Risk Level | Mitigation Strategy |
|---|---|---|---|---|---|
| **R-01** | Compromised/Duplicate QR Scanning | High | Low | Moderate | Restrict token to 1 submission per device; token state transitions to `consumed`. |
| **R-02** | Passenger upload failure in tunnels | Medium | High | High | Implemented `useOnlineStatus` hook with local draft persistence and visual alert banner. |
| **R-03** | Server overload from high-res photos | High | Medium | High | Client-side HTML5 Canvas downscaling automatically reduces 5–10MB photos to ~40KB. |
| **R-04** | Vendor dispute over unfair penalties | Medium | Medium | Moderate | Mandatory 15-character inspector remarks enforced via Zod schema before status closure. |
| **R-05** | Delayed inspector triage | High | Medium | High | Automated sliding-window rule flags 3+ hygiene issues in 2h as urgent system alarms. |

---

### 5. Cost Estimation & Cost-Benefit Analysis (CBA)

#### Phase 1 Project Development Cost Estimate (Academic Prototype to Pilot)
- **Frontend & Architectural Engineering**: 160 Hours @ ₹750/hr = ₹1,20,000
- **Cloud Infrastructure (Vercel Frontend + Render Server)**: ₹2,500 / month
- **Thermal QR Sticker Printers (4 Pilot Kitchens @ ₹8,000)**: ₹32,000
- **Quality Assurance & Security Review**: ₹30,000
- **Total Initial Investment (CAPEX)**: **₹1,84,500**

#### Cost-Benefit Return (Annualized across 1 Railway Division)
- **Reduction in Food Waste & Spoilage**: Early detection of bad milk/curd saves ~₹6,50,000 annually.
- **Vendor Penalties Collected with Undeniable Photo Evidence**: ~₹14,00,000 annually.
- **Reduction in Call Center / Rail Madad Manual Routing Costs**: ~₹3,20,000 annually.
- **Total Annual Tangible Benefits**: **₹23,70,000**
- **Benefit-Cost Ratio (BCR)**: $\frac{23,70,000}{1,84,500} \approx \mathbf{12.84}$ (Extremely viable).

---

### 6. Key Performance Indicators (KPIs)

1. **Mean Time to Triage (MTTT)**: Average time elapsed from passenger QR submission to inspector review assignment (Target: $\le 15$ minutes on active trains).
2. **Mean Time to Resolution (MTTR)**: Time from grievance creation to vendor penalty or corrective action log closure (Target: $\le 4$ hours).
3. **Complaint Frequency per 1,000 Meals**: Normalization metric across catering vendors to identify repeat violators (Target: $\le 1.2$ complaints / 1,000 meals).
4. **Traceability Rate**: Percentage of passenger complaints directly mapped to a verified batch and kitchen (Target: $\ge 98\%$).

---

### 7. PDCA Quality Assurance Cycle (Deming Wheel)

```
        PLAN
  • Define FSSAI meal standards
  • Encode batch parameters into random QR tokens
  • Configure 2-hour kitchen safety threshold rules
                    │
                    ▼
         DO
  • Print stickers in base kitchens
  • Affix to meal packaging before train loading
  • Enable passenger mobile QR feedback capture
                    │
                    ▼
        CHECK
  • Monitor Recharts sensory analytics & hourly trends
  • Evaluate automated sliding-window safety alerts
  • Review vendor scorecards and repeat violation rates
                    │
                    ▼
         ACT
  • Enforce contractual fines under IRCTC Clause 8
  • Blacklist non-compliant kitchens
  • Refine cooking and heat-sealing operating procedures
```

---

### 8. Work Breakdown Structure (WBS) & Timeline

```
1.0 Railway Food Quality Audit Platform
 ├── 1.1 Requirements & Domain Schema (Stage 1)
 ├── 1.2 Core Client Architecture (Stages 2 - 4)
 ├── 1.3 State & Reactive Logic (Stages 5 - 7)
 ├── 1.4 Custom Hooks & Mobile Feedback (Stages 8 - 9)
 ├── 1.5 Data Integrity & Schema Validation (Stage 10)
 ├── 1.6 Asynchronous API & React Query (Stages 11 - 12)
 ├── 1.7 Client-Side Routing & Guards (Stage 13)
 └── 1.8 Analytics, Deployment & Quality Governance (Stages 14 - 15)
```

---

### 9. Future Roadmap & Technology Expansion
1. **Edge AI Contaminant Detection**: Integrate lightweight TensorFlow.js models in the browser to automatically detect foreign objects (insects, plastic, hair) in uploaded photos before submission.
2. **Direct Rail Madad & NTES API Integration**: Auto-sync train running status and passenger PNR berth allocations from official Centre for Railway Information Systems (CRIS) backends.
3. **Multilingual Voice Feedback**: Add speech-to-text input across 12 Indian regional languages for passengers with limited literacy.
