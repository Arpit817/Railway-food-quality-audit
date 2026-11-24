import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui/index.js';

/**
 * Public Landing Website (Route: /)
 * Represents the official Indian Railways Food Quality Audit & Traceability portal.
 */
export function LandingPage() {
  const navigate = useNavigate();
  const [referenceNo, setReferenceNo] = useState('');

  useEffect(() => {
    document.title = 'RailFood Audit — Indian Railways Food Quality & Traceability Portal';
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (referenceNo.trim()) {
      navigate(`/track/${referenceNo.trim().toUpperCase()}`);
    }
  };

  const sampleBatches = [
    {
      token: 'Xk9PqA72mZ',
      train: '12424 Rajdhani Express',
      meal: 'Standard Veg Thali',
      kitchen: 'New Delhi Base Kitchen (NDLS)',
      badge: 'Northern Zone'
    },
    {
      token: 'Lm7RzW91pQ',
      train: '12004 Shatabdi Express',
      meal: 'Paneer Kulcha Combo',
      kitchen: 'New Delhi Satellite Kitchen',
      badge: 'Northern Zone'
    },
    {
      token: 'Nt5DsF41hS',
      train: '12951 Tejas Rajdhani',
      meal: 'Jain Meal Box',
      kitchen: 'Mumbai Central Base Kitchen',
      badge: 'Western Zone'
    }
  ];

  const quickRefs = ['RAIL-2026-K7M91A', 'RAIL-2026-B2V48N', 'RAIL-2026-Y8T31C'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-900 antialiased overflow-x-hidden">
      {/* Top National Header Bar */}
      <header className="bg-railway-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-railway-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
              🚆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white leading-tight">RailFood Audit</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  IRCTC QA
                </span>
              </div>
              <p className="text-[11px] text-railway-300">Ministry of Railways • Government of India</p>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="tel:139"
              className="hidden md:flex items-center gap-1.5 text-xs text-railway-200 hover:text-white"
              title="Rail Madad 24x7 Helpline"
            >
              <span>📞</span>
              <span>Helpline: <strong>139</strong></span>
            </a>

            <Link
              to="/login"
              className="min-h-[40px] px-4 py-2 rounded-lg bg-railway-700 hover:bg-railway-600 border border-railway-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>🛡️</span>
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero & Action Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-railway-100 text-railway-900 border border-railway-200 text-xs font-semibold">
            <span>🇮🇳</span>
            <span>Real-Time Railway Food Safety & Traceability Network</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            From Base Kitchen to Coach Berth: Complete Food Quality Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Authorized QR security tokens on meal packaging ensure instant passenger grievance registration with photographic proof, automated hygiene alerts, and rapid penalty enforcement.
          </p>
        </div>

        {/* Two Primary Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Track Grievance (Amazon Style) */}
          <Card className="lg:col-span-5 p-6 border-slate-200 shadow-md flex flex-col justify-between bg-white">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-xl">
                  🔎
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Track Food Grievance</h2>
                  <p className="text-xs text-slate-500">View real-time resolution timeline & inspector notes</p>
                </div>
              </div>

              <form onSubmit={handleTrackSubmit} className="space-y-3 pt-2">
                <div>
                  <label htmlFor="ref-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Enter 16-Digit Tracking Code
                  </label>
                  <input
                    id="ref-input"
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value.toUpperCase())}
                    placeholder="e.g. RAIL-2026-K7M91A"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-railway-500 min-h-[44px]"
                  />
                </div>

                <Button type="submit" variant="primary" size="md" className="w-full min-h-[44px] font-bold cursor-pointer">
                  Track Resolution Progress &rarr;
                </Button>
              </form>

              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Try Sample Reference Numbers:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickRefs.map((ref) => (
                    <button
                      key={ref}
                      type="button"
                      onClick={() => navigate(`/track/${ref}`)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-railway-50 hover:text-railway-800 border border-slate-200 text-slate-700 font-mono text-[11px] cursor-pointer transition-colors"
                    >
                      {ref}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 mt-4 flex items-center justify-between">
              <span>Includes Amazon-style milestone progression</span>
              <span className="text-emerald-700 font-semibold">✓ Live Updates</span>
            </div>
          </Card>

          {/* Card 2: Passenger Packaging QR Scanner Simulation */}
          <Card className="lg:col-span-7 p-6 border-slate-200 shadow-md flex flex-col justify-between bg-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">
                    📱
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Passenger Packaging QR Portal</h2>
                    <p className="text-xs text-slate-500">Scan meal sticker in train • Zero app install • Zero login</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Module A
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                In real train operations, passengers point their phone camera or Google Lens at the meal container QR code. Select any authorized batch token below to test the live passenger grievance workflow:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {sampleBatches.map((item) => (
                  <Link
                    key={item.token}
                    to={`/f/${item.token}`}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-railway-50 hover:border-railway-300 transition-all flex flex-col justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-railway-900 group-hover:text-railway-700">
                          {item.token}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">{item.badge}</span>
                      </div>
                      <strong className="text-xs text-slate-800 block truncate">{item.meal}</strong>
                      <span className="text-[11px] text-slate-500 block truncate mt-0.5">{item.train}</span>
                    </div>
                    <span className="text-[11px] font-bold text-railway-700 mt-2 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Scan Token &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 mt-4 flex items-center justify-between">
              <span>Automatically prefills vendor, train & kitchen</span>
              <span className="text-slate-700 font-medium">📷 Photographic Evidence Supported</span>
            </div>
          </Card>
        </div>

        {/* 3-Step Traceability Infographic */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              How the Railway Food Traceability Architecture Works
            </h3>
            <p className="text-xs text-slate-500">
              Closed-loop accountability connecting base kitchens, train passengers, and food safety officers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-railway-800 text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Encrypted Packaging Token</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Base kitchen issues random 10-character QR tokens for each cooked batch, binding the food box to train number, catering licensee, and expiry timestamp.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-railway-800 text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">Zero-Login Passenger Scan</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Passenger scans with Google Lens or camera. The form opens prefilled with train and kitchen metadata. Passenger rates quality and uploads photos.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-railway-800 text-white flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Zonal Inspection & Penalty</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Quality officers review evidence on the centralized audit ledger. 3+ hygiene alerts trigger immediate kitchen inspection and fines under Clause 8.
              </p>
            </div>
          </div>
        </section>

        {/* Live Platform Transparency Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
            <span className="text-2xl font-extrabold text-emerald-600 font-mono block">98.4%</span>
            <span className="text-xs font-semibold text-slate-600 mt-1 block">FSSAI Compliance Index</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
            <span className="text-2xl font-extrabold text-railway-800 font-mono block">4 Kitchens</span>
            <span className="text-xs font-semibold text-slate-600 mt-1 block">Monitored Base Kitchens</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
            <span className="text-2xl font-extrabold text-sky-600 font-mono block">&lt; 2.5 Hrs</span>
            <span className="text-xs font-semibold text-slate-600 mt-1 block">Avg Resolution Speed</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
            <span className="text-2xl font-extrabold text-indigo-600 font-mono block">100%</span>
            <span className="text-xs font-semibold text-slate-600 mt-1 block">Tamper-Evident QR Seals</span>
          </div>
        </section>
      </main>

      {/* Official Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-slate-800">
              Indian Railways Food Quality Audit Network &copy; {new Date().getFullYear()}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Developed under IRCTC Quality Assurance & Passenger Redressal Framework
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <Link to="/track" className="text-railway-700 hover:underline">
              Grievance Tracker
            </Link>
            <span>•</span>
            <Link to="/login" className="text-railway-700 font-bold hover:underline">
              Staff Portal Login
            </Link>
            <span>•</span>
            <a href="tel:139" className="text-slate-800 font-bold hover:underline">
              Rail Madad 139
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
