/**
 * @file KPICard.tsx
 * @brief Reusable Key Performance Indicator (KPI) dashboard card.
 *
 * A highly aesthetic, accessible tracking card for primary dashboard metrics.
 * Designed with modern glassmorphic cues, subtle stroke outlines,
 * and a smooth hover lift animation. Follows WCAG 2.1 AA guidance
 * for color contrast and ARIA labelling.
 *
 * Used by: app/page.tsx (Dashboard)
 * Related: GOV-003 §5.3 (named constants), GOV-003 §8.2 (prop interfaces)
 *
 * @example
 * ```tsx
 * <KPICard
 *     title="Monthly Revenue"
 *     value="$124,500"
 *     icon={DollarSign}
 *     trend={{ value: 8.1, label: 'vs last month' }}
 * />
 * ```
 */
import { type LucideIcon } from 'lucide-react'

/* ─── Named Constants (GOV-003 §5.3 — no magic values) ─── */

/** Fallback placeholder when `value` is null or undefined. */
const MISSING_VALUE_PLACEHOLDER = '---' as const

/** Arrow glyphs indicating trend direction. */
const TREND_ARROW = { up: '↑', down: '↓' } as const

/** Tailwind color tokens keyed by trend direction. */
const TREND_COLORS = {
    positive: 'text-emerald-400',
    negative: 'text-rose-400',
} as const

/* ─── Interfaces (GOV-003 §8.2 — Props use interface, fields documented) ─── */

/** Optional trend indicator showing period-over-period change. */
interface TrendData {
    /**
     * Percentage change vs previous period.
     * Positive values render green with ↑, negative render red with ↓.
     */
    value: number
    /** Contextual label displayed after the percentage (e.g., "vs last month"). */
    label: string
}

/**
 * Props for the {@link KPICard} component.
 *
 * Every field is documented for IDE hover documentation and
 * onboarding clarity — a reviewer should never need to read
 * the implementation to understand the API contract.
 */
export interface KPICardProps {
    /** The metric label displayed above the value (e.g., "Total Properties"). */
    title: string
    /** The primary value to display. Accepts pre-formatted strings or raw numbers. */
    value: string | number
    /** Lucide icon component rendered inside the circular accent badge. */
    icon: LucideIcon
    /** Period-over-period trend. Omit to hide the trend row entirely. */
    trend?: TrendData
    /** When `true`, renders a pulsing skeleton placeholder instead of data. */
    loading?: boolean
}

/* ─── Component ─── */

/**
 * Renders a single dashboard metric card with optional trend indicator.
 *
 * **Design decisions:**
 * - Guard clause exits early for `loading` state (GOV-003 §7.1).
 * - Null-safe fallback for `value` prevents blank cards in edge cases.
 * - Semantic `<article>` with `aria-label` enables screen-reader navigation.
 * - `data-testid` attributes allow deterministic test selectors without
 *   coupling tests to CSS class names or text content.
 */
export default function KPICard({
    title,
    value,
    icon: Icon,
    trend,
    loading = false,
}: KPICardProps) {

    /* ── Guard: Loading state (GOV-003 §7.1 — early return) ── */
    if (loading) {
        return (
            <div
                role="status"
                aria-label={`Loading ${title}`}
                data-testid="kpi-skeleton"
                className="relative overflow-hidden rounded-xl border border-zinc-800
                           bg-zinc-900/50 p-6 shadow-sm backdrop-blur-xl"
            >
                <div className="flex animate-pulse items-center justify-between">
                    <div className="space-y-3">
                        <div className="h-4 w-24 rounded bg-zinc-800" />
                        <div className="h-8 w-32 rounded bg-zinc-700" />
                    </div>
                    <div className="h-10 w-10 rounded-full bg-zinc-800" />
                </div>
            </div>
        )
    }

    /* ── Derived values ── */

    /** Defensive fallback: prevents blank cards if upstream data is missing. */
    const safeValue = value ?? MISSING_VALUE_PLACEHOLDER

    /** Trend direction determines arrow glyph and color token. */
    const isPositive = trend !== undefined && trend.value >= 0
    const trendColor = isPositive ? TREND_COLORS.positive : TREND_COLORS.negative
    const trendArrow = isPositive ? TREND_ARROW.up : TREND_ARROW.down

    /* ── Render ── */
    return (
        <article
            aria-label={`${title}: ${safeValue}`}
            data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
            className="group relative overflow-hidden rounded-xl border border-zinc-800
                       bg-zinc-950/40 p-6 shadow-sm shadow-black/20 backdrop-blur-xl
                       transition-all duration-300
                       hover:-translate-y-1 hover:border-zinc-700
                       hover:bg-zinc-900/60 hover:shadow-md hover:shadow-white/5"
        >
            {/* Subtle top gradient accent — visible on hover for depth */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-px h-px bg-gradient-to-r
                           from-transparent via-zinc-500/30 to-transparent
                           transition-opacity duration-300 group-hover:via-zinc-400/50"
            />

            {/* Header: title + value + icon badge */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <h3 className="text-sm font-medium tracking-wide text-zinc-400">
                        {title}
                    </h3>
                    <div className="text-3xl font-semibold tracking-tight text-zinc-100">
                        {safeValue}
                    </div>
                </div>

                {/* Circular icon badge with hover glow */}
                <div
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-full
                               bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20
                               transition-colors duration-300
                               group-hover:bg-blue-500/20 group-hover:text-blue-300"
                >
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
            </div>

            {/* Trend indicator — only rendered when trend data is provided */}
            {trend !== undefined && (
                <div
                    data-testid="kpi-trend"
                    className="mt-4 flex items-center space-x-2 text-sm"
                >
                    <span className={`inline-flex items-center font-medium ${trendColor}`}>
                        <span className="mr-1">{trendArrow}</span>
                        {Math.abs(trend.value)}%
                    </span>
                    {trend.label && (
                        <span className="text-zinc-500">{trend.label}</span>
                    )}
                </div>
            )}
        </article>
    )
}
