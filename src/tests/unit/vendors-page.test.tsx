/**
 * @file vendors-page.test.tsx
 * @brief Unit tests for the Vendor Management CRUD page.
 *
 * Refs: GOV-002 §4, EVO-001 Sprint 5
 * Assertion density: ≥2 per test (NASA JPL Rule 5)
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import VendorsPage from '@/app/vendors/page'

describe('VendorsPage (Sprint 5)', () => {

    it('renders the page header and seed data', () => {
        render(<VendorsPage />)

        expect(screen.getByText('Vendor Management')).toBeInTheDocument()
        // Seed data should populate the table
        expect(screen.getByText('ProFlow Plumbing')).toBeInTheDocument()
        expect(screen.getByText('BrightSpark Electric')).toBeInTheDocument()
    })

    it('displays vendor categories and statuses from seed data', () => {
        render(<VendorsPage />)

        // Categories render lowercase in the DOM (CSS capitalize handles display)
        expect(screen.getAllByText('plumbing').length).toBeGreaterThanOrEqual(1)
        // Status pills render lowercase in the DOM (CSS capitalize handles display)
        expect(screen.getAllByText('active').length).toBeGreaterThanOrEqual(1)
    })

    it('opens the Add Vendor modal when clicking the add button', () => {
        render(<VendorsPage />)

        fireEvent.click(screen.getByText('Add Vendor'))

        // Modal title appears as h2
        expect(screen.getByText('Add Vendor', { selector: 'h2' })).toBeInTheDocument()
        // Form fields should be present
        expect(screen.getByText('Company Name')).toBeInTheDocument()
    })

    it('closes the modal on cancel without modifying data', () => {
        render(<VendorsPage />)

        // Open modal
        fireEvent.click(screen.getByText('Add Vendor'))

        // Close modal
        fireEvent.click(screen.getByText('Cancel'))

        // Seed data unchanged
        expect(screen.getByText('ProFlow Plumbing')).toBeInTheDocument()
        expect(screen.getByText('CoolAir HVAC Solutions')).toBeInTheDocument()
    })

    it('renders contact details for each vendor', () => {
        render(<VendorsPage />)

        expect(screen.getByText('Mike Torres')).toBeInTheDocument()
        expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    })
})
