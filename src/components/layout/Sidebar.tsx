/**
 * @file Sidebar.tsx
 * @brief Persistent sidebar navigation component for the application shell.
 *
 * Renders the main navigation links (Dashboard, Properties, Tenants, Vendors,
 * Work Orders) with active-route highlighting. Mounted once in the root
 * layout and visible on every page.
 *
 * Used by: app/layout.tsx
 */
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    Building2,
    LayoutDashboard,
    BriefcaseBusiness,
    Wrench,
    Home,
    Users,
    ChevronRight,
} from 'lucide-react'

/* ─── Route Configuration ─── */

/** Navigation items rendered in the sidebar, in display order. */
const NAV_ITEMS = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Properties', href: '/properties', icon: Home },
    { label: 'Tenants', href: '/tenants', icon: Users },
    { label: 'Vendors', href: '/vendors', icon: BriefcaseBusiness },
    { label: 'Work Orders', href: '/work-orders', icon: Wrench },
] as const

/* ─── Component ─── */

/**
 * App-wide sidebar navigation with route-aware active highlighting.
 *
 * Renders the PropManage Pro brand mark, five navigation links, and a
 * static user badge. Active link is determined by comparing
 * `usePathname()` against each item's `href`.
 */
export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="flex h-screen w-56 flex-col border-r border-zinc-800/50 bg-zinc-950/90 backdrop-blur-xl">
            {/* Brand */}
            <div className="flex items-center gap-3 px-5 py-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                    <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-base font-semibold tracking-tight text-zinc-100">
                    PropManage Pro
                </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1 px-3 pt-2">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                                }`}
                        >
                            <Icon className="h-4.5 w-4.5" />
                            <span className="flex-1">{label}</span>
                            {isActive && (
                                <ChevronRight className="h-3.5 w-3.5 text-blue-400/60" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User Badge */}
            <div className="border-t border-zinc-800/50 px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-400">
                        AM
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-300">Admin</p>
                        <p className="text-xs text-zinc-600">Property Manager</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
