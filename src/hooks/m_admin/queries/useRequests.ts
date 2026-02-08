import { useQuery } from '@tanstack/react-query';
import { RequestService } from '@/services/m_admin/request.service';

export const useRequests = () =>
	useQuery({
		queryKey: ['m_admin', 'requests'],
		queryFn: RequestService.getAll,
	});
