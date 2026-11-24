import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useMetadataQuery } from '../api/index.js';
import { metadataApi } from '../api/complaintsApi.js';
import { Card, Button, FormField, TextInput } from '../components/ui/index.js';
import { adminBatchSchema } from '../utils/validationSchemas.js';
import { useUIStore } from '../store/uiStore.js';

/**
 * Admin Batches Page (/admin/batches)
 * Protected route accessible ONLY to users with role='admin'
 */
export function AdminBatchesPage() {
  useEffect(() => {
    document.title = 'Admin Batch Portal — RailFood Audit';
  }, []);

  const { kitchens, vendors, refetch: refetchMetadata } = useMetadataQuery();

  const [kitchenId, setKitchenId] = useState('kit-101');
  const [vendorId, setVendorId] = useState('ven-001');
  const [itemType, setItemType] = useState('Standard Veg Thali');
  const [trainNumber, setTrainNumber] = useState('12424');
  const [quantity, setQuantity] = useState(6);

  const [generatedTokens, setGeneratedTokens] = useState([]);
  const [formError, setFormError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setFormError('');

    const validation = adminBatchSchema.safeParse({
      kitchenId,
      itemType,
      trainNumber,
      quantity: Number(quantity)
    });

    if (!validation.success) {
      const msg = validation.error.issues[0]?.message || 'Validation failed';
      setFormError(msg);
      useUIStore.getState().showToast({
        type: 'error',
        title: 'Validation Error',
        message: msg
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await metadataApi.createBatchWithTokens({
        kitchenId,
        vendorId,
        trainNumber: trainNumber.trim(),
        itemType: itemType.trim(),
        quantity: Number(quantity)
      });

      setGeneratedTokens(result.tokens);
      if (refetchMetadata) refetchMetadata();

      useUIStore.getState().showToast({
        type: 'success',
        title: 'Packaging Tokens Created & Saved',
        message: `Generated and persisted ${result.tokens.length} verified packaging tokens for Train ${trainNumber}.`,
        meta: `${itemType} • Ready for phone camera scanning`
      });
    } catch {
      setFormError('Failed to create batch tokens.');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Admin Batch Operations & QR Sticker Generation</h2>
          <p className="text-xs text-slate-500">
            Issue authorized packaging tokens for train catering runs. Saved to ledger for camera scanning.
          </p>
        </div>
        <Link
          to="/vendor"
          target="_blank"
          className="text-xs font-bold text-railway-700 hover:text-railway-900 bg-railway-50 hover:bg-railway-100 px-3 py-1.5 rounded-lg border border-railway-200 flex items-center gap-1.5 transition-colors"
        >
          <span>🍱</span>
          <span>Open Full Vendor Portal ↗</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-5 p-5 border-slate-200 bg-white">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Create New Meal Batch</h3>
          <form onSubmit={handleGenerate} className="space-y-3.5">
            {formError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 font-semibold">
                {formError}
              </p>
            )}

            <FormField label="Base Kitchen" required>
              <select
                value={kitchenId}
                onChange={(e) => setKitchenId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white min-h-[44px]"
              >
                {kitchens.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.location} ({k.zone})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Catering Vendor" required>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white min-h-[44px]"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.licenseNo})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Meal Type" required>
              <TextInput
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                placeholder="e.g. Standard Veg Thali"
                className="min-h-[44px]"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Train Number" required>
                <TextInput
                  maxLength={5}
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  placeholder="e.g. 12424"
                  className="min-h-[44px]"
                />
              </FormField>

              <FormField label="Stickers Count" required>
                <TextInput
                  type="number"
                  min={1}
                  max={200}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="min-h-[44px]"
                />
              </FormField>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isGenerating}
              className="w-full min-h-[44px] font-bold cursor-pointer"
            >
              {isGenerating ? 'Generating...' : 'Generate Printable Token Sheet'}
            </Button>
          </form>
        </Card>

        <Card className="md:col-span-7 p-5 border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="text-sm font-bold text-slate-800">
              Generated Packaging Tokens ({generatedTokens.length})
            </h3>
            {generatedTokens.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="min-h-[36px] cursor-pointer"
              >
                🖨️ Print Sticker Sheet
              </Button>
            )}
          </div>

          {generatedTokens.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500">
              Fill the batch parameters on the left and click generate to produce authorized packaging tokens.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-3 print:max-h-none">
              {generatedTokens.map((tok, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-slate-200 rounded-lg text-center bg-white hover:bg-railway-50 hover:border-railway-300 transition-colors shadow-xs flex flex-col items-center gap-2"
                >
                  <QRCodeSVG
                    value={typeof window !== 'undefined' ? `${window.location.origin}/f/${tok}` : `/f/${tok}`}
                    size={72}
                    level="M"
                    className="p-1 bg-white rounded border border-slate-100"
                  />
                  <div className="text-center w-full">
                    <span className="font-mono text-xs font-bold text-railway-800 block truncate">{tok}</span>
                    <span className="text-[10px] text-slate-500 block">Train {trainNumber}</span>
                  </div>
                  <div className="flex items-center gap-1 w-full pt-1">
                    <Link
                      to={`/f/${tok}`}
                      target="_blank"
                      className="flex-1 text-[10px] bg-railway-800 hover:bg-railway-700 text-white font-bold py-1 px-1 rounded text-center transition-colors"
                    >
                      Test Scan ↗
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleCopyToken(tok)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 px-1.5 rounded cursor-pointer"
                      title="Copy Token"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AdminBatchesPage;
