/**
 * @file page.tsx (Work Orders)
 * @brief Work Orders CRUD page — maintenance ticket management with priority and status tracking.
 *
 * Displays work order tickets in a data table with priority badges, status pills,
 * vendor assignment, and cost estimates. Supports Add / Edit / Delete via modal form.
 *
 * Used by: app router — mounted at /work-orders
 * Related: EVO-001 Sprint 5, types.ts (WorkOrder model)
 */
'use client'

import { useState } from 'react'
import {
    Plus, Pencil, Trash2, X,
    AlertTriangle, Clock, CheckCircle2, Wrench,
} from 'lucide-react'
import type { WorkOrderCategory, WorkOrderPriority, WorkOrderStatus } from '@/lib/models/types'

/* ─── Constants ─── */

/** Cents-to-dollars divisor for display formatting. */
const CENTS_PER_DOLLAR = 100

/** Available property names for the work order form selector. */
const PROPERTY_NAMES = [
    'Riverside Apartments', 'Oak Valley Condos', 'Sunset Office Park',
    'Harbor View Townhomes', 'Pine Ridge Duplexes',
] as const

/** Available vendor names for the work order form selector. */
const VENDOR_NAMES = [
    'ProFlow Plumbing', 'BrightSpark Electric', 'CoolAir HVAC Solutions',
    'GreenEdge Landscaping', 'AllPro Maintenance',
] as const

/** All valid work order categories. */
const WO_CATEGORIES: WorkOrderCategory[] = [
    'plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest', 'general',
]

/** All valid priority levels, lowest to highest. */
const WO_PRIORITIES: WorkOrderPriority[] = ['low', 'medium', 'high', 'emergency']

/** All valid lifecycle statuses. */
const WO_STATUSES: WorkOrderStatus[] = [
    'open', 'in-progress', 'on-hold', 'completed', 'cancelled',
]

/* ─── Interfaces ─── */

/** Local-state shape for a work order record (mirrors Firestore WorkOrder). */
interface WorkOrderData {
    id: string
    propertyName: string
    vendorName?: string
    title: string
    description: string
    category: WorkOrderCategory
    priority: WorkOrderPriority
    status: WorkOrderStatus
    scheduledDate?: string
    completedDate?: string
    estimatedCost?: number
    actualCost?: number
    notes?: string
}

/** Props for the WorkOrderModal component. */
interface WorkOrderModalProps {
    /** Existing work order to edit, or undefined for a new ticket. */
    workOrder?: WorkOrderData
    /** Callback invoked with the saved work order data. */
    onSave: (data: WorkOrderData) => void
    /** Callback to close the modal without saving. */
    onClose: () => void
}

/* ─── Style Maps ─── */

/** Ring + text color classes keyed by priority level. */
const PRIORITY_STYLES: Record<string, string> = {
    low: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20',
    medium: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    high: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    emergency: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
}

/** Ring + text color classes keyed by lifecycle status. */
const STATUS_STYLES: Record<string, string> = {
    'open': 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    'in-progress': 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    'on-hold': 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20',
    'completed': 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    'cancelled': 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
}

/** Small icon rendered inside status pills. */
const STATUS_ICONS: Record<string, React.ReactNode> = {
    'open': <Clock className="h-3 w-3" />,
    'in-progress': <Wrench className="h-3 w-3" />,
    'completed': <CheckCircle2 className="h-3 w-3" />,
}

/* ─── Seed Data ─── */

