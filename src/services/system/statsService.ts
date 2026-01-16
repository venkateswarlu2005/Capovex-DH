import { logError } from '@/lib/logger';
import prisma from '@/lib/prisma';

import { ServiceError } from '@/services';

import { AnalyticsEventType } from '@/shared/enums';
import type { DocumentQuickStats } from '@/shared/models';

/**
 * statsService
 * -----------------------------------------------------------------------------
 * Single-source helper for compact analytics counts used by list & detail APIs.
 *
 * All queries are batched with Promise.all to minimise round-trips. For now we
 * expose only per-document stats; a bulk variant can be added later without
 * breaking callers.
 */
export const statsService = {
	/**
	 * Returns pre-digested "quick stats" for one document.
	 *
	 * @param documentId - The unique identifier of the document.
	 * @returns An object containing quick stats for the document:
	 *   - links: Total DocumentLink rows.
	 *   - visitors: Total DocumentLinkVisitor rows (across all links).
	 *   - uniqueContacts: Distinct non-empty visitor e-mails.
	 *   - totalViews: Total VIEW events.
	 *   - totalDownloads: Total DOWNLOAD events.
	 *   - lastAccessed: Most-recent VIEW / DOWNLOAD timestamp or null.
	 * @throws ServiceError if the statistics computation fails.
	 */
	async getQuickStatsForDocument(documentId: string): Promise<DocumentQuickStats> {
		try {
			/* ------------------------------------------------------------------ */
			/*  Fire four independent aggregates in parallel                      */
			/* ------------------------------------------------------------------ */
			const [linkCount, visitorCount, uniqueEmailRows, analyticsRows] = await Promise.all([
				/* total links ----------------------------------------------------- */
				prisma.documentLink.count({ where: { documentId } }),

				/* total visitor sessions ----------------------------------------- */
				prisma.documentLinkVisitor.count({
					where: { documentLink: { documentId } },
				}),

				/* unique e-mail contacts ----------------------------------------- */
				prisma.documentLinkVisitor.groupBy({
					by: ['email'],
					where: {
						documentLink: { documentId },
						email: { not: '' },
					},
					_count: { email: true },
				}),

				/* views / downloads & lastAccessed ------------------------------- */
				prisma.documentAnalytics.groupBy({
					by: ['eventType'],
					where: { documentId },
					_count: { eventType: true },
					_max: { timestamp: true },
				}),
			]);

			/* ------------------------------------------------------------------ */
			/*  Reduce analytics rows into totals / lastAccessed                  */
			/* ------------------------------------------------------------------ */
			let totalViews = 0;
			let totalDownloads = 0;
			let lastAccessed: Date | null = null;

			analyticsRows.forEach((row) => {
				if (row.eventType === AnalyticsEventType.VIEW) {
					totalViews = row._count.eventType;
				} else {
					totalDownloads = row._count.eventType;
				}

				const ts = row._max.timestamp;
				if (ts && (!lastAccessed || ts > lastAccessed)) lastAccessed = ts;
			});

			let lastAccessedIso: string | null = null;
			if (lastAccessed) {
				const date = typeof lastAccessed === 'string' ? new Date(lastAccessed) : lastAccessed;
				lastAccessedIso = date.toISOString();
			}

			/* ------------------------------------------------------------------ */
			/*  Assemble response                                                 */
			/* ------------------------------------------------------------------ */
			return {
				links: linkCount,
				visitors: visitorCount,
				uniqueContacts: uniqueEmailRows.length,
				totalViews,
				totalDownloads,
				lastAccessed: lastAccessedIso,
			};
		} catch (err) {
			logError('[statsService] Failed to compute quick stats:', err);
			throw new ServiceError('Failed to compute document statistics', 500);
		}
	},
};
