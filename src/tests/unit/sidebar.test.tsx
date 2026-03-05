/**
 * @file sidebar.test.tsx
 * @brief Unit tests for the persistent Sidebar navigation component.
 *
 * Refs: GOV-002 §4, GOV-003, EVO-001 Sprint 5
 * Assertion density: ≥2 per test (NASA JPL Rule 5)
 */
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Sidebar from '@/components/layout/Sidebar'

/* Why: Next.js navigation hooks must be mocked in unit test environment */
vi.mock('next/navigation', () => ({
    usePathname: () => '/',
}))

describe('Sidebar Navigation (Sprint 5)', () => {

    it('renders the brand name', () => {
        render(<Sidebar />)

        expect(screen.getByText('PropManage Pro')).toBeInTheDocument()
        expect(screen.getByText('Admin')).toBeInTheDocument()
    })

    it('renders all navigation links', () => {
        render(<Sidebar />)

        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Properties')).toBeInTheDocument()
        expect(screen.getByText('Tenants')).toBeInTheDocument()
        expect(screen.getByText('Vendors')).toBeInTheDocument()
        expect(screen.getByText('Work Orders')).toBeInTheDocument()
    })

    it('renders the user badge section', () => {
        render(<Sidebar />)

        expect(screen.getByText('AM')).toBeInTheDocument()
        expect(screen.getByText('Property Manager')).toBeInTheDocument()
    })
})