/** Demonstration work order records (replaced by Firestore in production). */
const SEED_WORK_ORDERS: WorkOrderData[] = [
    { id: '1', propertyName: 'Riverside Apartments', vendorName: 'ProFlow Plumbing', title: 'Unit 12B — Leaking kitchen faucet', description: 'Tenant reports constant drip from kitchen faucet. Hot water handle loose.', category: 'plumbing', priority: 'medium', status: 'in-progress', scheduledDate: '2026-03-07', estimatedCost: 25000 },
    { id: '2', propertyName: 'Oak Valley Condos', title: 'Lobby lighting replacement', description: 'Three fluorescent tubes burned out in main lobby ceiling fixtures.', category: 'electrical', priority: 'low', status: 'open', estimatedCost: 8000 },
    { id: '3', propertyName: 'Sunset Office Park', vendorName: 'CoolAir HVAC Solutions', title: 'AC unit not cooling — Suite 200', description: 'Commercial AC unit blowing warm air. Thermostat reads 82°F when set to 72°F.', category: 'hvac', priority: 'high', status: 'open', estimatedCost: 45000 },
    { id: '4', propertyName: 'Harbor View Townhomes', vendorName: 'AllPro Maintenance', title: 'Broken window — Unit 8A', description: 'Storm damage cracked front window. Temporary board installed.', category: 'structural', priority: 'emergency', status: 'in-progress', scheduledDate: '2026-03-06', estimatedCost: 120000 },
    { id: '5', propertyName: 'Riverside Apartments', vendorName: 'GreenEdge Landscaping', title: 'Quarterly grounds maintenance', description: 'Routine mowing, hedge trimming, and irrigation check.', category: 'general', priority: 'low', status: 'completed', completedDate: '2026-03-01', estimatedCost: 35000, actualCost: 32000 },
]

/* ─── Helpers ─── */

/** Capitalize a string for display labels. */
function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Format a hyphenated status slug into Title Case (e.g. "in-progress" → "In Progress"). */
function formatStatus(status: string): string {
    return status.split('-').map((word) => capitalize(word)).join(' ')
}

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
 * Modal form for creating or editing a work order.
 * Includes property/vendor dropdowns, priority/status selectors, and cost fields.
 */
