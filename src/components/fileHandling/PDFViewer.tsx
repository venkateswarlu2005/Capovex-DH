'use client';

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Box, Typography } from '@mui/material';

import { useCreateDocumentAnalyticsMutation } from '@/hooks/data';

import Paginator from '../navigation/Paginator';

import { AnalyticsEventType } from '@/shared/enums';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
	url: string;
	documentId: string;
	linkId?: string;
	visitorId?: number;
	skipAnalytics?: boolean;
	enableKeyboardPaging?: boolean;
	maxViewHeight?: string;
	onReady?: () => void;
	onMount?: () => void;
}

/**
 * PDFViewer component for rendering and paginating PDF files.
 * Tracks analytics for document views and supports keyboard navigation.
 *
 * @param url                 - The signed URL of the PDF file.
 * @param documentId          - The document's unique identifier.
 * @param linkId              - (Optional) The link ID if viewing via a shared link.
 * @param visitorId           - (Optional) The visitor's ID for analytics.
 * @param skipAnalytics       - If true, disables analytics tracking.
 * @param enableKeyboardPaging- If true, enables left/right arrow key navigation.
 * @param maxViewHeight       - The maximum height of the viewer.
 * @param onReady             - Callback when the PDF is fully loaded or fails.
 * @param onMount             - Callback when the component is mounted.
 * @returns The rendered PDF viewer component.
 */
export default function PDFViewer({
	url,
	documentId,
	linkId,
	visitorId,
	skipAnalytics = false,
	enableKeyboardPaging = true,
	maxViewHeight,
	onReady,
	onMount,
}: PDFViewerProps) {
	const [numPages, setNumPages] = useState<number>();
	const [page, setPage] = useState<number | null>(null);
	const logged = useRef(false); // ensures single VIEW row
	const analytics = useCreateDocumentAnalyticsMutation();

	const [error, setError] = useState<Error | null>(null);

	// Call onMount callback when component mounts
	useEffect(() => {
		onMount?.();
	}, [onMount]);

	// Keyboard navigation for paging
	useEffect(() => {
		if (!enableKeyboardPaging || !numPages) return;

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft' && page && page > 1) {
				setPage(page - 1);
			}
			if (e.key === 'ArrowRight' && page && page < numPages) {
				setPage(page + 1);
			}
		};

		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [enableKeyboardPaging, page, numPages]);

	/**
	 * Tracks a file view event for analytics, only once per session.
	 */
	const trackFileView = () => {
		if (logged.current || skipAnalytics) return;
		analytics.mutateAsync({
			documentId,
			documentLinkId: linkId ?? '',
			eventType: AnalyticsEventType.VIEW,
			visitorId,
		});
		logged.current = true;
	};

	return (
		<>
			<Box
				display='flex'
				flexDirection='column'
				alignItems='center'
				maxHeight={`calc(100vh - ${maxViewHeight ?? '245px'})`}
				mx='auto'
				my={4}
				px={2}
				tabIndex={0}
				sx={{
					border: 1,
					borderColor: 'divider',
					borderRadius: 2,
					boxShadow: 2,
					overflowY: 'auto',
				}}>
				<Document
					file={url}
					onLoadSuccess={({ numPages }) => {
						setNumPages(numPages);
						setPage(1);
						trackFileView();
						onReady?.();
					}}
					loading={null}
					onLoadError={(e) => {
						setError(e);
						onReady?.();
					}}
					error={
						<Typography
							color='error'
							align='center'
							py={4}>
							{error?.message || 'Failed to load PDF'}
						</Typography>
					}>
					{page && (
						<Page
							pageNumber={page}
							width={780}
							renderTextLayer={false}
							renderAnnotationLayer={false}
						/>
					)}
				</Document>
			</Box>
			{numPages && numPages > 1 && page && (
				<Paginator
					size='sm'
					nextPage={page}
					totalPages={numPages}
					pageSize={1}
					totalItems={numPages}
					onPageChange={setPage}
				/>
			)}
		</>
	);
}
