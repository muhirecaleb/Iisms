/**
 * Seed all module permissions for all roles.
 * Run: node seed-permissions.js
 */
const db = require('./src/config/database');

const MODULES = [
  'dashboard',
  'students',
  'academic',
  'learning',
  'library',
  'staff',
  'finance',
  'inventory',
  'documents',
  'qa',
  'welfare',
  'tracer',
  'volunteers',
  'partnerships',
  'projects',
  'tasks',
];

async function seed() {
  const [roles] = await db.query('SELECT role_id, role_name FROM roles ORDER BY role_id');

  for (const role of roles) {
    // Administrator gets ALL permissions
    // Others get view-only for a subset
    const isAdmin = role.role_name === 'Administrator';

    for (const mod of MODULES) {
      const [existing] = await db.query(
        'SELECT permission_id FROM role_permissions WHERE role_id = ? AND module_key = ?',
        [role.role_id, mod]
      );
      if (existing.length > 0) continue;

      const isFullAccess = isAdmin || ['students', 'staff'].includes(mod);
      const canView = 1;
      const canCreate = isFullAccess ? 1 : 0;
      const canEdit = isFullAccess ? 1 : 0;
      const canDelete = isFullAccess ? 1 : 0;

      await db.query(
        `INSERT INTO role_permissions (role_id, module_key, can_view, can_create, can_edit, can_delete)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [role.role_id, mod, canView, canCreate, canEdit, canDelete]
      );

      console.log(`  ✓ ${role.role_name} → ${mod}`);
    }
  }

  console.log('\n✅ Permissions seeded!');
  console.log('⚠️  You need to LOG OUT and LOG IN again to get a new JWT with these permissions.\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
