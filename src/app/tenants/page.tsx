/**
 * @file page.tsx (Tenants)
 * @brief Tenant Management CRUD page with lease tracking and contact details.
 *
 * Displays all tenant records in a data table with Add / Edit / Delete
 * operations. Each tenant is linked to a property and has full lease
 * details (start/end dates, rent, deposit, active status).
 *
 * Used by: app router — mounted at /tenants
 * Related: EVO-001 Sprint 5, types.ts (Tenant model)
 */
'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Users, Mail, Phone } from 'lucide-react'

/* ─── Constants ─── */

/** Cents-to-dollars divisor for display formatting. */
const CENTS_PER_DOLLAR = 100

/** Available property names for the tenant form selector. */
const PROPERTY_NAMES = [
    'Riverside Apartments', 'Oak Valley Condos', 'Sunset Office Park',
    'Harbor View Townhomes', 'Pine Ridge Duplexes',
] as const

/* ─── Interfaces ─── */

/** Local-state shape for a tenant record (mirrors Firestore Tenant). */
interface TenantData {
    id: string
    propertyName: string
    firstName: string
    lastName: string
    email: string
    phone: string
    lease: {
        startDate: string
        endDate: string
        /** Monthly rent in cents (e.g. $1,850.00 = 185000) */
        rentAmount: number
        /** Security deposit in cents */
        securityDeposit: number
        /** False when lease has expired or been terminated */
        isActive: boolean
    }
}

/** Props for the TenantModal component. */
interface TenantModalProps {
    /** Existing tenant to edit, or undefined for a new tenant. */
    tenant?: TenantData
    /** Callback invoked with the saved tenant data. */
    onSave: (data: TenantData) => void
    /** Callback to close the modal without saving. */
    onClose: () => void
}

/* ─── Style Maps ─── */

/** Ring + text color classes for lease status badges. */
const LEASE_STATUS_STYLES = {
    active: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    expired: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20',
} as const

/* ─── Seed Data ─── */

/** Demonstration tenant records (replaced by Firestore in production). */
const SEED_TENANTS: TenantData[] = [
    { id: '1', propertyName: 'Riverside Apartments', firstName: 'Alice', lastName: 'Johnson', email: 'alice.j@email.com', phone: '512-555-1001', lease: { startDate: '2025-06-01', endDate: '2026-05-31', rentAmount: 185000, securityDeposit: 185000, isActive: true } },
    { id: '2', propertyName: 'Riverside Apartments', firstName: 'Carlos', lastName: 'Martinez', email: 'carlos.m@email.com', phone: '512-555-1002', lease: { startDate: '2025-01-15', endDate: '2026-01-14', rentAmount: 195000, securityDeposit: 195000, isActive: true } },
    { id: '3', propertyName: 'Oak Valley Condos', firstName: 'Diana', lastName: 'Park', email: 'diana.p@email.com', phone: '303-555-2001', lease: { startDate: '2025-08-01', endDate: '2026-07-31', rentAmount: 220000, securityDeposit: 220000, isActive: true } },
    { id: '4', propertyName: 'Harbor View Townhomes', firstName: 'Ethan', lastName: 'Williams', email: 'ethan.w@email.com', phone: '619-555-4001', lease: { startDate: '2024-12-01', endDate: '2025-11-30', rentAmount: 275000, securityDeposit: 275000, isActive: false } },
    { id: '5', propertyName: 'Sunset Office Park', firstName: 'Fiona', lastName: 'Reeves', email: 'fiona.r@email.com', phone: '602-555-3001', lease: { startDate: '2025-03-01', endDate: '2028-02-28', rentAmount: 450000, securityDeposit: 900000, isActive: true } },
    { id: '6', propertyName: 'Harbor View Townhomes', firstName: 'George', lastName: 'Chen', email: 'george.c@email.com', phone: '619-555-4002', lease: { startDate: '2025-09-01', endDate: '2026-08-31', rentAmount: 260000, securityDeposit: 260000, isActive: true } },
]

/* ─── Helpers ─── */

/** Upsert a record into an array by `id`. Returns a new array. */
function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
    const index = list.findIndex((existing) => existing.id === item.id)
    if (index >= 0) {
        const updated = [...list]
        updated[index] = item
        return updated
    }
    return [...list, item]
}

/* ─── Sub-Components ─── */

/**
 * Modal form for creating or editing a tenant record.
 * Includes contact fields, property selector, and lease details.
 */
