import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui/index.js';
import { useMetadataQuery } from '../api/index.js';
import { useUIStore } from '../store/uiStore.js';

/**
 * Public Landing Website (Route: /)
 * Represents the official Indian Railways Food Quality Audit & Traceability portal.
 * Seamlessly connects Passengers, Catering Vendors, and Railway Safety Inspectors.
 */
export function LandingPage() {
  const navigate = useNavigate();
  const [referenceNo, setReferenceNo] = useState('');
  const [packagingToken, setPackagingToken] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    document.title = 'RailFood Audit — Indian Railways Food Quality & Traceability Portal';
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (referenceNo.trim()) {
      navigate(`/track/${referenceNo.trim().toUpperCase()}`);
    }
  };

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    if (packagingToken.trim()) {
      navigate(`/f/${packagingToken.trim()}`);
    }
  };

  // Camera scanner handlers with real BarcodeDetector support
  const startCamera = async () => {
    setCameraError('');
    setIsCameraOpen(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();

          if ('BarcodeDetector' in window) {
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            scanIntervalRef.current = setInterval(async () => {
              if (videoRef.current && videoRef.current.readyState === 4) {
                try {
                  const codes = await detector.detect(videoRef.current);
                  if (codes.length > 0) {
                    const raw = codes[0].rawValue;
                    const match = raw.match(/\/f\/([a-zA-Z0-9]+)/);
                    const tok = match ? match[1] : raw;
                    stopCamera();
                    navigate(`/f/${tok}`);
                  }
                } catch {}
              }
            }, 500);
          }
        }
      } else {
        setCameraError('Camera access not supported on this browser.');
      }
    } catch {
      setCameraError('Camera permission denied or camera device busy.');
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
          try {
            const barcodes = await detector.detect(img);
            if (barcodes.length > 0) {
              const raw = barcodes[0].rawValue;
              const match = raw.match(/\/f\/([a-zA-Z0-9]+)/);
              const tok = match ? match[1] : raw;
              navigate(`/f/${tok}`);
              return;
            }
          } catch {}
          useUIStore.getState().showToast({
            type: 'info',
            title: 'Photo Uploaded',
            message: 'Image received. Please confirm the packaging token to proceed.'
          });
        };
      } else {
        useUIStore.getState().showToast({
          type: 'info',
          title: 'Photo Uploaded',
          message: 'Image received. Please enter the packaging token to proceed.'
        });
      }
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

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
                <span className="text-base font-extrabold tracking-tight text-white leading-tight">
                  RailFood Audit
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  IRCTC QA
                </span>
              </div>
              <p className="text-[11px] text-railway-300">Ministry of Railways • Government of India</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Back & Forward Navigation */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleBack}
                className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-railway-800 hover:bg-railway-700 text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-railway-700"
                title="Go Back"
              >
                <span>←</span>
                <span className="hidden sm:inline">Back</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(1)}
                className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-railway-800 hover:bg-railway-700 text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-railway-700"
                title="Go Forward"
              >
                <span className="hidden sm:inline">Forward</span>
                <span>→</span>
              </button>
            </div>

            <Link
              to="/vendor"
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-bold border border-emerald-600/50 transition-colors flex items-center gap-1.5"
            >
              <span>🍱</span>
              <span className="hidden sm:inline">Vendor Portal</span>
            </Link>

            <Link
              to="/login"
              className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-railway-700 hover:bg-railway-600 border border-railway-600 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
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
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Recent Inquiries:
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
              <span>Full milestone resolution tracker</span>
              <span className="text-emerald-700 font-semibold">✓ Live System Updates</span>
            </div>
          </Card>

          {/* Card 2: Packaging QR Scanner & Live Token Lookup */}
          <Card className="lg:col-span-7 p-6 border-slate-200 shadow-md flex flex-col justify-between bg-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">
                    📱
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Meal Packaging QR Scanner Portal</h2>
                    <p className="text-xs text-slate-500">Scan meal sticker in train • Zero app install • Zero login required</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📷</span>
                  <span>Open Camera Scanner</span>
                </button>
              </div>

              {/* Direct Token Input Form */}
              <form onSubmit={handleTokenSubmit} className="space-y-2 pt-1">
                <label htmlFor="token-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enter 10-Character Packaging Token
                </label>
                <div className="flex gap-2">
                  <input
                    id="token-input"
                    type="text"
                    value={packagingToken}
                    onChange={(e) => setPackagingToken(e.target.value)}
                    placeholder="e.g. Xk9PqA72mZ or scan sticker"
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-railway-500 min-h-[44px]"
                  />
                  <Button type="submit" variant="primary" size="md" className="min-h-[44px] px-5 font-bold cursor-pointer whitespace-nowrap">
                    Verify & Open Form &rarr;
                  </Button>
                </div>
              </form>

              {/* Real QR Scanning Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer shadow-xs group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">📷</span>
                  <strong className="text-xs text-emerald-950 font-bold">Start Live Camera Scanner</strong>
                  <span className="text-[11px] text-emerald-800">Scan QR seal on meal box</span>
                </button>

                <label className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer shadow-xs group">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <span className="text-2xl group-hover:scale-110 transition-transform">🖼️</span>
                  <strong className="text-xs text-slate-900 font-bold">Upload QR Sticker Photo</strong>
                  <span className="text-[11px] text-slate-500">Pick from gallery or file</span>
                </label>
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
                Base kitchen issues 10-character QR tokens for each cooked batch, binding the food box to train number, catering licensee, and expiry timestamp.
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
            <span className="text-2xl font-extrabold text-railway-800 font-mono block">{kitchens.length} Kitchens</span>
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

      {/* Camera Viewfinder Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>📷</span>
                <span>Camera Scanner Viewfinder</span>
              </h3>
              <button
                type="button"
                onClick={stopCamera}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black aspect-square flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-8 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] text-white/90 bg-black/60 px-2 py-1 rounded">
                  Align meal sticker QR inside frame
                </span>
              </div>
            </div>

            {cameraError && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                {cameraError}
              </p>
            )}

            <div className="space-y-2 pt-1 text-xs">
              <label className="block p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-center cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    stopCamera();
                    handleImageUpload(e);
                  }}
                />
                <span className="font-semibold text-slate-700">🖼️ Or Upload Photo of Meal QR Seal</span>
              </label>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={stopCamera}
              className="w-full min-h-[38px] cursor-pointer"
            >
              Close Camera
            </Button>
          </div>
        </div>
      )}

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
            <Link to="/vendor" className="text-emerald-700 font-bold hover:underline">
              Vendor Packaging Portal
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
