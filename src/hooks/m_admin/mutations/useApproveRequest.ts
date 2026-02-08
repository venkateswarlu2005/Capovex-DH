import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RequestService } from '@/services/m_admin/request.service';

type Payload = {
	id: string;
	status: 'APPROVED' | 'REJECTED';
};

export const useApproveRequest = () => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({ id, status }: Payload) =>
			RequestService.updateStatus(id, status),

		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['m_admin', 'requests'] });
			qc.invalidateQueries({
				queryKey: ['m_admin', 'dashboard-stats'],
			});
		},
	});
};
