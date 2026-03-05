/**
 * @file properties-page.test.tsx
 * @brief Unit tests for the Properties CRUD page with document management.
 *
 * Refs: GOV-002 §4, EVO-001 Sprint 5
 * Assertion density: ≥2 per test (NASA JPL Rule 5)
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PropertiesPage from '@/app/properties/page'

describe('PropertiesPage (Sprint 5)', () => {

    it('renders the page header and property count', () => {
        render(<PropertiesPage />)

        expect(screen.getByText('Properties')).toBeInTheDocument()
        expect(screen.getByText(/5 properties/i)).toBeInTheDocument()
    })

    it('displays all seed properties', () => {
        render(<PropertiesPage />)

        expect(screen.getByText('Riverside Apartments')).toBeInTheDocument()
        expect(screen.getByText('Oak Valley Condos')).toBeInTheDocument()
        expect(screen.getByText('Sunset Office Park')).toBeInTheDocument()
        expect(screen.getByText('Harbor View Townhomes')).toBeInTheDocument()
        expect(screen.getByText('Pine Ridge Duplexes')).toBeInTheDocument()
    })

    it('shows status badges for each property', () => {
        render(<PropertiesPage />)

        // Status badges render lowercase in DOM (CSS capitalize handles display)
        expect(screen.getAllByText('active').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('maintenance').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('inactive').length).toBeGreaterThanOrEqual(1)
    })

    it('opens the Add Property modal', () => {
        render(<PropertiesPage />)

        fireEvent.click(screen.getByText('Add Property'))

        expect(screen.getByText('Add Property', { selector: 'h2' })).toBeInTheDocument()
        expect(screen.getByText('Property Name')).toBeInTheDocument()
    })

    it('expands a property row to show documents panel', () => {
        render(<PropertiesPage />)

        // Click on Riverside Apartments to expand
        fireEvent.click(screen.getByText('Riverside Apartments'))

        // Riverside has 2 seed documents
        expect(screen.getByText(/Property Deed/)).toBeInTheDocument()
        expect(screen.getByText(/Annual Inspection Report/)).toBeInTheDocument()
    })

    it('opens the Add Document modal within an expanded property', () => {
        render(<PropertiesPage />)

        // Expand Riverside
        fireEvent.click(screen.getByText('Riverside Apartments'))

        // Click "Add Document"
        fireEvent.click(screen.getByText('Add Document'))

        // Document modal should appear
        expect(screen.getByText('Upload Document')).toBeInTheDocument()
        expect(screen.getByText('Document Name')).toBeInTheDocument()
    })
})
