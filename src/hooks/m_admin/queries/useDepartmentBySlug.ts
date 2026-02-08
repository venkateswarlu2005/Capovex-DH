import { useQuery } from '@tanstack/react-query';
import { DepartmentService } from '@/services/m_admin/department.service';

export const useDepartmentBySlug = (slug: string) =>
	useQuery({
		queryKey: ['m_admin', 'department', slug],
		queryFn: () => DepartmentService.getBySlug(slug),
		enabled: !!slug,
	});
