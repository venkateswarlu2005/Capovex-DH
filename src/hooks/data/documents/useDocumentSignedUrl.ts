import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/queryKeys';
import { downloadFile } from '@/shared/utils';

interface SignedUrlResponse {
	signedUrl: string;
}

/* helper – DRY download logic across components */
export async function downloadAndToast(
	signedUrl: string | undefined,
	filename: string,
	showToast: (opts: { message: string; variant: 'info' | 'error' }) => void,
) {
	if (!signedUrl) return;
	try {
		await downloadFile(signedUrl, filename);
		showToast({ message: 'Download started', variant: 'info' });
	} catch {
		showToast({ message: 'Download failed', variant: 'error' });
	}
}

/**
 * Fetches a fresh signed URL for the given documentId.
 * Caches it for 5 minutes (TTL matches server-side expiry).
 */
const fetchSignedUrl = async (documentId: string): Promise<SignedUrlResponse> => {
	const { data } = await axios.get(`/api/documents/${documentId}/signed-url`);
	return data;
};

const useDocumentSignedUrl = (documentId?: string) =>
	useQuery({
		queryKey: queryKeys.documents.signedUrl(documentId ?? ''),
		queryFn: () => fetchSignedUrl(documentId as string),
		enabled: !!documentId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

export default useDocumentSignedUrl;
