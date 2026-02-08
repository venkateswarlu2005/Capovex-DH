import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/services/m_admin/user.service';

export const useCreateUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: UserService.create,

    onSuccess: (_data, variables) => {

      qc.invalidateQueries({
        queryKey: ['m_admin', 'users'],
      });

      // If user attached to department
      if (variables.departmentId) {
        qc.invalidateQueries({
          queryKey: ['m_admin', 'department', variables.departmentId],
        });
      }

      // Department counts may change
      qc.invalidateQueries({
        queryKey: ['m_admin', 'departments'],
      });
    },
  });
};
