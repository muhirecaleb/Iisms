/**
 * Generate admission number: INT-YYYY-NNN
 */
function generateAdmissionNo(year, sequence) {
  const yearShort = String(year).slice(-2);
  return `INT-${yearShort}-${String(sequence).padStart(3, '0')}`;
}

/**
 * Generate staff number: STF-YYYY-NNN
 */
function generateStaffNo(year, sequence) {
  const yearShort = String(year).slice(-2);
  return `STF-${yearShort}-${String(sequence).padStart(3, '0')}`;
}

/**
 * Format currency amount (RWF)
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Build pagination metadata
 */
function paginate(page = 1, limit = 20, total) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  return {
    page: p,
    limit: l,
    total,
    totalPages: Math.ceil(total / l),
  };
}

/**
 * Mask email for display (e.g., "adm***@iisms.rw")
 */
function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  return `${local.slice(0, 3)}***@${domain}`;
}

/**
 * Clean object by removing undefined/null values
 */
function cleanObject(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

module.exports = {
  generateAdmissionNo,
  generateStaffNo,
  formatCurrency,
  paginate,
  maskEmail,
  cleanObject,
};
