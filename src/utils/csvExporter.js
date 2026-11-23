/**
 * Exports an array of complaint objects as a downloadable CSV file
 *
 * @param {Array<Object>} complaints 
 * @param {string} filename 
 */
export function exportComplaintsToCSV(complaints = [], filename = 'railway-food-quality-audit.csv') {
  if (!complaints || complaints.length === 0) {
    alert('No complaint data available to export.');
    return;
  }

  const headers = [
    'Reference No',
    'Token',
    'Category',
    'Rating',
    'Severity',
    'Status',
    'PNR',
    'Seat',
    'Created At',
    'Comment'
  ];

  const rows = complaints.map((c) => [
    `"${c.referenceNo || ''}"`,
    `"${c.token || ''}"`,
    `"${c.category || ''}"`,
    c.rating || 0,
    `"${c.severity || ''}"`,
    `"${c.status || ''}"`,
    `"${c.pnr || ''}"`,
    `"${c.seat || ''}"`,
    `"${c.createdAt || ''}"`,
    `"${(c.comment || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
