import { useQuery } from '@tanstack/react-query';
import { CategoryService } from '@/services/m_admin/category.service';

export const useCategories = (departmentId?: string) =>
	useQuery({
		queryKey: ['m_admin', 'categories', departmentId],
		queryFn: () => CategoryService.getByDepartment(departmentId!),
		enabled: !!departmentId,
	});
