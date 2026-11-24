import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useMetadataQuery, useComplaintsQuery } from '../api/index.js';
import { metadataApi } from '../api/complaintsApi.js';
import { Card, Button, FormField, TextInput, Badge, StarRating } from '../components/ui/index.js';
import { useUIStore } from '../store/uiStore.js';
import { useRealtimeSync } from '../hooks/useRealtimeSync.js';

/**
 * Official Railway Catering Vendor & Base Kitchen Packaging Portal
 * Path: /vendor and /admin/batches
 *
 * Allows IRCTC catering licensees & base kitchens to:
 * 1. Register meal preparation batches for scheduled trains
 * 2. Generate tamper-evident QR packaging tokens
 * 3. Print sticker sheets with IRCTC QA seal
 * 4. View live passenger quality feedback & statutory penalty notices served to their service
 */
export function VendorPortalPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Catering Vendor Packaging Portal — RailFood Audit';
  }, []);

  useRealtimeSync();
  const { kitchens, vendors, batches, refetch: refetchMetadata } = useMetadataQuery();
  const { data: complaints = [] } = useComplaintsQuery({}, { refetchInterval: 3000 });

  const [vendorId, setVendorId] = useState('ven-001');
  const [kitchenId, setKitchenId] = useState('kit-101');
  const [itemType, setItemType] = useState('Standard Veg Thali');
  const [trainNumber, setTrainNumber] = useState('12424');
  const [quantity, setQuantity] = useState(6);

  const [activeBatch, setActiveBatch] = useState(null);
  const [generatedTokens, setGeneratedTokens] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formError, setFormError] = useState('');

  const selectedVendor = vendors.find((v) => v.id === vendorId) || vendors[0];
  const selectedKitchen = kitchens.find((k) => k.id === kitchenId) || kitchens[0];

  // Filter real complaints filed by passengers for this specific vendor
  const vendorComplaints = complaints.filter(
    (c) => c.vendorId === vendorId || c.vendorId === selectedVendor?.id
  );

  const handleGenerate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!trainNumber.trim()) {
      setFormError('Train number is required (e.g. 12424)');
      return;
    }

    if (!itemType.trim()) {
      setFormError('Meal item type is required (e.g. Standard Veg Thali)');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await metadataApi.createBatchWithTokens({
        kitchenId,
        vendorId,
        trainNumber: trainNumber.trim(),
        itemType: itemType.trim(),
        quantity: Number(quantity) || 6
      });

      setActiveBatch(result.batch);
      setGeneratedTokens(result.tokens);

      if (refetchMetadata) {
        refetchMetadata();
      }

      useUIStore.getState().showToast({
        type: 'success',
        title: 'Packaging QR Batch Activated',
        message: `Successfully generated ${result.tokens.length} verified QR stickers for Train ${trainNumber}.`,
        meta: `${itemType} • Active in database for camera scanning`
      });
    } catch {
      setFormError('Failed to generate batch tokens. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToken = (tok) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(tok);
      useUIStore.getState().showToast({
        type: 'info',
        title: 'Token Copied',
        message: `Token "${tok}" copied to clipboard.`
      });
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-900 antialiased">
      {/* Top Navigation */}
      <header className="bg-railway-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            <span className="text-2xl group-hover:scale-105 transition-transform">🍱</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight">
                  RailFood Audit
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Vendor Portal
                </span>
              </div>
              <p className="text-[10px] text-railway-300">Catering Licensee & Base Kitchen Packaging Network</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs">
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
            <Link to="/" className="text-railway-200 hover:text-white px-2 py-1">
              Home
            </Link>
            <Link to="/track" className="text-railway-200 hover:text-white px-2 py-1">
              Tracker
            </Link>
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg bg-railway-700 text-white font-semibold hover:bg-railway-600 transition-colors"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Official IRCTC Catering Compliance Interface
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Base Kitchen Batch Packaging & QR Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Issue official tamper-evident QR code stickers for meal packages loaded onto passenger trains.
              Each sticker is securely linked to the train number, licensee, and cooking batch in the central audit ledger.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/scan"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
            >
              <span>📷</span>
              <span>Test Passenger Scanner</span>
            </Link>
          </div>
        </div>

        {/* Generator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Card */}
          <Card className="lg:col-span-5 p-6 border-slate-200 shadow-sm bg-white">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <span className="text-xl">🏷️</span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Issue New Packaging Batch</h2>
                <p className="text-[11px] text-slate-500">Configure parameters for train pantry loading</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold">
                  {formError}
                </div>
              )}

              <FormField label="Catering Licensee (Vendor)" required>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white min-h-[44px] focus:outline-none focus:ring-2 focus:ring-railway-500"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Lic: {v.licenseNo})
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Preparation Base Kitchen" required>
                <select
                  value={kitchenId}
                  onChange={(e) => setKitchenId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white min-h-[44px] focus:outline-none focus:ring-2 focus:ring-railway-500"
                >
                  {kitchens.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.location} ({k.zone})
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Train Number (5 Digits)" required>
                  <TextInput
                    value={trainNumber}
                    onChange={(e) => setTrainNumber(e.target.value)}
                    placeholder="e.g. 12424"
                    maxLength={5}
                    className="min-h-[44px] font-mono text-sm font-bold"
                  />
                </FormField>

                <FormField label="Number of QR Stickers" required>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white min-h-[44px] font-semibold focus:outline-none focus:ring-2 focus:ring-railway-500"
                  >
                    <option value={3}>3 Stickers (Quick Test)</option>
                    <option value={6}>6 Stickers (1 Coach Bay)</option>
                    <option value={12}>12 Stickers (Coach Sheet)</option>
                    <option value={24}>24 Stickers (Full Batch)</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Meal Item Type" required>
                <TextInput
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  placeholder="e.g. Standard Veg Thali"
                  className="min-h-[44px]"
                />
              </FormField>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Selected Caterer:</span>
                  <strong className="text-slate-800">{selectedVendor?.name || 'Express Caterers'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Base Kitchen:</span>
                  <strong className="text-slate-800">{selectedKitchen?.location || 'New Delhi'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Expiry Window:</span>
                  <strong className="text-emerald-700">12 Hours from Packaging</strong>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isGenerating}
                className="w-full min-h-[48px] font-bold cursor-pointer text-sm shadow-md"
              >
                {isGenerating ? 'Activating Batch Tokens...' : 'Generate & Activate Packaging QR Stickers →'}
              </Button>
            </form>
          </Card>

          {/* QR Stickers Output Card */}
          <Card className="lg:col-span-7 p-6 border-slate-200 shadow-sm bg-white">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Printable Official Packaging QR Stickers ({generatedTokens.length})
                </h2>
                <p className="text-[11px] text-slate-500">
                  {activeBatch ? `Batch ID: ${activeBatch.id} • Train ${activeBatch.trainNumber}` : 'Waiting for batch creation...'}
                </p>
              </div>

              {generatedTokens.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="min-h-[36px] cursor-pointer flex items-center gap-1.5 font-bold"
                >
                  <span>🖨️</span>
                  <span>Print Sticker Sheet</span>
                </Button>
              )}
            </div>

            {generatedTokens.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 space-y-3">
                <span className="text-4xl block">📦</span>
                <p className="font-semibold text-sm text-slate-700">No batch generated yet</p>
                <p className="text-xs max-w-sm mx-auto text-slate-500">
                  Configure the catering parameters on the left and click "Generate & Activate Packaging QR Stickers".
                  Each sticker generated will be immediately live and ready for phone camera scanning.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✅</span>
                    <span>
                      <strong>{generatedTokens.length} Live QR Stickers</strong> ready. Click any sticker below to test scan, or point your phone camera at it!
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto p-1">
                  {generatedTokens.map((tok, idx) => {
                    const scanUrl = `${window.location.origin}/f/${tok}`;
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:border-railway-500 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group relative"
                      >
                        {/* Sticker Header Badge */}
                        <div className="w-full flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-100 pb-1">
                          <span className="font-bold text-emerald-700">IRCTC QA</span>
                          <span className="font-mono text-slate-400">#{idx + 1}</span>
                        </div>

                        {/* High Res QR Code */}
                        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs group-hover:scale-105 transition-transform">
                          <QRCodeSVG
                            value={scanUrl}
                            size={96}
                            level="M"
                            includeMargin={false}
                          />
                        </div>

                        {/* Label Information */}
                        <div className="w-full text-center space-y-0.5">
                          <div className="font-mono text-xs font-black text-railway-900 tracking-wider">
                            {tok}
                          </div>
                          <div className="text-[11px] font-bold text-slate-800 truncate">
                            {itemType}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            Train {trainNumber}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full pt-2 border-t border-slate-100 flex items-center gap-1.5">
                          <Link
                            to={`/f/${tok}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-h-[30px] px-2 py-1 rounded bg-railway-800 hover:bg-railway-700 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            title="Test open passenger scan form"
                          >
                            <span>Test Scan ↗</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleCopyToken(tok)}
                            className="min-h-[30px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                            title="Copy Token to clipboard"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Live Passenger Feedback & Quality Alerts for This Vendor */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h3 className="text-sm font-bold text-slate-900">
                  Live Passenger Grievance Alerts & Feedback for {selectedVendor?.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time grievances filed by train passengers via meal packaging QR scans
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Total Complaints: {vendorComplaints.length}
              </span>
            </div>
          </div>

          {vendorComplaints.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 space-y-1">
              <span className="text-3xl block">🛡️</span>
              <p className="font-bold text-slate-700">No grievances filed against your catering runs</p>
              <p className="text-slate-500">Your meal packages are currently 100% compliant with FSSAI & IRCTC hygiene standards.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendorComplaints.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-red-200 bg-red-50/30 hover:bg-white transition-all space-y-2.5 text-xs shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800">{c.referenceNo}</span>
                    <Badge variant={c.severity}>{c.severity.toUpperCase()} PRIORITY</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <StarRating rating={c.rating} size="sm" />
                    <span className="font-bold text-slate-800 capitalize">
                      {c.category?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    "{c.comment}"
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                    <div>Seat/Coach: <strong>{c.seat || 'Coach Berth'}</strong></div>
                    <div>Status: <strong className="capitalize text-emerald-800">{c.status?.replace(/_/g, ' ')}</strong></div>
                    <div>Logged: {new Date(c.createdAt).toLocaleString()}</div>
                    <Link
                      to={`/track/${c.referenceNo}`}
                      target="_blank"
                      className="text-railway-700 font-bold hover:underline"
                    >
                      View Live Tracker ↗
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Real Batches Issued Today */}
        {batches.length > 0 && (
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Batches Issued by Your Base Kitchen Today</h3>
                <p className="text-xs text-slate-500">
                  Active authorized packaging batches registered for train pantry loading
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {batches.length} Active Batches
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {batches.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-railway-400 transition-all space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-500">{b.id}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                  <strong className="text-xs font-bold text-slate-900 block truncate">{b.itemType}</strong>
                  <div className="text-[11px] text-slate-600">Train: <strong className="text-slate-800">{b.trainNumber}</strong></div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        Indian Railways Catering & Tourism Corporation (IRCTC) • Vendor Packaging & Food Safety Portal
      </footer>
    </div>
  );
}

export default VendorPortalPage;
