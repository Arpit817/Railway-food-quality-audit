/**
 * Generates lightweight, self-contained SVG Data URI images for food audit evidence
 * Guaranteed 0 latency, 100% offline reliability, zero external placeholder URLs
 */
export function createEvidenceImage(label, category = 'Food Safety Audit') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bg)"/>
    <!-- Viewfinder Grid -->
    <path d="M 40 60 L 40 40 L 60 40 M 540 40 L 560 40 L 560 60 M 40 340 L 40 360 L 60 360 M 560 340 L 560 360 L 540 360" stroke="#38bdf8" stroke-width="3" fill="none"/>
    <circle cx="300" cy="180" r="48" fill="#334155" stroke="#64748b" stroke-width="2"/>
    <text x="300" y="190" text-anchor="middle" font-size="34" fill="#f8fafc">📷</text>
    <!-- Label Banner -->
    <rect x="60" y="270" width="480" height="70" rx="8" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
    <text x="300" y="298" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#38bdf8">EVIDENCE: ${label}</text>
    <text x="300" y="322" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8">${category} • IRCTC AUDIT TELEMETRY</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const EVIDENCE_IMAGES = {
  insectInDal: createEvidenceImage('Foreign Contaminant in Dal Tray', 'Biological Hazard Inspection'),
  greasyPackaging: createEvidenceImage('Tampered Seal & Greasy Packaging', 'Packaging Integrity Check'),
  leakedCurry: createEvidenceImage('Severe Gravy Leakage & Heat Seal Fault', 'Container Sealing Defect'),
  stapleInRice: createEvidenceImage('Metallic Staple Wire in Biryani Portion', 'Physical Hazard Evidence'),
  billOvercharge: createEvidenceImage('Overcharge Cash Receipt Above MRP', 'Catering Fare Tariff Audit'),
  fermentedFood: createEvidenceImage('Fermented & Spoiled Vegetable Gravy', 'Thermal Degradation Notice'),
  stoneInRice: createEvidenceImage('Inorganic Stone Fragment in Rice', 'Raw Material Quality Audit'),
  sambarContamination: createEvidenceImage('Foul Oil Slick Floating on Sambar', 'Potable Swab Failure Record'),
  plasticShard: createEvidenceImage('Brittle Plastic Fragment in Meal Box', 'Container Foreign Object Notice')
};
