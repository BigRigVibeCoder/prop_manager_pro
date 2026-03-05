/**
 * @file page.tsx (Dashboard)
 * @brief Main execution dashboard with aggregated portfolio KPIs and charts.
 *
 * Displays a unified view of the real estate portfolio. Renders a grid of SVG-based
 * charts (revenue, expenses, occupancy, maintenance, vendor spend) to provide
 * high-level operational intelligence.
 *
 * Used by: app router — mounted at / (Root route)
 * Related: EVO-001 Sprint 5 (Reporting dashboards)
 */
'use client'

import React from 'react'
import {
    Building2, Users, DollarSign, Activity,
} from 'lucide-react'
import KPICard from '@/components/dashboard/KPICard'

/* ─── Constants ─── */

/** Maximum value for the revenue Y-axis scale. */
const MAX_REVENUE = 150000

/** Total spend threshold for vendor chart scaling. */
const MAX_VENDOR_SPEND = 20000

/* ─── Sub-Components (GOV-003 §4.1: smaller components) ─── */

/** Renders a 6-month historical revenue bar chart using raw SVG. */
function RevenueChart() {
    /** 6-month trailing revenue data. */
    const data = [
        { month: 'Oct', amount: 112400 },
        { month: 'Nov', amount: 118200 },
        { month: 'Dec', amount: 115800 },
        { month: 'Jan', amount: 120100 },
        { month: 'Feb', amount: 121900 },
        { month: 'Mar', amount: 124500 },
    ]

    return (
        <div className="col-span-12 lg:col-span-8 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="mb-6 flex items-center gap-2 font-medium text-zinc-100"><Activity className="h-4 w-4 text-blue-400" /> Revenue (Last 6 Months)</h3>
            <div className="space-y-4">
                {data.map((item) => (
                    <div key={item.month} className="flex items-center gap-4">
                        <span className="w-8 text-xs font-medium text-zinc-500">{item.month}</span>
                        <div className="flex-1">
                            <div className="h-6 w-full overflow-hidden rounded-md bg-zinc-900">
                                <div className="h-full bg-blue-500" style={{ width: `${(item.amount / MAX_REVENUE) * 100}%` }} />
                            </div>
                        </div>
                        <span className="w-16 text-right text-xs font-medium text-zinc-300">${item.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Renders a categorical expense breakdown using raw SVG circle definitions. */
function ExpenseChart() {
    /** Trailing 30-day expense rollup. */
    const expenses = [
        { name: 'Maintenance', amount: 18200, color: '#f59e0b', strokeOffset: 0, strokeDash: '35 100' },
        { name: 'Utilities', amount: 12400, color: '#3b82f6', strokeOffset: -35, strokeDash: '25 100' },
        { name: 'Tax', amount: 8900, color: '#ef4444', strokeOffset: -60, strokeDash: '15 100' },
        { name: 'Insurance', amount: 6200, color: '#10b981', strokeOffset: -75, strokeDash: '15 100' },
        { name: 'Other', amount: 4100, color: '#a855f7', strokeOffset: -90, strokeDash: '10 100' },
    ]

    return (
        <div className="col-span-12 lg:col-span-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="mb-6 flex items-center gap-2 font-medium text-zinc-100"><DollarSign className="h-4 w-4 text-purple-400" /> Expense Breakdown</h3>
            <div className="flex items-center justify-between">
                <div className="relative h-32 w-32 shrink-0">
                    <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                        <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#27272a" strokeWidth="4" />
                        {expenses.map((exp) => (
                            <circle key={exp.name} cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke={exp.color} strokeWidth="4" strokeDasharray={exp.strokeDash} strokeDashoffset={exp.strokeOffset} />
                        ))}
                    </svg>
                </div>
                <div className="space-y-2">
                    {expenses.map((exp) => (
                        <div key={exp.name} className="flex items-center gap-3 text-xs">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: exp.color }} />
                            <span className="text-zinc-400">{exp.name}</span>
                            <span className="font-medium text-zinc-200">${exp.amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/** Renders aggregate system statuses in the lower auxiliary grid. */
function AuxiliaryMetrics() {
    /** Top 5 vendors by billing volume. */
    const vendors = [
        { name: 'ProFlow Plumbing', spend: 12400 },
        { name: 'CoolAir HVAC', spend: 9800 },
        { name: 'AllPro Maintenance', spend: 7200 },
        { name: 'BrightSpark Electric', spend: 5600 },
        { name: 'GreenEdge Landscaping', spend: 3200 },
    ]

    /** Work order completion statuses. */
    const maintenance = [
        { status: 'Open', count: 2, perc: '15%', color: 'bg-blue-500' },
        { status: 'In Progress', count: 2, perc: '15%', color: 'bg-amber-500' },
        { status: 'Completed', count: 8, perc: '62%', color: 'bg-emerald-500' },
        { status: 'Cancelled', count: 1, perc: '8%', color: 'bg-rose-500' },
    ]

    return (
        <div className="grid grid-cols-12 gap-6 pb-12">
            {/* Occupancy Trend */}
            <div className="col-span-12 lg:col-span-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                <h3 className="mb-6 flex items-center gap-2 font-medium text-zinc-100"><Activity className="h-4 w-4 text-emerald-400" /> Occupancy Trend</h3>
                <div className="relative h-32 w-full">
                    <svg viewBox="0 0 100 40" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                        <path d="M0,40 L0,40 L20,40 L40,40 L60,20 L80,20 L100,28 L100,40 Z" fill="rgba(16, 185, 129, 0.1)" />
                        <path d="M0,40 L20,40 L40,40 L60,20 L80,20 L100,28" fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                    <div className="absolute bottom-0 flex w-full justify-between text-[10px] text-zinc-600">
                        <span>Oct (91%)</span><span>Nov (93%)</span><span>Dec (92%)</span><span>Jan (95%)</span><span>Feb (95%)</span><span>Mar (94%)</span>
                    </div>
                </div>
            </div>

            {/* Maintenance */}
            <div className="col-span-12 lg:col-span-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                <h3 className="mb-6 flex items-center gap-2 font-medium text-zinc-100"><WrenchIcon className="h-4 w-4 text-amber-500" /> Maintenance Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                    {maintenance.map((m) => (
                        <div key={m.status} className="rounded-lg border border-zinc-800/60 bg-zinc-900/50 p-3">
                            <div className="mb-2 flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${m.color}`} /><span className="text-xs text-zinc-400">{m.status}</span></div>
                            <div className="text-2xl font-bold text-zinc-100">{m.count}</div>
                            <div className="text-[10px] text-zinc-600">{m.perc} of total</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Vendor Spend */}
            <div className="col-span-12 lg:col-span-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                <h3 className="mb-6 flex items-center gap-2 font-medium text-zinc-100"><DollarSign className="h-4 w-4 text-rose-400 -ml-1" /> Top Vendor Spend</h3>
                <div className="space-y-3">
                    {vendors.map((v, i) => (
                        <div key={v.name} className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs"><span className="text-zinc-400"><span className="mr-2 text-zinc-600">{i + 1}</span>{v.name}</span><span className="font-medium text-zinc-300">${v.spend.toLocaleString()}</span></div>
                            <div className="h-1.5 w-full rounded-full bg-zinc-900"><div className="h-full rounded-full bg-rose-500" style={{ width: `${(v.spend / MAX_VENDOR_SPEND) * 100}%` }} /></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/** SVG Helper. */
function WrenchIcon(props: React.SVGProps<SVGSVGElement>) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
}

/* ─── Page Component ─── */

/**
 * Enterprise Dashboard (Root Route).
 * Renders the headline KPIs and delegates detailed reporting to
 * domain-specific sub-components.
 */
export default function Dashboard() {
    return (
        <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-white">Portfolio Overview</h2>
                <p className="mt-2 text-zinc-400">Welcome back. Here is the daily summary of your assets.</p>
            </div>

            {/* Primary KPI Row */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Properties" value="12" trend={{ value: 0, label: 'vs last month' }} icon={Building2} />
                <KPICard title="Current Tenants" value="48" trend={{ value: 4.2, label: 'vs last month' }} icon={Users} />
                <KPICard title="Monthly Revenue" value="$124,500" trend={{ value: 8.1, label: 'vs last month' }} icon={DollarSign} />
                <KPICard title="Occupancy Rate" value="94%" trend={{ value: -1.2, label: 'vs last month' }} icon={Activity} />
            </div>

            {/* Main Reporting Charts */}
            <div className="mb-6 grid grid-cols-12 gap-6">
                <RevenueChart />
                <ExpenseChart />
            </div>

            {/* Auxiliary Metrics */}
            <AuxiliaryMetrics />
        </div>
    )
}
