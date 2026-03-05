/**
 * @file kpi-card.test.tsx
 * @brief Unit tests for the KPICard dashboard component.
 *
 * Refs: GOV-002 §4, GOV-003, EVO-001 Sprint 5
 * Assertion density: ≥2 per test (NASA JPL Rule 5)
 */
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import KPICard from '@/components/dashboard/KPICard'
import { DollarSign } from 'lucide-react'

describe('Dashboard KPICard (SPR-005)', () => {

    it('renders loading skeleton when loading prop is true', () => {
        const { container } = render(
            <KPICard title="Revenue" value="$0" icon={DollarSign} loading={true} />
        )

        // Guard: skeleton IS present
        expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
        // Guard: real content is NOT present
        expect(screen.queryByText('Revenue')).not.toBeInTheDocument()
    })

    it('renders standard state correctly with formatted string value', () => {
        render(
            <KPICard title="Total Revenue" value="$42,000" icon={DollarSign} />
        )

        expect(screen.getByText('Total Revenue')).toBeInTheDocument()
        expect(screen.getByText('$42,000')).toBeInTheDocument()
    })

    it('renders missing values safely as fallback (guard clause)', () => {
        render(
            <KPICard title="Missing Data" value={undefined as never} icon={DollarSign} />
        )

        expect(screen.getByText('Missing Data')).toBeInTheDocument()
        expect(screen.getByText('---')).toBeInTheDocument()
    })

    it('renders positive trend modifiers correctly', () => {
        render(
            <KPICard title="Occupancy" value="95%" icon={DollarSign} trend={{ value: 4.5, label: 'vs last month' }} />
        )

        expect(screen.getByText('4.5%')).toBeInTheDocument()
        expect(screen.getByText('↑')).toBeInTheDocument()
        expect(screen.getByText('vs last month')).toBeInTheDocument()
    })

    it('renders negative trend modifiers correctly', () => {
        render(
            <KPICard title="Vacancies" value={10} icon={DollarSign} trend={{ value: -2, label: 'down' }} />
        )

        expect(screen.getByText('2%')).toBeInTheDocument()
        expect(screen.getByText('↓')).toBeInTheDocument()
        expect(screen.getByText('down')).toBeInTheDocument()
    })

    it('renders without trend when trend is omitted', () => {
        const { container } = render(
            <KPICard title="Properties" value="12" icon={DollarSign} />
        )

        expect(screen.getByText('Properties')).toBeInTheDocument()
        expect(screen.getByText('12')).toBeInTheDocument()
        // No trend arrow should appear
        expect(screen.queryByText('↑')).not.toBeInTheDocument()
        expect(screen.queryByText('↓')).not.toBeInTheDocument()
    })
})
