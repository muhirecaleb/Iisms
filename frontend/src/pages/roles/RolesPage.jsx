import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Crown, BookOpen, ClipboardList, GraduationCap, ShieldAlert,
  DollarSign, CreditCard, BarChart3, Users, BookMarked,
  Eye, Plus, Pencil, Trash2, Check, X, ChevronRight,
} from 'lucide-react';
import {
  listRoles,
  getRolePermissions,
  updateRolePermissions,
  listModules,
} from '../../services/roles.service';
import toast from 'react-hot-toast';

// ─── Role config ────────────────────────────────────────────
const roleConfig = {
  Administrator: { desc: 'Full system access — all modules, all CRUD, system settings, user management', color: '#DC2626', Icon: Crown },
  Director: { desc: 'Strategic oversight — KPIs, reports, all modules', color: '#7C3AED', Icon: Shield },
  DOS: { desc: 'Academic program management, student oversight, timetabling', color: '#2563EB', Icon: BookOpen },
  Registrar: { desc: 'Student registration, records, promotions, exports', color: '#059669', Icon: ClipboardList },
  Teacher: { desc: 'Basic student view, mark entry, personal tasks', color: '#D97706', Icon: GraduationCap },
  'Discipline Officer': { desc: 'Student welfare, disciplinary records, counselling', color: '#EA580C', Icon: ShieldAlert },
  Accountant: { desc: 'Full finance: fee structure, invoices, sponsorships, payments, reports', color: '#0891B2', Icon: DollarSign },
  Cashier: { desc: 'Payment recording only — search students, receive payments', color: '#65A30D', Icon: CreditCard },
  'Finance Manager': { desc: 'Read-only finance reports and dashboard (HQ oversight)', color: '#9333EA', Icon: BarChart3 },
  'HR Officer': { desc: 'Staff management: registration, editing, copy-forward', color: '#E11D48', Icon: Users },
  Librarian: { desc: 'Book catalog, borrow/return management', color: '#4F46E5', Icon: BookMarked },
};

const permConfig = {
  canView: { label: 'View', Icon: Eye, color: '#2563EB' },
  canCreate: { label: 'Create', Icon: Plus, color: '#059669' },
  canEdit: { label: 'Edit', Icon: Pencil, color: '#D97706' },
  canDelete: { label: 'Delete', Icon: Trash2, color: '#DC2626' },
};