function TenantModal({ tenant, onSave, onClose }: TenantModalProps) {
    const blankTenant: TenantData = {
        id: Date.now().toString(), propertyName: PROPERTY_NAMES[0],
        firstName: '', lastName: '', email: '', phone: '',
        lease: { startDate: '', endDate: '', rentAmount: 0, securityDeposit: 0, isActive: true },
    }
    const [formData, setFormData] = useState<TenantData>(tenant ?? blankTenant)

    /** Merge partial updates into form state. */
    const updateField = (patch: Partial<TenantData>) => {
        setFormData((prev) => ({ ...prev, ...patch }))
    }

    /** Merge partial updates into the nested lease object. */
    const updateLease = (patch: Partial<TenantData['lease']>) => {
        setFormData((prev) => ({ ...prev, lease: { ...prev.lease, ...patch } }))
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"><X className="h-4 w-4" /></button>
                <h2 className="mb-6 text-xl font-semibold text-white">{tenant ? 'Edit Tenant' : 'Add Tenant'}</h2>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="space-y-4">
                    {/* Identity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">First Name</label><input value={formData.firstName} onChange={(e) => updateField({ firstName: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required /></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Last Name</label><input value={formData.lastName} onChange={(e) => updateField({ lastName: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required /></div>
                    </div>
                    {/* Contact */}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Email</label><input type="email" value={formData.email} onChange={(e) => updateField({ email: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required /></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Phone</label><input value={formData.phone} onChange={(e) => updateField({ phone: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required /></div>
                    </div>
                    {/* Property */}
                    <div><label className="mb-1 block text-sm font-medium text-zinc-400">Property</label><select value={formData.propertyName} onChange={(e) => updateField({ propertyName: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none">{PROPERTY_NAMES.map((p) => <option key={p}>{p}</option>)}</select></div>
                    {/* Lease Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Lease Start</label><input type="date" value={formData.lease.startDate} onChange={(e) => updateLease({ startDate: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" required /></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Lease End</label><input type="date" value={formData.lease.endDate} onChange={(e) => updateLease({ endDate: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" required /></div>
                    </div>
                    {/* Financials */}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Monthly Rent ($)</label><input type="number" value={formData.lease.rentAmount / CENTS_PER_DOLLAR} onChange={(e) => updateLease({ rentAmount: Math.round(Number(e.target.value) * CENTS_PER_DOLLAR) })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" required /></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Security Deposit ($)</label><input type="number" value={formData.lease.securityDeposit / CENTS_PER_DOLLAR} onChange={(e) => updateLease({ securityDeposit: Math.round(Number(e.target.value) * CENTS_PER_DOLLAR) })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" required /></div>
                    </div>
                    <div className="flex items-center gap-3"><input type="checkbox" checked={formData.lease.isActive} onChange={(e) => updateLease({ isActive: e.target.checked })} className="rounded border-zinc-700 bg-zinc-900" /><label className="text-sm text-zinc-400">Lease Active</label></div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800">Cancel</button>
                        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">{tenant ? 'Save' : 'Add Tenant'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ─── Page Component ─── */

/**
 * Tenant Management page — lists and manages tenant records with lease details.
 *
 * Features:
 * - Data table with tenant name, property, contact, rent, lease period, status
 * - Add / Edit via modal, Delete inline
 *
 * Used by: app router — /tenants
 */
export default function TenantsPage() {
    const [tenants, setTenants] = useState<TenantData[]>(SEED_TENANTS)
    const [editingTenant, setEditingTenant] = useState<TenantData | undefined>()
    const [isModalOpen, setIsModalOpen] = useState(false)

    /** Count of active leases for header subtitle. */
    const activeLeaseCount = tenants.filter((tenant) => tenant.lease.isActive).length

    /** Persist tenant (add or update) and close the modal. */
    const handleSave = (data: TenantData) => {
        setTenants((prev) => upsertById(prev, data))
        setIsModalOpen(false)
        setEditingTenant(undefined)
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Tenant Management</h2>
                    <p className="mt-1 text-zinc-400">{activeLeaseCount} active leases · {tenants.length} total tenants</p>
                </div>
                <button onClick={() => { setEditingTenant(undefined); setIsModalOpen(true) }} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-600/20 hover:bg-blue-500">
                    <Plus className="h-4 w-4" />Add Tenant
                </button>
            </div>

            {/* Data Table */}
            <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-xl">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-zinc-800/60">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Tenant</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Property</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Contact</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Rent</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Lease Period</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-zinc-800/40">
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className="group transition-colors hover:bg-zinc-800/20">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20"><Users className="h-4 w-4" /></div>
                                        <p className="font-medium text-zinc-100">{tenant.firstName} {tenant.lastName}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-zinc-400">{tenant.propertyName}</td>
                                <td className="px-6 py-4">
                                    <p className="flex items-center gap-1 text-xs text-zinc-400"><Mail className="h-3 w-3 text-zinc-600" />{tenant.email}</p>
                                    <p className="flex items-center gap-1 text-xs text-zinc-500"><Phone className="h-3 w-3 text-zinc-600" />{tenant.phone}</p>
                                </td>
                                <td className="px-6 py-4 text-center font-medium text-zinc-200">${(tenant.lease.rentAmount / CENTS_PER_DOLLAR).toLocaleString()}<span className="text-zinc-500">/mo</span></td>
                                <td className="px-6 py-4 text-center text-xs text-zinc-400">{tenant.lease.startDate} → {tenant.lease.endDate}</td>
                                <td className="px-6 py-4 text-center"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tenant.lease.isActive ? LEASE_STATUS_STYLES.active : LEASE_STATUS_STYLES.expired}`}>{tenant.lease.isActive ? 'Active' : 'Expired'}</span></td>
                                <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button onClick={() => { setEditingTenant(tenant); setIsModalOpen(true) }} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"><Pencil className="h-4 w-4" /></button>
                                    <button onClick={() => setTenants((prev) => prev.filter((x) => x.id !== tenant.id))} className="rounded-lg p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                                </div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <TenantModal
                    tenant={editingTenant}
                    onSave={handleSave}
                    onClose={() => { setIsModalOpen(false); setEditingTenant(undefined) }}
                />
            )}
        </>
    )
}
