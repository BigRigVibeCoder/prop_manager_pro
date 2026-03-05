/**
 * @file types.ts
 * @brief Core data models for the PropManage Pro Firestore database.
 *
 * Defines TypeScript interfaces matching every Firestore collection.
 * These types are the single source of truth for data shapes across
 * the entire front-end application.
 *
 * Used by: all API layers, all CRUD pages, reporting components.
 *
 * References: BLU-002 (Task 3), EVO-001 (Sprint 5).
 */

/* ─── Firestore Timestamp ─── */

/** Firebase Timestamp — also accepts native JS Date for local-state usage. */
export interface Timestamp {
    seconds: number
    nanoseconds: number
}

/* ─── Collection Registry ─── */

/** All Firestore collection names used by the application. */
export type CollectionName =
    | 'users'
    | 'properties'
    | 'tenants'
    | 'ledgers'
    | 'vendors'
    | 'work_orders'
    | 'property_documents'

/* ─── User ─── */

/**
 * Represents an authenticated user (property owner or platform admin).
 * Maps to: `users/{id}` in Firestore.
 */
export interface User {
    /** Firestore Document ID */
    id: string
    /** Login email address */
    email: string
    /** Human-readable name, null until profile completed */
    displayName: string | null
    /** Authorization role — 'owner' manages properties, 'admin' has full access */
    role: 'owner' | 'admin'
    createdAt: Timestamp | Date
    updatedAt: Timestamp | Date
}

/* ─── Property ─── */

/**
 * A physical real-estate asset managed by an owner.
 * Maps to: `properties/{id}` in Firestore.
 *
 * Security: `ownerId` enforces multi-tenant data isolation in
 * Firestore rules (see firestore.rules `isOwner` gate).
 */
export interface Property {
    /** Firestore Document ID */
    id: string
    /** FK → users.id — enforces data isolation */
    ownerId: string
    /** Human-readable property name (e.g. "Riverside Apartments") */
    name: string
    address: {
        street: string
        city: string
        state: string
        zipCode: string
        country: string
    }
    specs: {
        units: number
        squareFeet: number
        buildYear?: number
    }
    /** Operational status — 'maintenance' disables new leases */
    status: 'active' | 'inactive' | 'maintenance'
    /** Original purchase price in whole dollars */
    purchasePrice?: number
    createdAt: Timestamp | Date
    updatedAt: Timestamp | Date
}

/* ─── Tenant ─── */

/**
 * An individual leasing a unit within a Property.
 * Maps to: `tenants/{id}` in Firestore.
 */
export interface Tenant {
    /** Firestore Document ID */
    id: string
    /** FK → properties.id */
    propertyId: string
    /** FK → users.id — data isolation */
    ownerId: string
    firstName: string
    lastName: string
    email: string
    phone: string
    lease: {
        startDate: Timestamp | Date
        endDate: Timestamp | Date
        /** Monthly rent in cents (e.g. $1,850.00 = 185000) */
        rentAmount: number
        /** Security deposit in cents */
        securityDeposit: number
        /** False when lease has expired or been terminated */
        isActive: boolean
    }
    createdAt: Timestamp | Date
    updatedAt: Timestamp | Date
}

/* ─── Ledger ─── */

/**
 * Immutable financial transaction log attached to a property/tenant.
 * Maps to: `ledgers/{id}` in Firestore.
 *
 * Used by: Cloud Function `updatePortfolioKPIs` for dashboard aggregation.
 */
export interface Ledger {
    /** Firestore Document ID */
    id: string
    /** FK → properties.id */
    propertyId: string
    /** FK → tenants.id (optional — expenses may not reference a tenant) */
    tenantId?: string
    /** FK → users.id — data isolation */
    ownerId: string
    type: 'income' | 'expense' | 'deposit' | 'refund'
    category: 'rent' | 'maintenance' | 'utility' | 'tax' | 'other'
    /** Transaction amount in cents (e.g. $100.00 = 10000) */
    amount: number
    date: Timestamp | Date
    description: string
    /** Cloud Storage URI for receipt attachment */
    receiptUrl?: string
    createdAt: Timestamp | Date
}

