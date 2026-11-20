import React from 'react';
import { COMPLAINTS, VENDORS, KITCHENS } from './utils/mockData.js';

/**
 * Stage 2: Initial App Component
 * Demonstrates:
 * - Declarative UI rendering
 * - List rendering with .map() and unique keys
 * - Basic props and JSX structure
 */
function App() {
  // Lookup maps for vendor and kitchen display names
  const vendorMap = VENDORS.reduce((acc, v) => ({ ...acc, [v.id]: v.name }), {});
  const kitchenMap = KITCHENS.reduce((acc, k) => ({ ...acc, [k.id]: k.location }), {});

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '2px solid #0284c7', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#0369a1', margin: 0 }}>🚆 Railway Food Quality Audit Platform</h1>
        <p style={{ color: '#475569', marginTop: '0.5rem' }}>
          Real-time Food Traceability & Quality Feedback Audit System (Stage 2: Setup & Declarative List Rendering)
        </p>
      </header>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#1e293b' }}>
          Registered Complaints Overview ({COMPLAINTS.length} complaints)
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Each item is rendered declaratively from mock data via <code>.map()</code> with a stable, unique <code>key</code>.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {COMPLAINTS.map((complaint) => {
          const isHighSeverity = complaint.severity === 'high';
          const isMediumSeverity = complaint.severity === 'medium';
          const badgeColor = isHighSeverity ? '#ef4444' : isMediumSeverity ? '#f59e0b' : '#10b981';

          return (
            <article
              key={complaint.id}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#0f172a' }}>
                  {complaint.referenceNo}
                </span>
                <span
                  style={{
                    backgroundColor: badgeColor,
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}
                >
                  {complaint.severity}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                <strong>Vendor:</strong> {vendorMap[complaint.vendorId] || complaint.vendorId}
                <br />
                <strong>Kitchen:</strong> {kitchenMap[complaint.kitchenId] || complaint.kitchenId}
              </div>

              <p style={{ margin: '0.5rem 0', color: '#334155', fontSize: '0.9rem', lineHeight: '1.4' }}>
                "{complaint.comment}"
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                <span>⭐ Rating: {complaint.rating}/5</span>
                <span>Status: <em>{complaint.status}</em></span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default App;
