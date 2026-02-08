import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	UserService,
	UpdateUserRolePayload,
} from '@/services/m_admin/user.service';

export const useUpdateUserRole = () => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateUserRolePayload) =>
			UserService.updateRole(payload),

		onSuccess: (_data, variables) => {
			// Refresh department detail
			if (variables.departmentId) {
				qc.invalidateQueries({
					queryKey: [
						'm_admin',
						'department',
						variables.departmentId,
					],
				});
			}

			// Refresh departments list (counts change)
			qc.invalidateQueries({
				queryKey: ['m_admin', 'departments'],
			});
		},
	});
};
