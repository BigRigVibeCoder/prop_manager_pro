/**
 * @file tenants-page.test.tsx
 * @brief Unit tests for the Tenant Management CRUD page.
 *
 * Refs: GOV-002 §4, EVO-001 Sprint 5
 * Assertion density: ≥2 per test (NASA JPL Rule 5)
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TenantsPage from '@/app/tenants/page'

describe('TenantsPage (Sprint 5)', () => {

    it('renders the page header and tenant count', () => {
        render(<TenantsPage />)

        expect(screen.getByText('Tenant Management')).toBeInTheDocument()
        // Should show active lease count and total
        expect(screen.getByText(/active leases/i)).toBeInTheDocument()
        expect(screen.getByText(/total tenants/i)).toBeInTheDocument()
    })

    it('displays seed tenant names in the data table', () => {
        render(<TenantsPage />)

        // First+Last names are in separate elements so use partial regex
        expect(screen.getByText(/Alice/)).toBeInTheDocument()
        expect(screen.getByText(/Carlos/)).toBeInTheDocument()
        expect(screen.getByText(/Diana/)).toBeInTheDocument()
    })

    it('shows lease status badges (Active / Expired)', () => {
        render(<TenantsPage />)

        // Active leases
        expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1)
        // Expired lease (Ethan Williams)
        expect(screen.getAllByText('Expired').length).toBeGreaterThanOrEqual(1)
    })

    it('opens the Add Tenant modal', () => {
        render(<TenantsPage />)

        fireEvent.click(screen.getByText('Add Tenant'))

        expect(screen.getByText('Add Tenant', { selector: 'h2' })).toBeInTheDocument()
        expect(screen.getByText('First Name')).toBeInTheDocument()
        expect(screen.getByText('Last Name')).toBeInTheDocument()
    })

    it('closes the modal without saving on cancel', () => {
        render(<TenantsPage />)

        fireEvent.click(screen.getByText('Add Tenant'))
        fireEvent.click(screen.getByText('Cancel'))

        // Seed data still present
        expect(screen.getByText(/Alice/)).toBeInTheDocument()
        expect(screen.getByText(/Ethan/)).toBeInTheDocument()
    })

    it('displays rent amounts formatted from cents to dollars', () => {
        render(<TenantsPage />)

        // Alice's rent: 185000 cents = $1,850
        expect(screen.getByText('$1,850')).toBeInTheDocument()
        // Fiona's rent: 450000 cents = $4,500
        expect(screen.getByText('$4,500')).toBeInTheDocument()
    })
})
