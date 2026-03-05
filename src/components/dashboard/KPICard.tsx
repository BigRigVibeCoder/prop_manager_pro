/**
 * @file KPICard.tsx
 * @brief Reusable Key Performance Indicator (KPI) dashboard card.
 *
 * A highly aesthetic tracking card for primary dashboard metrics.
 * Designed with modern glassmorphic cues, subtle stroke outlines,
 * and a smooth hover lift animation.
 *
 * Used by: app/page.tsx
 */
import { type LucideIcon } from 'lucide-react'

/* ─── Interfaces ─── */

/** Props for the KPICard component. */
export interface KPICardProps {
    /** The main label/title of the metric. */
    title: string
    /** The primary value to display (e.g., "$124,500" or "94%"). */
    value: string | number
    /** Lucide component to render inside the circular badge. */
    icon: LucideIcon
    /** Percentage change vs previous period (positive = green up, negative = red down). */
    trend?: {
        value: number
        label: string
    }
    /** If true, renders a pulsing skeleton state instead of data. */
    loading?: boolean
}

/* ─── Component ─── */

/**
 * Renders a single dashboard metric with an optional trend indicator.
 * Displays a skeleton state if `loading` is true.
 */
export default function KPICard({
    title,
    value,
    icon: Icon,
    trend,
    loading = false,
}: KPICardProps) {
    /* Handle loading state first (Guard Clause). */
    if (loading) {
        return (
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-xl">
                <div className="flex animate-pulse items-center justify-between">
                    <div className="space-y-3">
                        <div className="h-4 w-24 rounded bg-zinc-800"></div>
                        <div className="h-8 w-32 rounded bg-zinc-700"></div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-zinc-800"></div>
                </div>
            </div>
        )
    }

    /* Handle boundary condition: missing value. */
    const safeValue = value ?? '---'

    /* Calculate trend styles. */
    const isPositive = trend !== undefined && trend.value >= 0
    const trendColor = isPositive ? 'text-emerald-400' : 'text-rose-400'
    const TrendIcon = isPositive ? '↑' : '↓'

    return (
        <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/40 p-6 shadow-sm shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/60 hover:shadow-md hover:shadow-white/5">
            {/* Subtle top gradient accent */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-zinc-500/30 to-transparent transition-opacity duration-300 group-hover:via-zinc-400/50" />

            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <h3 className="text-sm font-medium tracking-wide text-zinc-400">{title}</h3>
                    <div className="text-3xl font-semibold tracking-tight text-zinc-100">
                        {safeValue}
                    </div>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors duration-300">
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
            </div>

            {trend !== undefined && (
                <div className="mt-4 flex items-center space-x-2 text-sm">
                    <span className={`inline-flex items-center font-medium ${trendColor}`}>
                        <span className="mr-1">{TrendIcon}</span>
                        {Math.abs(trend.value)}%
                    </span>
                    {trend.label && <span className="text-zinc-500">{trend.label}</span>}
                </div>
            )}
        </div>
    )
}
