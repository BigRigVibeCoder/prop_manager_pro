/**
 * @file page.tsx (Vendors)
 * @brief Vendor Management CRUD page with data table, category filter, and modal form.
 *
 * Displays all vendor records in a sortable table with Add / Edit / Delete
 * operations. Uses local state with seed data (Firestore integration
 * deferred until real credentials are configured).
 *
 * Used by: app router — mounted at /vendors
 * Related: EVO-001 Sprint 5, types.ts (Vendor model)
 */
'use client'

import { useState } from 'react'
import {
    Plus, Pencil, Trash2, X, Star,
    BriefcaseBusiness, Shield, Mail,
} from 'lucide-react'
import type { VendorCategory } from '@/lib/models/types'

/* ─── Constants (GOV-003 §5.3 — no magic numbers) ─── */

/** Cents-to-dollars divisor for display formatting. */
const CENTS_PER_DOLLAR = 100

/** All valid vendor trade categories, in display order. */
const VENDOR_CATEGORIES: VendorCategory[] = [
    'plumbing', 'electrical', 'hvac', 'landscaping',
    'general', 'roofing', 'painting', 'cleaning', 'other',
]

/* ─── Interfaces (GOV-003 §8.2 — Props use interface) ─── */

/** Local-state shape for a vendor record (mirrors Firestore Vendor). */
interface VendorData {
    id: string
    companyName: string
    contactName: string
    email: string
    phone: string
    category: VendorCategory
    licenseNumber?: string
    insuranceExpiry?: string
    w9OnFile: boolean
    hourlyRate?: number
    notes?: string
    status: 'active' | 'inactive' | 'suspended'
    rating?: number
}

/** Props for the VendorModal component. */
interface VendorModalProps {
    /** Existing vendor to edit, or undefined for a new vendor. */
    vendor?: VendorData
    /** Callback invoked with the saved vendor data. */
    onSave: (data: VendorData) => void
    /** Callback to close the modal without saving. */
    onClose: () => void
}

/* ─── Style Maps ─── */

/** Ring + text color classes keyed by vendor status. */
const STATUS_STYLES: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    inactive: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20',
    suspended: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
}

/** Text color per vendor category for visual differentiation. */
const CATEGORY_COLORS: Record<string, string> = {
    plumbing: 'text-blue-400', electrical: 'text-amber-400',
    hvac: 'text-cyan-400', landscaping: 'text-green-400',
    general: 'text-zinc-400', roofing: 'text-orange-400',
    painting: 'text-purple-400', cleaning: 'text-teal-400',
    other: 'text-zinc-500',
}

/* ─── Seed Data ─── */

/** Demonstration vendor records (replaced by Firestore in production). */
const SEED_VENDORS: VendorData[] = [
    { id: '1', companyName: 'ProFlow Plumbing', contactName: 'Mike Torres', email: 'mike@proflow.com', phone: '512-555-0101', category: 'plumbing', licenseNumber: 'TX-PLB-44821', w9OnFile: true, hourlyRate: 8500, status: 'active', rating: 5, insuranceExpiry: '2027-06-15' },
    { id: '2', companyName: 'BrightSpark Electric', contactName: 'Sarah Chen', email: 'sarah@brightspark.io', phone: '303-555-0202', category: 'electrical', licenseNumber: 'CO-ELC-99102', w9OnFile: true, hourlyRate: 9500, status: 'active', rating: 4 },
    { id: '3', companyName: 'CoolAir HVAC Solutions', contactName: 'James Rivera', email: 'james@coolair.net', phone: '602-555-0303', category: 'hvac', w9OnFile: false, hourlyRate: 11000, status: 'active', rating: 4 },
    { id: '4', companyName: 'GreenEdge Landscaping', contactName: 'Emma Nguyen', email: 'emma@greenedge.co', phone: '619-555-0404', category: 'landscaping', w9OnFile: true, hourlyRate: 6500, status: 'inactive', rating: 3 },
    { id: '5', companyName: 'AllPro Maintenance', contactName: 'Robert Hayes', email: 'robert@allpro.com', phone: '503-555-0505', category: 'general', licenseNumber: 'OR-GEN-77231', w9OnFile: true, hourlyRate: 7500, status: 'active', rating: 5 },
]

/* ─── Helpers ─── */

/** Capitalize the first letter of a string for display. */
function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Upsert a record into an array by `id`.
 * Returns a new array — does not mutate the original.
 */
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
 * Modal form for creating or editing a vendor record.
 * All fields from the Vendor model are editable.
 */