/* ─── Vendor ─── */

/** Trade categories for vendor classification. */
export type VendorCategory =
    | 'plumbing'
    | 'electrical'
    | 'hvac'
    | 'landscaping'
    | 'general'
    | 'roofing'
    | 'painting'
    | 'cleaning'
    | 'other'

/**
 * An external contractor or service company.
 * Maps to: `vendors/{id}` in Firestore.
 *
 * Linked to Work Orders via `vendorId` for cost tracking and vendor spend reporting.
 */
export interface Vendor {
    /** Firestore Document ID */
    id: string
    /** FK → users.id — data isolation */
    ownerId: string
    /** Legal business name */
    companyName: string
    /** Primary point of contact */
    contactName: string
    email: string
    phone: string
    /** Trade specialization for filtering and assignment */
    category: VendorCategory
    /** State contractor license / ID */
    licenseNumber?: string
    /** Certificate of Insurance expiration */
    insuranceExpiry?: Timestamp | Date
    /** Whether IRS W-9 form has been received */
    w9OnFile: boolean
    /** Standard hourly rate in cents */
    hourlyRate?: number
    notes?: string
    status: 'active' | 'inactive' | 'suspended'
    /** Performance rating 1–5 stars */
    rating?: number
    createdAt: Timestamp | Date
    updatedAt: Timestamp | Date
}

/* ─── Work Order ─── */

/** Maintenance category for work order classification. */
export type WorkOrderCategory =
    | 'plumbing'
    | 'electrical'
    | 'hvac'
    | 'appliance'
    | 'structural'
    | 'pest'
    | 'general'

/** Urgency level — 'emergency' triggers immediate notification. */
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'emergency'

/** Lifecycle status of a maintenance ticket. */
export type WorkOrderStatus =
    | 'open'
    | 'in-progress'
    | 'on-hold'
    | 'completed'
    | 'cancelled'

/**
 * A maintenance ticket from creation through resolution.
 * Maps to: `work_orders/{id}` in Firestore.
 */
export interface WorkOrder {
    /** Firestore Document ID */
    id: string
    /** FK → users.id — data isolation */
    ownerId: string
    /** FK → properties.id — which property has the issue */
    propertyId: string
    /** FK → tenants.id (if tenant-submitted) */
    tenantId?: string
    /** FK → vendors.id (assigned contractor) */
    vendorId?: string
    /** Short summary (e.g. "Leaking kitchen faucet") */
    title: string
    /** Detailed issue description */
    description: string
    category: WorkOrderCategory
    priority: WorkOrderPriority
    status: WorkOrderStatus
    scheduledDate?: Timestamp | Date
    completedDate?: Timestamp | Date
    /** Budget estimate in cents */
    estimatedCost?: number
    /** Final invoice amount in cents */
    actualCost?: number
    /** Internal notes / resolution summary */
    notes?: string
    createdAt: Timestamp | Date
    updatedAt: Timestamp | Date
}

/* ─── Property Document ─── */

/** Classification of documents attached to a property. */
export type DocumentType =
    | 'deed'
    | 'inspection'
    | 'insurance'
    | 'contract'
    | 'tax'
    | 'photo'
    | 'permit'
    | 'other'

/**
 * A file attachment linked to a specific property.
 * Maps to: `property_documents/{id}` in Firestore.
 *
 * Examples: deeds, inspection reports, insurance policies, contracts.
 */
export interface PropertyDocument {
    /** Firestore Document ID */
    id: string
    /** FK → properties.id */
    propertyId: string
    /** FK → users.id — data isolation */
    ownerId: string
    /** Human-readable document name */
    name: string
    /** Document classification for filtering */
    type: DocumentType
    /** Cloud Storage download URI */
    fileUrl?: string
    /** File size in bytes */
    fileSize?: number
    notes?: string
    uploadedAt: Timestamp | Date
}
