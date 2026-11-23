import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useComplaintsQuery, useMetadataQuery } from '../api/index.js';
import { evaluateKitchenSafetyAlerts } from '../utils/alertEngine.js';
import { exportComplaintsToCSV } from '../utils/csvExporter.js';
import { Card, Button, Badge } from '../components/ui/index.js';

const SEVERITY_COLORS = {
  high: '#dc2626',
  medium: '#d97706',
  low: '#16a34a'
};

const PIE_COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#f59e0b', '#ef4444', '#10b981', '#64748b'];

/**
 * QualityAnalyticsPage (/dashboard/analytics)
 * Demonstrates:
 * - Recharts data visualizations (BarChart by category, PieChart by severity, Trend LineChart)
 * - Critical Kitchen Safety Alert detection (3+ hygiene complaints in 2 hours)
 * - CSV audit data export
 */
export function QualityAnalyticsPage() {
  const { data: complaints = [], isLoading } = useComplaintsQuery();
  const { kitchens = [] } = useMetadataQuery();

  // Evaluate safety alerts
  const safetyAlerts = useMemo(() => {
    return evaluateKitchenSafetyAlerts(complaints, kitchens);
  }, [complaints, kitchens]);

  // Chart Data 1: Complaints by Category
  const categoryData = useMemo(() => {
    const counts = complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([cat, count]) => ({
      name: cat.replace(/_/g, ' '),
      count
    }));
  }, [complaints]);

  // Chart Data 2: Severity Distribution
  const severityData = useMemo(() => {
    const counts = complaints.reduce((acc, c) => {
      acc[c.severity] = (acc[c.severity] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'High', value: counts.high || 0, color: SEVERITY_COLORS.high },
      { name: 'Medium', value: counts.medium || 0, color: SEVERITY_COLORS.medium },
      { name: 'Low', value: counts.low || 0, color: SEVERITY_COLORS.low }
    ];
  }, [complaints]);

  // Chart Data 3: Hourly Complaint Trend
  const trendData = useMemo(() => {
    const hourlyMap = complaints.reduce((acc, c) => {
      const hour = new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '00' });
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(hourlyMap).map(([hour, count]) => ({
      hour,
      grievances: count
    }));
  }, [complaints]);

  return (
    <div className="space-y-6">
      {/* Top Header with CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Railway Food Quality Analytics & Safety Alerts</h2>
          <p className="text-xs text-slate-500">
            Real-time sensory telemetry, category distributions, and automated IRCTC hygiene alert detection.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => exportComplaintsToCSV(complaints, `railway-audit-${Date.now()}.csv`)}
          className="font-bold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>📥</span> Export Audit Data (CSV)
        </Button>
      </div>

      {/* Critical Safety Alerts Banner */}
      {safetyAlerts.length > 0 && (
        <div className="space-y-2">
          {safetyAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-xl bg-red-50 border-2 border-red-500 text-red-950 flex items-start gap-3 shadow-md animate-in fade-in"
            >
              <span className="text-2xl" role="img" aria-label="warning">🚨</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-red-900 uppercase tracking-wide">
                    {alert.message}
                  </h4>
                  <Badge variant="high">Urgent Escalation</Badge>
                </div>
                <p className="text-xs text-red-800 mt-1">
                  Target Kitchen: <strong>{alert.kitchenName}</strong> • Safety Threshold: 3 incidents within {alert.timeWindow}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Visual Charts */}
      {isLoading ? (
        <div className="text-center p-12 text-slate-500 text-xs">Loading analytics graphs...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bar Chart: Complaints by Category */}
          <Card className="lg:col-span-7 p-5 border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Complaints by Category (Bar Chart)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Pie Chart: Severity Breakdown */}
          <Card className="lg:col-span-5 p-5 border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Severity Distribution (Pie Chart)
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                    label
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Line Chart: Grievances Over Time */}
          <Card className="lg:col-span-12 p-5 border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Grievance Influx Trend Over Time (Line Chart)
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="grievances" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default QualityAnalyticsPage;