function VendorModal({ vendor, onSave, onClose }: VendorModalProps) {
    const blankVendor: VendorData = {
        id: Date.now().toString(), companyName: '', contactName: '',
        email: '', phone: '', category: 'general', w9OnFile: false, status: 'active',
    }
    const [formData, setFormData] = useState<VendorData>(vendor ?? blankVendor)

    /** Merge partial updates into form state. */
    const updateField = (patch: Partial<VendorData>) => {
        setFormData((prev) => ({ ...prev, ...patch }))
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"><X className="h-4 w-4" /></button>
                <h2 className="mb-6 text-xl font-semibold text-white">{vendor ? 'Edit Vendor' : 'Add Vendor'}</h2>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="space-y-4">
                    {/* Identity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Company Name</label><input value={formData.companyName} onChange={(e) => updateField({ companyName: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required /></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Contact Name</label><input value={formData.contactName} onChange={(e) => updateField({ contactName: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required /></div>
                    </div>
                    {/* Contact */}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Email</label><input type="email" value={formData.email} onChange={(e) => updateField({ email: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required /></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Phone</label><input value={formData.phone} onChange={(e) => updateField({ phone: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required /></div>
                    </div>
                    {/* Classification */}
                    <div className="grid grid-cols-3 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Category</label><select value={formData.category} onChange={(e) => updateField({ category: e.target.value as VendorCategory })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none">{VENDOR_CATEGORIES.map((c) => <option key={c} value={c}>{capitalize(c)}</option>)}</select></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Status</label><select value={formData.status} onChange={(e) => updateField({ status: e.target.value as VendorData['status'] })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Hourly Rate ($)</label><input type="number" value={formData.hourlyRate ? formData.hourlyRate / CENTS_PER_DOLLAR : ''} onChange={(e) => updateField({ hourlyRate: Math.round(Number(e.target.value) * CENTS_PER_DOLLAR) })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" placeholder="85.00" /></div>
                    </div>
                    {/* Compliance */}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">License #</label><input value={formData.licenseNumber ?? ''} onChange={(e) => updateField({ licenseNumber: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" /></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Insurance Expiry</label><input type="date" value={formData.insuranceExpiry ?? ''} onChange={(e) => updateField({ insuranceExpiry: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" /></div>
                    </div>
                    <div className="flex items-center gap-3"><input type="checkbox" checked={formData.w9OnFile} onChange={(e) => updateField({ w9OnFile: e.target.checked })} className="rounded border-zinc-700 bg-zinc-900" /><label className="text-sm text-zinc-400">W-9 On File</label></div>
                    <div><label className="mb-1 block text-sm font-medium text-zinc-400">Notes</label><textarea value={formData.notes ?? ''} onChange={(e) => updateField({ notes: e.target.value })} rows={2} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" /></div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800">Cancel</button>
                        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">{vendor ? 'Save' : 'Add Vendor'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ─── Page Component ─── */

/**
 * Vendor Management page — lists, filters, and manages vendor records.
 *
 * Features:
 * - Data table with company, contact, category, rate, rating, status columns
 * - Category dropdown filter
 * - Add / Edit via modal, Delete inline
 *
 * Used by: app router — /vendors
 */
export default function VendorsPage() {
    const [vendors, setVendors] = useState<VendorData[]>(SEED_VENDORS)
    const [editingVendor, setEditingVendor] = useState<VendorData | undefined>()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [categoryFilter, setCategoryFilter] = useState('')

    /* Why: filter by category only when a category is selected */
    const filteredVendors = vendors.filter(
        (vendor) => !categoryFilter || vendor.category === categoryFilter,
    )

    /** Persist vendor (add or update) and close the modal. */
    const handleSave = (data: VendorData) => {
        setVendors((prev) => upsertById(prev, data))
        setIsModalOpen(false)
        setEditingVendor(undefined)
    }

    /** Remove a vendor by ID. */
    const handleDelete = (vendorId: string) => {
        setVendors((prev) => prev.filter((vendor) => vendor.id !== vendorId))
    }

    /** Open modal for a new vendor. */
    const handleAdd = () => { setEditingVendor(undefined); setIsModalOpen(true) }

    /** Open modal to edit an existing vendor. */
    const handleEdit = (vendor: VendorData) => { setEditingVendor(vendor); setIsModalOpen(true) }

    return (
        <>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Vendor Management</h2>
                    <p className="mt-1 text-zinc-400">{vendors.length} vendors in your network.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:border-indigo-500 focus:outline-none">
                        <option value="">All Categories</option>
                        {VENDOR_CATEGORIES.map((c) => <option key={c} value={c}>{capitalize(c)}</option>)}
                    </select>
                    <button onClick={handleAdd} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-500">
                        <Plus className="h-4 w-4" />Add Vendor
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-xl">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-zinc-800/60">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Company</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Contact</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Category</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Rate</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Rating</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-zinc-800/40">
                        {filteredVendors.map((vendor) => (
                            <tr key={vendor.id} className="group transition-colors hover:bg-zinc-800/20">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20"><BriefcaseBusiness className="h-4 w-4" /></div>
                                        <div><p className="font-medium text-zinc-100">{vendor.companyName}</p>{vendor.licenseNumber && <p className="text-xs text-zinc-500"><Shield className="mr-1 inline h-3 w-3" />{vendor.licenseNumber}</p>}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><p className="text-zinc-300">{vendor.contactName}</p><p className="flex items-center gap-1 text-xs text-zinc-500"><Mail className="h-3 w-3" />{vendor.email}</p></td>
                                <td className="px-6 py-4 text-center"><span className={`text-xs font-medium capitalize ${CATEGORY_COLORS[vendor.category]}`}>{vendor.category}</span></td>
                                <td className="px-6 py-4 text-center text-zinc-300">{vendor.hourlyRate ? `$${(vendor.hourlyRate / CENTS_PER_DOLLAR).toFixed(0)}/hr` : '—'}</td>
                                <td className="px-6 py-4 text-center">{vendor.rating ? <span className="inline-flex items-center gap-1 text-amber-400"><Star className="h-3.5 w-3.5 fill-amber-400" />{vendor.rating}</span> : '—'}</td>
                                <td className="px-6 py-4 text-center"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_STYLES[vendor.status]}`}>{vendor.status}</span></td>
                                <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button onClick={() => handleEdit(vendor)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"><Pencil className="h-4 w-4" /></button>
                                    <button onClick={() => handleDelete(vendor.id)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                                </div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <VendorModal
                    vendor={editingVendor}
                    onSave={handleSave}
                    onClose={() => { setIsModalOpen(false); setEditingVendor(undefined) }}
                />
            )}
        </>
    )
}
