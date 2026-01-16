import { AnalyticsEventType } from '@/shared/enums';
import type { Prisma } from '@prisma/client';

/* -------------------------------------------------------------------------- */
/*  Analytics Periods and Options                                             */
/* -------------------------------------------------------------------------- */

/**
 * Supported analytics periods for filtering.
 */
export const ANALYTICS_PERIODS = ['7d', '30d', 'all'] as const;

/**
 * Type representing a valid analytics period.
 */
export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

/**
 * Options for analytics period selection (for UI).
 */
export const PERIOD_OPTIONS: readonly {
	value: AnalyticsPeriod;
	label: string;
	aria: string;
}[] = [
	{ value: '7d', label: 'Last 7 days', aria: 'Last 7 days' },
	{ value: '30d', label: 'Last 30 days', aria: 'Last 30 days' },
	{ value: 'all', label: 'All Time', aria: 'All Time' },
] as const;

/* -------------------------------------------------------------------------- */
/*  Analytics Data Models                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Represents a time-series analytics bucket (e.g., daily).
 */
export interface AnalyticsBucket {
	date: string; // YYYY-MM-DD
	views: number;
	downloads: number;
}

/**
 * Analytics summary for a specific document link.
 */
export interface DocumentLinkStat {
	linkId: string;
	linkAlias?: string | null;
	linkUrl: string;
	lastViewed: string | null;
	lastDownloaded: string | null;
}

/**
 * Analytics summary for a document, including totals and per-link stats.
 */
export interface AnalyticsSummary {
	totalViews: number;
	totalDownloads: number;
	lastAccessed: string | null;
	documentLinkStats: DocumentLinkStat[];
	buckets: AnalyticsBucket[];
}

/**
 * Analytics event payload for logging document or link activity.
 */
export interface AnalyticsEvent {
	documentId: string;
	documentLinkId?: string;
	visitorId?: number;
	eventType: AnalyticsEventType;
	meta?: Prisma.InputJsonValue;
}

/**
 * Compact, ready-to-render metrics for a document (Phase 1 SSOT).
 */
export interface DocumentQuickStats {
	links: number; // Total document links (public + gated)
	visitors: number; // Visitor sessions (rows in DocumentLinkVisitor)
	uniqueContacts: number; // Distinct visitor e-mails (optional Phase 2 use)
	totalViews: number; // VIEW events count
	totalDownloads: number; // DOWNLOAD events count
	lastAccessed: string | null; // ISO timestamp of last view/download
}
