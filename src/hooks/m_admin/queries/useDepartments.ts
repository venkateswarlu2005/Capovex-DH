import { useQuery } from '@tanstack/react-query';
import { DepartmentService } from '@/services/m_admin/department.service';

export const useDepartments = () =>
	useQuery({
		queryKey: ['m_admin', 'departments'],
		queryFn: DepartmentService.getAll,
	});
