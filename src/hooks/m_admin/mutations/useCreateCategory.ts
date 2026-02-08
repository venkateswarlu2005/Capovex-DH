import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService } from '@/services/m_admin/category.service';

export const useCreateCategory = () => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: CategoryService.create,
		onSuccess: (_data, variables) => {
			// refresh categories of that department
			qc.invalidateQueries({
				queryKey: ['m_admin', 'categories', variables.departmentId],
			});

			// refresh department overview counts
			qc.invalidateQueries({
				queryKey: ['m_admin', 'departments'],
			});

			// refresh pending requests
			qc.invalidateQueries({
				queryKey: ['m_admin', 'requests'],
			});
		},
	});
};