// ─── Modal ──────────────────────────────────────────────────
function Modal({ title, children, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: 900, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--color-border-light)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)', padding: 4, display: 'flex', minHeight: 'auto' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Permission Editor ──────────────────────────────────────
function PermissionEditor({ role, modules, onSave, onClose, saving }) {
  const [perms, setPerms] = useState({});

  useEffect(() => {
    getRolePermissions(role.role_id).then((data) => {
      const map = {};
      data.forEach((p) => {
        map[p.module_key] = {
          canView: !!p.can_view,
          canCreate: !!p.can_create,
          canEdit: !!p.can_edit,
          canDelete: !!p.can_delete,
        };
      });
      setPerms(map);
    }).catch(() => {});
  }, [role.role_id]);

  const toggle = (moduleKey, operation) => {
    setPerms((prev) => ({
      ...prev,
      [moduleKey]: { ...prev[moduleKey], [operation]: !(prev[moduleKey]?.[operation]) },
    }));
  };

  const toggleAll = (moduleKey) => {
    const current = perms[moduleKey] || {};
    const allOn = current.canView && current.canCreate && current.canEdit && current.canDelete;
    setPerms((prev) => ({
      ...prev,
      [moduleKey]: { canView: !allOn, canCreate: !allOn, canEdit: !allOn, canDelete: !allOn },
    }));
  };

  const rc = roleConfig[role.role_name] || { color: '#6B7280', Icon: Shield, desc: 'Custom role' };
  const RoleIcon = rc.Icon;

  return (
    <Modal title={`Edit Permissions — ${role.role_name}`} onClose={onClose}>
      {/* Role header */}
      <div style={{ marginBottom: 20, padding: '14px 18px', background: `${rc.color}08`, border: `1px solid ${rc.color}20`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${rc.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RoleIcon size={22} color={rc.color} />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-heading)', fontSize: '0.92rem' }}>{role.role_name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>{rc.desc}</div>
        </div>
      </div>

      {/* Permission table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border-light)' }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: '0.78rem', color: 'var(--color-text-light)' }}>Module</th>
            {Object.entries(permConfig).map(([key, cfg]) => {
              const PIcon = cfg.Icon;
              return (
                <th key={key} style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <PIcon size={13} /> {cfg.label}
                  </div>
                </th>
              );
            })}
            <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, fontSize: '0.78rem', color: 'var(--color-text-light)' }}>All</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((m) => {
            const mp = perms[m.module_key] || {};
            const allOn = mp.canView && mp.canCreate && mp.canEdit && mp.canDelete;
            return (
              <tr key={m.module_key} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--color-text-heading)' }}>{m.label}</td>
                {Object.entries(permConfig).map(([key, cfg]) => {
                  const isOn = mp[key];
                  return (
                    <td key={key} style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button
                        onClick={() => toggle(m.module_key, key)}
                        style={{
                          width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          background: isOn ? `${cfg.color}14` : 'var(--color-bg)',
                          color: isOn ? cfg.color : 'var(--color-text-light)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {isOn ? <Check size={16} strokeWidth={2.5} /> : <X size={14} strokeWidth={2} />}
                      </button>
                    </td>
                  );
                })}
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                  <button
                    onClick={() => toggleAll(m.module_key)}
                    style={{
                      width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: allOn ? '#2563EB14' : 'var(--color-bg)',
                      color: allOn ? '#2563EB' : 'var(--color-text-light)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {allOn ? <Check size={16} strokeWidth={2.5} /> : <X size={14} strokeWidth={2} />}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border-light)' }}>
        <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
        <button onClick={() => onSave(role.role_id, perms)} disabled={saving} style={{ ...submitBtnStyle, opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          {saving ? 'Saving...' : <><Check size={16} /> Save Permissions</>}
        </button>
      </div>
    </Modal>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesData, modulesData] = await Promise.all([
        listRoles(),
        listModules().catch(() => []),
      ]);
      setRoles(rolesData || []);
      setModules(modulesData || []);
    } catch (err) {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (roleId, permissions) => {
    setSaving(true);
    try {
      await updateRolePermissions(roleId, permissions);
      toast.success('Permissions updated successfully');
      setEditing(null);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Shield size={24} color="var(--color-primary)" />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>Roles & Permissions</h1>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Manage user roles and their module access permissions</p>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-light)' }}>Loading roles...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {roles.map((role) => {
            const rc = roleConfig[role.role_name] || { desc: 'Custom role', color: '#6B7280', Icon: Shield };
            const RoleIcon = rc.Icon;
            return (
              <div key={role.role_id}
                style={{
                  background: '#fff', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-light)',
                  overflow: 'hidden', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Color stripe */}
                <div style={{ height: 4, background: rc.color }} />

                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: `${rc.color}10`, border: `1px solid ${rc.color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <RoleIcon size={24} color={rc.color} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{role.role_name}</h3>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>Role ID: {role.role_id}</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.5, minHeight: 40 }}>{rc.desc}</p>

                  <button
                    onClick={() => setEditing(role)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '9px 16px', fontSize: '0.82rem', fontWeight: 600,
                      color: rc.color, background: `${rc.color}08`,
                      border: `1px solid ${rc.color}20`, borderRadius: 8,
                      cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${rc.color}14`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = `${rc.color}08`; }}
                  >
                    <Pencil size={14} /> Edit Permissions <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <PermissionEditor role={editing} modules={modules} onSave={handleSave} onClose={() => setEditing(null)} saving={saving} />
      )}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const cancelBtnStyle = { padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' };
const submitBtnStyle = { padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' };
