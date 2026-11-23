import React, { useMemo, useEffect } from 'react';
import { useComplaintsQuery, useMetadataQuery } from '../api/index.js';
import { getVendorStats } from '../utils/complaintUtils.js';
import { Card, StarRating, Badge } from '../components/ui/index.js';

export function VendorsPage() {
  useEffect(() => {
    document.title = 'Vendor Scorecards — RailFood Audit';
  }, []);

  const { data: complaints = [] } = useComplaintsQuery();
  const { vendors = [], kitchens = [] } = useMetadataQuery();

  const vendorStats = useMemo(() => {
    return vendors.map((v) => {
      const stats = getVendorStats(complaints, v.id);
      const vendorKitchens = kitchens.filter((k) => k.vendorId === v.id);
      return {
        ...v,
        stats,
        kitchenCount: vendorKitchens.length
      };
    });
  }, [vendors, kitchens, complaints]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Catering Vendor Audit Scorecards</h2>
        <p className="text-xs text-slate-500">
          Real-time vendor compliance indices aggregated across zonal base kitchens and customer audit submissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vendorStats.map((vendor) => (
          <Card key={vendor.id} className="p-5 space-y-4 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{vendor.name}</h3>
                <span className="text-[11px] font-mono text-slate-500">License: {vendor.licenseNo}</span>
              </div>
              {vendor.stats.repeatViolations ? (
                <Badge variant="high">Repeat Violator</Badge>
              ) : (
                <Badge variant="low">Compliant</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-500 block">Total Complaints</span>
                <strong className="text-sm text-slate-800 font-bold">{vendor.stats.totalComplaints}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">High Severity</span>
                <strong className={`text-sm font-bold ${vendor.stats.highSeverityCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                  {vendor.stats.highSeverityCount}
                </strong>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block">Avg Rating</span>
                <StarRating rating={vendor.stats.avgRating} size="sm" />
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block">Base Kitchens</span>
                <strong className="text-sm text-slate-800 font-bold">{vendor.kitchenCount}</strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
              <a
                href={`tel:${vendor.contact.replace(/\s+/g, '')}`}
                className="text-railway-700 hover:text-railway-900 font-medium hover:underline flex items-center gap-1 min-h-[32px]"
                title={`Call ${vendor.name}`}
              >
                <span>📞</span>
                <span>{vendor.contact}</span>
              </a>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {vendor.stats.resolvedCount} Resolved
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default VendorsPage;
