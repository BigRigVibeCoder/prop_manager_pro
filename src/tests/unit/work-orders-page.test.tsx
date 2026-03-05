/**
 * @file work-orders-page.test.tsx
 * @brief Unit tests for the Work Orders CRUD page.
 *
 * Refs: GOV-002 §4, EVO-001 Sprint 5
 * Assertion density: ≥2 per test (NASA JPL Rule 5)
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import WorkOrdersPage from '@/app/work-orders/page'

describe('WorkOrdersPage (Sprint 5)', () => {

    it('renders the page header and seed work orders', () => {
        render(<WorkOrdersPage />)

        expect(screen.getByText('Work Orders')).toBeInTheDocument()
        // Seed data — actual titles from SEED_WORK_ORDERS
        expect(screen.getByText(/Leaking kitchen faucet/)).toBeInTheDocument()
        expect(screen.getByText(/Lobby lighting replacement/)).toBeInTheDocument()
    })

    it('displays priority badges and status pills from seed data', () => {
        render(<WorkOrdersPage />)

        // Priority badges render lowercase in DOM (CSS capitalize handles display)
        expect(screen.getAllByText('medium').length).toBeGreaterThanOrEqual(1)
        // Status pills render via formatStatus() — "Open" is capitalized
        expect(screen.getAllByText('Open').length).toBeGreaterThanOrEqual(1)
    })

    it('opens the New Work Order modal via New Ticket button', () => {
        render(<WorkOrdersPage />)

        fireEvent.click(screen.getByText('New Ticket'))

        // Modal title renders as "New Work Order" (separate from button text)
        expect(screen.getByText('New Work Order', { selector: 'h2' })).toBeInTheDocument()
        expect(screen.getByText('Title')).toBeInTheDocument()
    })

    it('closes the modal without saving on cancel', () => {
        render(<WorkOrdersPage />)

        fireEvent.click(screen.getByText('New Ticket'))
        fireEvent.click(screen.getByText('Cancel'))

        // Seed data still present
        expect(screen.getByText(/Leaking kitchen faucet/)).toBeInTheDocument()
        expect(screen.getByText(/AC unit not cooling/)).toBeInTheDocument()
    })

    it('renders all 5 seed work orders in the table', () => {
        render(<WorkOrdersPage />)

        expect(screen.getByText(/Leaking kitchen faucet/)).toBeInTheDocument()
        expect(screen.getByText(/Lobby lighting replacement/)).toBeInTheDocument()
        expect(screen.getByText(/AC unit not cooling/)).toBeInTheDocument()
        expect(screen.getByText(/Broken window/)).toBeInTheDocument()
        expect(screen.getByText(/Quarterly grounds maintenance/)).toBeInTheDocument()
    })
})
