import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/m_admin/dashboard.service';

export const useDashboardStats = () =>
	useQuery({
		queryKey: ['m_admin', 'dashboard-stats'],
		queryFn: DashboardService.getStats,
	});

export const useDashboardActivity = () =>
	useQuery({
		queryKey: ['m_admin', 'dashboard-activity'],
		queryFn: DashboardService.getActivity,
	});
