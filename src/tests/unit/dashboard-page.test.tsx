/**
 * @file dashboard-page.test.tsx
 * @brief Unit tests for the Dashboard (root) page and its reporting sub-components.
 *
 * Refs: GOV-002 §4, EVO-001 Sprint 5
 * Assertion density: ≥2 per test (NASA JPL Rule 5)
 */
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Dashboard from '@/app/page'

describe('Dashboard (Sprint 5)', () => {

    it('renders the portfolio overview header', () => {
        render(<Dashboard />)

        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument()
        expect(screen.getByText(/daily summary/i)).toBeInTheDocument()
    })

    it('renders all 4 KPI card titles', () => {
        render(<Dashboard />)

        expect(screen.getByText('Total Properties')).toBeInTheDocument()
        expect(screen.getByText('Current Tenants')).toBeInTheDocument()
        expect(screen.getByText('Monthly Revenue')).toBeInTheDocument()
        expect(screen.getByText('Occupancy Rate')).toBeInTheDocument()
    })

    it('displays KPI currency and percentage values', () => {
        render(<Dashboard />)

        // $124,500 appears in both KPI card and Revenue chart, so use getAllByText
        expect(screen.getAllByText('$124,500').length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText('94%')).toBeInTheDocument()
    })

    it('renders the Revenue chart with month labels', () => {
        render(<Dashboard />)

        expect(screen.getByText('Revenue (Last 6 Months)')).toBeInTheDocument()
        expect(screen.getByText('Oct')).toBeInTheDocument()
        expect(screen.getByText('Mar')).toBeInTheDocument()
    })

    it('renders the Expense Breakdown chart', () => {
        render(<Dashboard />)

        expect(screen.getByText('Expense Breakdown')).toBeInTheDocument()
        expect(screen.getByText('Utilities')).toBeInTheDocument()
    })

    it('renders the Top Vendor Spend chart', () => {
        render(<Dashboard />)

        expect(screen.getByText('Top Vendor Spend')).toBeInTheDocument()
        expect(screen.getByText('CoolAir HVAC')).toBeInTheDocument()
    })

    it('renders the Occupancy Trend chart', () => {
        render(<Dashboard />)

        expect(screen.getByText('Occupancy Trend')).toBeInTheDocument()
        expect(screen.getByText(/91%/)).toBeInTheDocument()
    })

    it('renders the Maintenance Summary metrics', () => {
        render(<Dashboard />)

        expect(screen.getByText('Maintenance Summary')).toBeInTheDocument()
        expect(screen.getByText('In Progress')).toBeInTheDocument()
        expect(screen.getByText('Completed')).toBeInTheDocument()
    })
})
