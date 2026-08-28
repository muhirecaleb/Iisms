module.exports = {
  // --- Auth ---
  OTP_CODE_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  OTP_MAX_ATTEMPTS: 5,
  OTP_RESEND_COOLDOWN_SECONDS: 30,
  PASSWORD_MIN_LENGTH: 8,
  BCRYPT_SALT_ROUNDS: 12,

  // --- JWT ---
  JWT_ACCESS_EXPIRY_DEFAULT: '30d',
  JWT_REFRESH_EXPIRY_DEFAULT: '7d',

  // --- Pagination ---
  PAGINATION_DEFAULTS: { page: 1, limit: 20 },
  PAGINATION_MAX_LIMIT: 100,

  // --- File Uploads ---
  ALLOWED_PHOTO_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB

  // --- Student ---
  ADMISSION_NO_PREFIX: 'INT',
  STAFF_NO_PREFIX: 'STF',

  // --- Finance ---
  MAX_INSTALLMENTS_PER_INVOICE: 3,
  INVOICE_STATUSES: ['open', 'partially_paid', 'paid', 'void', 'overdue'],
  PAYMENT_METHODS: ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque', 'Other'],

  // --- Task ---
  TASK_PRIORITIES: ['low', 'normal', 'high', 'urgent'],
  TASK_STATUSES: ['pending', 'in_progress', 'completed', 'cancelled'],

  // --- Enums ---
  GENDERS: ['M', 'F'],
  STUDENT_STATUSES: ['active', 'transferred', 'graduated', 'dropped'],
  STAFF_STATUSES: ['active', 'on_leave', 'resigned', 'terminated'],
  STAFF_CATEGORIES: ['Teaching', 'Administrative', 'Support'],
  CONTRACT_TYPES: ['Permanent', 'Fixed-term', 'Probation', 'Volunteer'],
  CONTACT_RELATIONSHIPS: ['Father', 'Mother', 'Guardian', 'Sibling', 'Other'],
  MODULE_CATEGORIES: [
    'Academic Program',
    'General Administration',
    'Social Impact Program',
    'Resources Mobilisation',
    'Tasks',
    'System',
  ],
};