function WorkOrderModal({ workOrder, onSave, onClose }: WorkOrderModalProps) {
    const blankOrder: WorkOrderData = {
        id: Date.now().toString(), propertyName: PROPERTY_NAMES[0],
        title: '', description: '', category: 'general', priority: 'medium', status: 'open',
    }
    const [formData, setFormData] = useState<WorkOrderData>(workOrder ?? blankOrder)

    /** Merge partial updates into form state. */
    const updateField = (patch: Partial<WorkOrderData>) => {
        setFormData((prev) => ({ ...prev, ...patch }))
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"><X className="h-4 w-4" /></button>
                <h2 className="mb-6 text-xl font-semibold text-white">{workOrder ? 'Edit Work Order' : 'New Work Order'}</h2>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="space-y-4">
                    <div><label className="mb-1 block text-sm font-medium text-zinc-400">Title</label><input value={formData.title} onChange={(e) => updateField({ title: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Property</label><select value={formData.propertyName} onChange={(e) => updateField({ propertyName: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none">{PROPERTY_NAMES.map((p) => <option key={p}>{p}</option>)}</select></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Assign Vendor</label><select value={formData.vendorName ?? ''} onChange={(e) => updateField({ vendorName: e.target.value || undefined })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"><option value="">Unassigned</option>{VENDOR_NAMES.map((v) => <option key={v}>{v}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Category</label><select value={formData.category} onChange={(e) => updateField({ category: e.target.value as WorkOrderCategory })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none">{WO_CATEGORIES.map((c) => <option key={c} value={c}>{capitalize(c)}</option>)}</select></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Priority</label><select value={formData.priority} onChange={(e) => updateField({ priority: e.target.value as WorkOrderPriority })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none">{WO_PRIORITIES.map((p) => <option key={p} value={p}>{capitalize(p)}</option>)}</select></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Status</label><select value={formData.status} onChange={(e) => updateField({ status: e.target.value as WorkOrderStatus })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none">{WO_STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}</select></div>
                    </div>
                    <div><label className="mb-1 block text-sm font-medium text-zinc-400">Description</label><textarea value={formData.description} onChange={(e) => updateField({ description: e.target.value })} rows={3} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Estimated Cost ($)</label><input type="number" value={formData.estimatedCost ? formData.estimatedCost / CENTS_PER_DOLLAR : ''} onChange={(e) => updateField({ estimatedCost: Math.round(Number(e.target.value) * CENTS_PER_DOLLAR) })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" placeholder="250.00" /></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Scheduled Date</label><input type="date" value={formData.scheduledDate ?? ''} onChange={(e) => updateField({ scheduledDate: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" /></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800">Cancel</button>
                        <button type="submit" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500">{workOrder ? 'Save' : 'Create Work Order'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ─── Page Component ─── */

/**
 * Work Orders page — lists, filters, and manages maintenance tickets.
 *
 * Features:
 * - Data table with ticket title, property, priority, status, vendor, cost
 * - Status dropdown filter
 * - Add / Edit via modal, Delete inline
 *
 * Used by: app router — /work-orders
 */
export default function WorkOrdersPage() {
    const [orders, setOrders] = useState<WorkOrderData[]>(SEED_WORK_ORDERS)
    const [editingOrder, setEditingOrder] = useState<WorkOrderData | undefined>()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState('')

    /** Count of open + in-progress tickets for header subtitle. */
    const activeTicketCount = orders.filter(
        (order) => order.status === 'open' || order.status === 'in-progress',
    ).length

    /** Filtered list based on the status dropdown selection. */
    const filteredOrders = orders.filter(
        (order) => !statusFilter || order.status === statusFilter,
    )

    /** Persist work order (add or update) and close the modal. */
    const handleSave = (data: WorkOrderData) => {
        setOrders((prev) => upsertById(prev, data))
        setIsModalOpen(false)
        setEditingOrder(undefined)
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Work Orders</h2>
                    <p className="mt-1 text-zinc-400">{activeTicketCount} active tickets · {orders.length} total</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:border-orange-500 focus:outline-none">
                        <option value="">All Statuses</option>
                        {WO_STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
                    </select>
                    <button onClick={() => { setEditingOrder(undefined); setIsModalOpen(true) }} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-orange-600/20 hover:bg-orange-500">
                        <Plus className="h-4 w-4" />New Ticket
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-xl">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-zinc-800/60">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Ticket</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Property</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Priority</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Vendor</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Cost</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-zinc-800/40">
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="group transition-colors hover:bg-zinc-800/20">
                                <td className="px-6 py-4"><p className="font-medium text-zinc-100">{order.title}</p><p className="text-xs capitalize text-zinc-500">{order.category}</p></td>
                                <td className="px-6 py-4 text-zinc-400">{order.propertyName}</td>
                                <td className="px-6 py-4 text-center"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${PRIORITY_STYLES[order.priority]}`}>{order.priority === 'emergency' && <AlertTriangle className="h-3 w-3" />}{order.priority}</span></td>
                                <td className="px-6 py-4 text-center"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[order.status]}`}>{STATUS_ICONS[order.status]}{formatStatus(order.status)}</span></td>
                                <td className="px-6 py-4 text-center text-zinc-400 text-xs">{order.vendorName ?? <span className="text-zinc-600">Unassigned</span>}</td>
                                <td className="px-6 py-4 text-right text-zinc-300">{order.estimatedCost ? `$${(order.estimatedCost / CENTS_PER_DOLLAR).toLocaleString()}` : '—'}</td>
                                <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button onClick={() => { setEditingOrder(order); setIsModalOpen(true) }} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"><Pencil className="h-4 w-4" /></button>
                                    <button onClick={() => setOrders((prev) => prev.filter((x) => x.id !== order.id))} className="rounded-lg p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                                </div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <WorkOrderModal
                    workOrder={editingOrder}
                    onSave={handleSave}
                    onClose={() => { setIsModalOpen(false); setEditingOrder(undefined) }}
                />
            )}
        </>
    )
}
