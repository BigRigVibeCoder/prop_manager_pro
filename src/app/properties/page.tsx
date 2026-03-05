/**
 * @file page.tsx (Properties)
 * @brief Properties CRUD page with expandable document management.
 *
 * Displays all property records. Each row is expandable to reveal an
 * attached documents sub-table (deeds, inspections, insurance, etc.).
 * Supports Add/Edit/Delete for both properties and their documents.
 *
 * Used by: app router — mounted at /properties
 * Related: EVO-001 Sprint 5, types.ts (Property, PropertyDocument models)
 */
'use client'

import { useState } from 'react'
import {
    Plus, Pencil, Trash2, X, FileText,
    MapPin, FileUp, Home,
} from 'lucide-react'
import type { DocumentType } from '@/lib/models/types'

/* ─── Constants ─── */

/** Cents-to-dollars divisor for display formatting. */
const CENTS_PER_DOLLAR = 100

/** Bytes-to-KB divisor for file sizes. */
const BYTES_PER_KB = 1024



/** Available document categories. */
const DOC_TYPES: DocumentType[] = [
    'deed', 'inspection', 'insurance', 'contract', 'tax', 'photo', 'permit', 'other',
]

/* ─── Interfaces ─── */

/** Local-shape for a property record. */
interface PropertyData {
    id: string
    name: string
    address: { street: string; city: string; state: string; zipCode: string }
    specs: { units: number; squareFeet: number; buildYear?: number }
    status: 'active' | 'inactive' | 'maintenance'
    purchasePrice?: number
}

/** Local-shape for an attached document. */
interface DocumentData {
    id: string
    propertyId: string
    name: string
    type: DocumentType
    fileSize?: number
    uploadedAt: string
}

/** Props for the PropertyModal component. */
interface PropertyModalProps {
    property?: PropertyData
    onSave: (data: PropertyData) => void
    onClose: () => void
}

/** Props for the DocumentModal component. */
interface DocumentModalProps {
    propertyId: string
    document?: DocumentData
    onSave: (data: DocumentData) => void
    onClose: () => void
}

/* ─── Style Maps ─── */

/** Status badge styles for properties. */
const STATUS_STYLES = {
    active: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    inactive: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20',
    maintenance: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
} as const

/* ─── Seed Data ─── */

const SEED_PROPERTIES: PropertyData[] = [
    { id: '1', name: 'Riverside Apartments', address: { street: '123 River Road', city: 'Austin', state: 'TX', zipCode: '78701' }, specs: { units: 24, squareFeet: 18000, buildYear: 2015 }, status: 'active', purchasePrice: 240000000 },
    { id: '2', name: 'Oak Valley Condos', address: { street: '456 Oak Lane', city: 'Denver', state: 'CO', zipCode: '80202' }, specs: { units: 12, squareFeet: 9600, buildYear: 2018 }, status: 'active', purchasePrice: 180000000 },
    { id: '3', name: 'Sunset Office Park', address: { street: '789 Sunset Blvd', city: 'Phoenix', state: 'AZ', zipCode: '85001' }, specs: { units: 8, squareFeet: 12000, buildYear: 2010 }, status: 'maintenance', purchasePrice: 320000000 },
    { id: '4', name: 'Harbor View Townhomes', address: { street: '101 Bay Drive', city: 'San Diego', state: 'CA', zipCode: '92101' }, specs: { units: 16, squareFeet: 14400, buildYear: 2020 }, status: 'active', purchasePrice: 410000000 },
    { id: '5', name: 'Pine Ridge Duplexes', address: { street: '202 Pine Ave', city: 'Portland', state: 'OR', zipCode: '97201' }, specs: { units: 6, squareFeet: 4800, buildYear: 1995 }, status: 'inactive', purchasePrice: 85000000 },
]

