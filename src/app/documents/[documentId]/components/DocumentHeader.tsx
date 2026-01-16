/* -------------------------------------------------------------------------- */
/*  src/app/documents/[documentId]/components/DocumentHeader.tsx              */
/* -------------------------------------------------------------------------- */

'use client';

import { useCallback } from 'react';

import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { CreateLinkIcon, FileDownloadIcon, FilePreviewIcon } from '@/icons';

import { useToast } from '@/hooks';
import { downloadAndToast, useDocumentSignedUrl } from '@/hooks/data';
import { useModalContext } from '@/providers/modal/ModalProvider';

import { FileTypeConfig } from '@/shared/config/fileIcons';
import { DocumentType } from '@/shared/models';
import { formatDateTime, formatFileSize, isViewableFileType } from '@/shared/utils';

interface DocumentHeaderProps {
	document: DocumentType;
}

/**
 * DocumentHeader
 * ---------------------------------------------------------------------------
 * Renders:
 *   • file-name + type icon
 *   • version & “last updated”
 *   • Action-bar:  View / Download / Create-Link
 *
 *   - Uses `useDocumentSignedUrl` for secure downloads
 *   - Opens existing modals (fileViewer / linkCreate) via ModalProvider
 */
export default function DocumentHeader({ document }: DocumentHeaderProps) {
	const { openModal } = useModalContext();
	const { showToast } = useToast();

	const {
		data,
		isLoading: urlLoading,
		error: urlError,
	} = useDocumentSignedUrl(document.documentId);

	/* -------------------------------------------------------------------- */
	/*  Helpers                                                             */
	/* -------------------------------------------------------------------- */
	const canPreview = isViewableFileType(document.fileType);
	const disabledDownload = urlLoading || !!urlError;

	const openViewer = () =>
		canPreview &&
		openModal({
			type: 'fileViewer',
			contentProps: { document },
		});

	const openCreateLink = () =>
		openModal({
			type: 'linkCreate',
			contentProps: {
				documentId: document.documentId,
				onLinkGenerated: (linkUrl: string) =>
					openModal({ type: 'linkCopy', contentProps: { linkUrl } }),
			},
		});

	const handleDownload = useCallback(
		() => downloadAndToast(data?.signedUrl, document.fileName, showToast),
		[data?.signedUrl, document.fileName, showToast],
	);

	/* -------------------------------------------------------------------- */
	/*  Render                                                              */
	/* -------------------------------------------------------------------- */
	return (
		<Box
			mb={10}
			display='flex'
			alignItems='center'
			justifyContent='space-between'
			flexWrap='wrap'>
			{/* ── meta data (left) ─────────────────────────────── */}
			<Box>
				<Box
					display='flex'
					alignItems='center'>
					<Typography
						variant='h2'
						sx={{ wordBreak: 'break-all' }}>
						{document.fileName}
					</Typography>
				</Box>

				<Typography
					variant='body2'
					component='div'
					display='flex'
					alignItems='center'
					gap={4}
					mt={3}>
					<span>Version&nbsp;1</span>
					<span>—</span>
					<span>Last updated: {formatDateTime(document.updatedAt)}</span>
					<Chip
						label={formatFileSize(document.size)}
						size='small'
						color='secondary'
						sx={{ ml: 2 }}
					/>
					<Box
						component={FileTypeConfig[document.fileType] || FileTypeConfig['General']}
						sx={{ width: 24, height: 24 }}
					/>
				</Typography>
			</Box>

			{/* ── Action Bar ──────────────────────────────────────────────── */}
			<Stack
				direction='row'
				spacing={1.5}
				mt={{ xs: 4, sm: 0 }}>
				{/* preview */}
				{canPreview && (
					<Tooltip title={urlError ? 'Unable to fetch secure URL' : 'Preview file'}>
						<IconButton
							onClick={openViewer}
							disabled={disabledDownload}>
							<FilePreviewIcon
								width={35}
								height={35}
								strokeWidth={1.5}
							/>
						</IconButton>
					</Tooltip>
				)}

				{/* download */}
				<Tooltip title={urlError ? 'Unable to fetch secure URL' : 'Download file'}>
					<IconButton
						onClick={handleDownload}
						disabled={disabledDownload}>
						<FileDownloadIcon
							width={35}
							height={35}
							strokeWidth={1.5}
						/>
					</IconButton>
				</Tooltip>

				{/* create link */}
				{document.stats.links >= 0 && (
					<Tooltip title='Create a link'>
						<IconButton onClick={openCreateLink}>
							<CreateLinkIcon
								width={35}
								height={35}
								strokeWidth={1.4}
							/>
						</IconButton>
					</Tooltip>
				)}
			</Stack>
		</Box>
	);
}
