import React, { useState } from 'react';
import { useMetadataQuery } from '../api/index.js';
import { Card, Button, FormField, TextInput } from '../components/ui/index.js';
import { adminBatchSchema } from '../utils/validationSchemas.js';
import { generateRandomToken } from '../utils/complaintUtils.js';

/**
 * Admin Batches Page (/admin/batches)
 * Protected route accessible ONLY to users with role='admin'
 */
export function AdminBatchesPage() {
  const { kitchens, batches } = useMetadataQuery();

  const [kitchenId, setKitchenId] = useState('kit-101');
  const [itemType, setItemType] = useState('Standard Veg Thali');
  const [trainNumber, setTrainNumber] = useState('12424');
  const [quantity, setQuantity] = useState(50);

  const [generatedTokens, setGeneratedTokens] = useState([]);
  const [formError, setFormError] = useState('');

  const handleGenerate = (e) => {
    e.preventDefault();
    setFormError('');

    const validation = adminBatchSchema.safeParse({
      kitchenId,
      itemType,
      trainNumber,
      quantity: Number(quantity)
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || 'Validation failed');
      return;
    }

    // Generate bulk QR tokens
    const tokens = [];
    for (let i = 0; i < Number(quantity); i++) {
      tokens.push(generateRandomToken(10));
    }
    setGeneratedTokens(tokens);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Admin Batch Operations & QR Sticker Generation</h2>
        <p className="text-xs text-slate-500">
          Issue authorized packaging tokens for train catering runs. Protected by Admin Role Guard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-5 p-5 border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Create New Meal Batch</h3>
          <form onSubmit={handleGenerate} className="space-y-3.5">
            {formError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 font-semibold">
                {formError}
              </p>
            )}

            <FormField label="Base Kitchen" required>
              <select
                value={kitchenId}
                onChange={(e) => setKitchenId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                {kitchens.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.location} ({k.zone})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Meal Type" required>
              <TextInput
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                placeholder="e.g. Standard Veg Thali"
              />
            </FormField>

            <FormField label="Train Number (5 digits)" required>
              <TextInput
                maxLength={5}
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                placeholder="e.g. 12424"
              />
            </FormField>

            <FormField label="Quantity (Stickers to print)" required>
              <TextInput
                type="number"
                min={10}
                max={2000}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </FormField>

            <Button type="submit" variant="primary" size="md" className="w-full font-bold">
              Generate Printable Token Sheet
            </Button>
          </form>
        </Card>

        <Card className="md:col-span-7 p-5 border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">
              Generated Packaging Tokens ({generatedTokens.length})
            </h3>
            {generatedTokens.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                🖨️ Print Sticker Sheet
              </Button>
            )}
          </div>

          {generatedTokens.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500">
              Fill the batch parameters on the left and click generate to produce authorized packaging tokens.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
              {generatedTokens.map((tok, idx) => (
                <div key={idx} className="p-2 border border-slate-200 rounded text-center bg-white shadow-2xs">
                  <span className="font-mono text-xs font-bold text-railway-800 block">{tok}</span>
                  <span className="text-[10px] text-slate-400">Train: {trainNumber}</span>
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
