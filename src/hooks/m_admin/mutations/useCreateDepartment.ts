import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DepartmentService } from '@/services/m_admin/department.service';

export const useCreateDepartment = () => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: DepartmentService.create,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['m_admin', 'departments'] });
		},
	});
};
