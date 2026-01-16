import { useState } from 'react';

import { logDebug } from '@/lib/logger';

import { Menu, MenuItem, Typography } from '@mui/material';

import CreateLink from './CreateLink';
import ShareLinkDialog from './ShareLinkDialog';

import { useToast } from '@/hooks';
import { useModalContext } from '@/providers/modal/ModalProvider';

import { DocumentType } from '@/shared/models';
import { isViewableFileType } from '@/shared/utils';

interface Props {
	open: boolean;
	document: DocumentType;
	onClose: () => void;
	anchorEl: HTMLElement | null;
	onDelete: (documentId: string) => void;
	onAnalytics?: () => void;
}

/**
 * ActionMenu component for document actions such as view, share, analytics, and delete.
 * Integrates with modal context to open dialogs for sharing, deleting, and uploading documents.
 *
 * @param anchorEl    - The anchor element for the menu.
 * @param open        - Whether the menu is open.
 * @param onClose     - Function to close the menu.
 * @param document    - The document object for which actions are available.
 * @param onDelete    - Callback to delete the document.
 * @param onAnalytics - (Optional) Callback to view analytics for the document.
 * @returns The rendered action menu component.
 */
export default function ActionMenu({
	anchorEl,
	open,
	onClose,
	document,
	onDelete,
	onAnalytics,
}: Props) {
	const { openModal } = useModalContext();
	const { showToast } = useToast();

	// Outdated code for opening a create link dialog --- STARTS
	const [newLinkUrl, setNewLinkUrl] = useState('');
	const [createLinkOpen, setCreateLinkOpen] = useState(false);

	/**
	 * Deprecated: Opens the old create link dialog.
	 */
	function DeprecatedhandleOpenCreateLink() {
		setCreateLinkOpen(true);
		// onClose();
	}
	/**
	 * Deprecated: Handles closing the old create link dialog.
	 * @param action - The action taken in the dialog.
	 * @param createdLink - The created link URL, if any.
	 */
	function DeprecatedhandleCloseCreateLink(action: string, createdLink?: string) {
		setCreateLinkOpen(false);
		if (createdLink) {
			setNewLinkUrl(createdLink);
		}
	}
	// Outdated code for opening a create link dialog --- ENDS

	/**
	 * Opens the modern create link modal and, on link generation, opens the copy link modal.
	 */
	const handleOpenCreateLink = () => {
		openModal({
			type: 'linkCreate',
			contentProps: {
				documentId: document.documentId,
				onLinkGenerated: (linkUrl: string) => {
					openModal({
						type: 'linkCopy',
						contentProps: { linkUrl },
					});
				},
			},
		});
		onClose();
	};

	/**
	 * Opens the delete confirmation modal for the document.
	 */
	const handleDelete = () => {
		openModal({
			type: 'deleteConfirm',
			contentProps: {
				description:
					'When you delete this file, all the links associated with the file will also be removed. This action is non-reversible.',
				onConfirm: () => {
					onDelete(document.documentId);
				},
			},
		});
	};

	/**
	 * Opens the upload file modal for updating the document.
	 */
	const handleUpload = () => {
		openModal({
			type: 'uploadFile',
			contentProps: {
				title: 'Update with a new document',
				description: 'When you update with a new document, the current link won’t change.',
				onUploadComplete: () => {
					logDebug('Document updated successfully!');
					showToast({
						message: 'Document updated successfully!',
						variant: 'success',
					});
				},
			},
		});
	};

	/**
	 * Opens the file viewer modal for previewing the document.
	 */
	const handleFilePreview = () => {
		openModal({ type: 'fileViewer', contentProps: { document } });
	};

	// Check if the document can be previewed
	const canPreview = isViewableFileType(document.fileType);

	return (
		<>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={onClose}
				disableScrollLock={true}>
				{onAnalytics && <MenuItem onClick={onAnalytics}>View Details</MenuItem>}
				<MenuItem onClick={handleOpenCreateLink}>Share</MenuItem>
				{canPreview && <MenuItem onClick={handleFilePreview}>Preview</MenuItem>}
				<MenuItem onClick={handleDelete}>
					<Typography
						variant='body1'
						color='error'>
						Delete
					</Typography>
				</MenuItem>
			</Menu>

			{/* Uncomment the following lines to enable the OLD CreateLink and ShareLinkDialog components */}
			{/* CREATE LINK DIALOG */}
			<CreateLink
				open={createLinkOpen}
				documentId={document.documentId}
				onClose={DeprecatedhandleCloseCreateLink}
			/>

			{/* SHAREABLE LINK DIALOG */}
			<ShareLinkDialog
				linkUrl={newLinkUrl}
				onClose={() => setNewLinkUrl('')} // hide the dialog
			/>
		</>
	);
}