const SEED_DOCUMENTS: DocumentData[] = [
    { id: 'd1', propertyId: '1', name: 'Property Deed — Riverside', type: 'deed', fileSize: 245000, uploadedAt: '2025-06-01' },
    { id: 'd2', propertyId: '1', name: 'Annual Inspection Report 2025', type: 'inspection', fileSize: 182000, uploadedAt: '2025-12-01' },
    { id: 'd3', propertyId: '2', name: 'Master Insurance Policy', type: 'insurance', fileSize: 520000, uploadedAt: '2026-01-15' },
    { id: 'd4', propertyId: '3', name: 'Commercial Lease Agreement — Suite 100', type: 'contract', fileSize: 340000, uploadedAt: '2025-03-10' },
    { id: 'd5', propertyId: '4', name: 'Property Tax Assessment 2025', type: 'tax', fileSize: 95000, uploadedAt: '2025-11-20' },
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

/** Property creation and editing modal. */
function PropertyModal({ property, onSave, onClose }: PropertyModalProps) {
    const blankProp: PropertyData = {
        id: Date.now().toString(), name: '', status: 'active',
        address: { street: '', city: '', state: '', zipCode: '' },
        specs: { units: 1, squareFeet: 1000 },
    }
    const [formData, setFormData] = useState<PropertyData>(property ?? blankProp)

    const updateField = (p: Partial<PropertyData>) => setFormData(v => ({ ...v, ...p }))
    const updateAddress = (p: Partial<PropertyData['address']>) => setFormData(v => ({ ...v, address: { ...v.address, ...p } }))
    const updateSpecs = (p: Partial<PropertyData['specs']>) => setFormData(v => ({ ...v, specs: { ...v.specs, ...p } }))

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"><X className="h-4 w-4" /></button>
                <h2 className="mb-6 text-xl font-semibold text-white">{property ? 'Edit Property' : 'Add Property'}</h2>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="space-y-4">
                    <div><label className="mb-1 block text-sm font-medium text-zinc-400">Property Name</label><input value={formData.name} onChange={(e) => updateField({ name: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" required /></div>
                    <div><label className="mb-1 block text-sm font-medium text-zinc-400">Street Address</label><input value={formData.address.street} onChange={(e) => updateAddress({ street: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" required /></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1"><label className="mb-1 block text-sm font-medium text-zinc-400">City</label><input value={formData.address.city} onChange={(e) => updateAddress({ city: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" required /></div>
                        <div className="col-span-1"><label className="mb-1 block text-sm font-medium text-zinc-400">State</label><input value={formData.address.state} onChange={(e) => updateAddress({ state: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" required /></div>
                        <div className="col-span-1"><label className="mb-1 block text-sm font-medium text-zinc-400">ZIP</label><input value={formData.address.zipCode} onChange={(e) => updateAddress({ zipCode: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" required /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Units</label><input type="number" value={formData.specs.units} onChange={(e) => updateSpecs({ units: Number(e.target.value) })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" required min="1" /></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Sq Ft</label><input type="number" value={formData.specs.squareFeet} onChange={(e) => updateSpecs({ squareFeet: Number(e.target.value) })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" required min="1" /></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Build Year</label><input type="number" value={formData.specs.buildYear ?? ''} onChange={(e) => updateSpecs({ buildYear: Number(e.target.value) })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Status</label><select value={formData.status} onChange={(e) => updateField({ status: e.target.value as PropertyData['status'] })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"><option value="active">Active</option><option value="inactive">Inactive</option><option value="maintenance">Maintenance</option></select></div>
                        <div><label className="mb-1 block text-sm font-medium text-zinc-400">Value ($)</label><input type="number" value={formData.purchasePrice ? formData.purchasePrice / CENTS_PER_DOLLAR : ''} onChange={(e) => updateField({ purchasePrice: Math.round(Number(e.target.value) * CENTS_PER_DOLLAR) })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" placeholder="2400000" /></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800">Cancel</button>
                        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">{property ? 'Save' : 'Add Property'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/** Document creation and editing modal attached to a property. */
function DocumentModal({ propertyId, document, onSave, onClose }: DocumentModalProps) {
    const blankDoc: DocumentData = {
        id: Date.now().toString(), propertyId, name: '', type: 'other', uploadedAt: new Date().toISOString().split('T')[0], fileSize: 154000,
    }
    const [formData, setFormData] = useState<DocumentData>(document ?? blankDoc)
    const updateField = (p: Partial<DocumentData>) => setFormData(v => ({ ...v, ...p }))

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
                <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"><X className="h-4 w-4" /></button>
                <h2 className="mb-4 text-lg font-medium text-white">{document ? 'Edit Document' : 'Upload Document'}</h2>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="space-y-4">
                    <div><label className="mb-1 block text-sm font-medium text-zinc-400">Document Name</label><input value={formData.name} onChange={(e) => updateField({ name: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none" required placeholder="e.g. Master Policy 2026" /></div>
                    <div><label className="mb-1 block text-sm font-medium text-zinc-400">Category</label><select value={formData.type} onChange={(e) => updateField({ type: e.target.value as DocumentType })} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none">{DOC_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}</select></div>
                    {!document && <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-center"><FileUp className="mx-auto mb-2 h-6 w-6 text-zinc-500" /><p className="text-sm text-zinc-400">Drag & drop or click to select file</p></div>}
                    <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800">Cancel</button><button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">{document ? 'Save' : 'Upload'}</button></div>
                </form>
            </div>
        </div>
    )
}

/* ─── Page Component ─── */

/**
 * Properties Management page — hierarchical data table with nested documents.
 */
export default function PropertiesPage() {
    const [properties, setProperties] = useState<PropertyData[]>(SEED_PROPERTIES)
    const [documents, setDocuments] = useState<DocumentData[]>(SEED_DOCUMENTS)

    const [expandedRow, setExpandedRow] = useState<string | null>(null)
    const [editingProp, setEditingProp] = useState<PropertyData | undefined>()
    const [isPropModalOpen, setIsPropModalOpen] = useState(false)

    const [editingDoc, setEditingDoc] = useState<DocumentData | undefined>()
    const [activePropIdForDoc, setActivePropIdForDoc] = useState<string | null>(null)

    /** Format currency shorthand. */
    const formatValue = (cents: number) => {
        const millions = cents / CENTS_PER_DOLLAR / 1000000
        return `$${millions.toFixed(1)}M value`
    }

    /* CRUD Methods */
    const saveProp = (data: PropertyData) => { setProperties(p => upsertById(p, data)); setIsPropModalOpen(false) }
    const saveDoc = (data: DocumentData) => { setDocuments(p => upsertById(p, data)); setActivePropIdForDoc(null) }
    const deleteProp = (id: string) => setProperties(p => p.filter(x => x.id !== id))
    const deleteDoc = (id: string) => setDocuments(p => p.filter(x => x.id !== id))

    return (
        <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Properties</h2>
                    <p className="mt-1 text-zinc-400">{properties.length} properties · Click a row to manage documents</p>
                </div>
                <button onClick={() => { setEditingProp(undefined); setIsPropModalOpen(true) }} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"><Plus className="h-4 w-4" /> Add Property</button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {properties.map((prop) => {
                    const isExpanded = expandedRow === prop.id
                    const propDocs = documents.filter(d => d.propertyId === prop.id)

                    return (
                        <div key={prop.id} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 transition-colors hover:border-zinc-700">
                            {/* Main Row */}
                            <div className="flex cursor-pointer items-center justify-between p-4" onClick={() => setExpandedRow(isExpanded ? null : prop.id)}>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10"><Home className="h-5 w-5 text-blue-400" /></div>
                                    <div><p className="font-semibold text-zinc-100">{prop.name}</p><p className="text-xs text-zinc-500">{prop.purchasePrice ? formatValue(prop.purchasePrice) : 'Value pending'}</p></div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <p className="text-sm text-zinc-400"><MapPin className="mr-1 inline h-3.5 w-3.5" />{prop.address.city}, {prop.address.state}</p>
                                    <p className="text-sm text-zinc-400">{prop.specs.units} units</p>
                                    <p className="text-sm text-zinc-400">{prop.specs.squareFeet.toLocaleString()} sqft</p>
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_STYLES[prop.status]}`}>{prop.status}</span>
                                    <p className="flex items-center gap-1 text-sm text-zinc-400"><FileText className="h-4 w-4" /> {propDocs.length}</p>
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => { setEditingProp(prop); setIsPropModalOpen(true) }} className="rounded p-1 text-zinc-500 hover:text-white"><Pencil className="h-4 w-4" /></button>
                                        <button onClick={() => deleteProp(prop.id)} className="rounded p-1 text-zinc-500 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Expandable Documents Panel */}
                            {isExpanded && (
                                <div className="border-t border-zinc-800 bg-zinc-900/30 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-300"><FileText className="h-4 w-4" /> Documents ({propDocs.length})</h4>
                                        <button onClick={() => { setEditingDoc(undefined); setActivePropIdForDoc(prop.id) }} className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700"><Plus className="h-3 w-3" /> Add Document</button>
                                    </div>
                                    {propDocs.length === 0 ? (
                                        <p className="py-4 text-center text-sm text-zinc-600">No documents attached.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {propDocs.map(doc => (
                                                <div key={doc.id} className="group flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950 p-3">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-4 w-4 text-zinc-500" />
                                                        <div><p className="text-sm font-medium text-zinc-200">{doc.name}</p><p className="text-xs text-zinc-500 capitalize">{doc.type} · {doc.uploadedAt} · {doc.fileSize ? Math.round(doc.fileSize / BYTES_PER_KB) + ' KB' : '--'}</p></div>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <button onClick={() => { setEditingDoc(doc); setActivePropIdForDoc(prop.id) }} className="rounded p-1 text-zinc-500 hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
                                                        <button onClick={() => deleteDoc(doc.id)} className="rounded p-1 text-zinc-500 hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Modals */}
            {isPropModalOpen && <PropertyModal property={editingProp} onSave={saveProp} onClose={() => setIsPropModalOpen(false)} />}
            {activePropIdForDoc && <DocumentModal propertyId={activePropIdForDoc} document={editingDoc} onSave={saveDoc} onClose={() => setActivePropIdForDoc(null)} />}
        </div>
    )
}
