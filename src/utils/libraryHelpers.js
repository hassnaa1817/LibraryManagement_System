export const MAX_BORROW_LIMIT = 2;
export const LOAN_DURATION_DAYS = 14;
export const DAILY_FINE_RATE = 1.5; // $1.50 per overdue day

/**
 * Returns an ISO date string (YYYY-MM-DD) shifted by `offsetDays` from today.
 */
export function getRelativeISODate(offsetDays = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

/**
 * Adds `days` to a YYYY-MM-DD date string and returns a new YYYY-MM-DD string.
 */
export function addDaysToISODate(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0);
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formats a YYYY-MM-DD string into a clean academic date like "Nov 26, 2026".
 */
export function formatDate(isoDate) {
  if (!isoDate) return '—';
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Computes signed day difference: (target - reference) in whole days.
 * Positive means target is in the future; negative means target is in the past.
 */
export function getDayDifference(targetIso, referenceIso = getRelativeISODate(0)) {
  const [ty, tm, td] = targetIso.split('-').map(Number);
  const [ry, rm, rd] = referenceIso.split('-').map(Number);
  const target = Date.UTC(ty, tm - 1, td);
  const reference = Date.UTC(ry, rm - 1, rd);
  return Math.round((target - reference) / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates due-date status and fine breakdown for a borrowing record.
 */
export function evaluateLoanStatus(record, checkDateIso = getRelativeISODate(0)) {
  if (record.returnDate) {
    const daysLate = Math.max(0, -getDayDifference(record.dueDate, record.returnDate));
    const fine = Number((daysLate * DAILY_FINE_RATE).toFixed(2));
    return {
      status: 'Returned',
      isOverdue: daysLate > 0,
      daysOverdue: daysLate,
      daysRemaining: 0,
      fineAmount: record.finePaid ?? fine,
      label: daysLate > 0 ? `Returned ${daysLate}d late` : 'Returned on time',
    };
  }

  const diff = getDayDifference(record.dueDate, checkDateIso);
  if (diff < 0) {
    const daysOverdue = Math.abs(diff);
    const fineAmount = Number((daysOverdue * DAILY_FINE_RATE).toFixed(2));
    return {
      status: 'Overdue',
      isOverdue: true,
      daysOverdue,
      daysRemaining: 0,
      fineAmount,
      label: `${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} overdue`,
    };
  }

  if (diff === 0) {
    return {
      status: 'Active',
      isOverdue: false,
      daysOverdue: 0,
      daysRemaining: 0,
      fineAmount: 0,
      label: 'Due today',
    };
  }

  return {
    status: 'Active',
    isOverdue: false,
    daysOverdue: 0,
    daysRemaining: diff,
    fineAmount: 0,
    label: `${diff} ${diff === 1 ? 'day' : 'days'} left`,
  };
}

export function formatCurrency(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

export function generateReceiptNumber(recordId) {
  const clean = String(recordId || 'REC').replace(/[^A-Z0-9]/gi, '').slice(-4).toUpperCase();
  return `AUR-${new Date().getFullYear()}-${clean.padStart(4, '0')}`;
}

export function getInitials(name) {
  if (!name) return 'LM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Triggers a clean browser CSV download for admin reports.
 */
export function exportToCSV(filename, headers, rows) {
  const escapeCell = (val) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
