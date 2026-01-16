'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

import {
	AppBar,
	Box,
	Chip,
	CircularProgress,
	DialogContent,
	Fade,
	IconButton,
	Toolbar,
	Typography,
} from '@mui/material';

import { FileDownloadIcon, XCloseIcon } from '@/icons';

import { useToast } from '@/hooks';
import { downloadAndToast, useDocumentSignedUrl } from '@/hooks/data';

import { LoadPhase } from '@/shared/enums';
import { DocumentType } from '@/shared/models';
import { formatFileSize, isViewableFileType } from '@/shared/utils';

const PDFViewer = dynamic(() => import('@/components/fileHandling/PDFViewer'), {
	ssr: false,
});

interface Props {
	document: DocumentType;
	closeModal: () => void;
}

/**
 * Modal component for viewing and downloading a document file.
 * Supports PDF and image previews, and provides a download button.
 *
 * @param document   - The document object to display.
 * @param closeModal - Function to close the modal.
 * @returns The rendered modal component.
 */
export default function FileViewerModal({ document, closeModal }: Props) {
	const { showToast } = useToast();
	const { data, isLoading: urlLoading, error } = useDocumentSignedUrl(document.documentId);

	const [phase, setPhase] = useState<LoadPhase>(LoadPhase.Idle);
	const handlePdfMount = useCallback(() => setPhase(LoadPhase.Pdf), [setPhase]);
	const handlePdfReady = useCallback(() => setPhase(LoadPhase.Done), [setPhase]);

	const isPdf = document.fileType === 'application/pdf';
	const isImage = document.fileType.startsWith('image/');
	const canPreview = isViewableFileType(document.fileType);

	// Loading state: either waiting for signed URL or for preview to finish loading
	const loading = urlLoading || (canPreview && phase !== LoadPhase.Done);

	/**
	 * Handles file download when the download button is clicked.
	 * Shows a toast notification on success or failure.
	 */
	const handleDownload = useCallback(
		() => downloadAndToast(data?.signedUrl, document.fileName, showToast),
		[data?.signedUrl, document.fileName, showToast],
	);

	return (
		<Box
			display='flex'
			minHeight={isImage ? '40vh' : '93vh'}
			minWidth={isImage ? undefined : '40vw'}
			flexDirection='column'>
			{/* Top bar */}
			<AppBar
				position='static'
				elevation={0}
				color='default'>
				<Toolbar sx={{ display: 'flex', justifyContent: 'space-between', overflow: 'hidden' }}>
					<Box
						display='flex'
						alignItems='center'
						gap={5}
						overflow='hidden'>
						<Typography
							variant='h4'
							noWrap
							maxWidth='100%'>
							{document.fileName}
						</Typography>
						<Chip
							label={formatFileSize(document.size)}
							size='small'
							color='secondary'
							sx={{ fontWeight: 500 }}
						/>
						<IconButton
							onClick={handleDownload}
							disabled={urlLoading || !!error}>
							<FileDownloadIcon />
						</IconButton>
					</Box>

					<IconButton onClick={closeModal}>
						<XCloseIcon />
					</IconButton>
				</Toolbar>
			</AppBar>

			{/* Main content area */}
			<DialogContent
				sx={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					p: 1,
				}}>
				{/* Loading spinner */}
				{loading && !error && (
					<Box>
						<CircularProgress />
					</Box>
				)}

				{/* Error from signed-URL fetch */}
				{error && <Typography color='error'>{String(error)}</Typography>}

				{/* Unsupported preview */}
				{!loading && !canPreview && !error && (
					<Typography variant='body1'>Preview not available for this file type.</Typography>
				)}

				{/* Image preview */}
				{isImage && data?.signedUrl && (
					<Fade in={!loading}>
						<Box
							component='img'
							src={data.signedUrl}
							alt={document.fileName}
							maxHeight='100%'
							maxWidth='100%'
							sx={{ objectFit: 'contain', borderRadius: 1 }}
							onLoad={() => setPhase(LoadPhase.Done)}
						/>
					</Fade>
				)}

				{/* PDF preview */}
				{isPdf && data?.signedUrl && (
					<Fade in={!loading}>
						<Box
							width='100%'
							height='100%'>
							<PDFViewer
								url={data.signedUrl}
								documentId={document.documentId}
								onMount={handlePdfMount}
								onReady={handlePdfReady}
								maxViewHeight='200px'
								skipAnalytics={true}
							/>
						</Box>
					</Fade>
				)}
			</DialogContent>
		</Box>
	);
}
