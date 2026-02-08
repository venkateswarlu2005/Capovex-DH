import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUploadDocument = () => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async ({
			file,
			categoryId,
		}: {
			file: File;
			categoryId: string;
		}) => {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('categoryId', categoryId);

			const res = await fetch('/api/documents', {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) throw new Error('Upload failed');
		},

		onSuccess: () => {
			// refresh dashboard stats
			qc.invalidateQueries({
				queryKey: ['m_admin', 'dashboard-stats'],
			});

			// refresh departments (storage usage)
			qc.invalidateQueries({
				queryKey: ['m_admin', 'departments'],
			});

			// refresh categories
			qc.invalidateQueries({
				queryKey: ['m_admin', 'categories'],
			});
		},
	});
};
