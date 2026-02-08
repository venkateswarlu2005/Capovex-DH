import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/services/m_admin/user.service';

export const useUsers = () =>
  useQuery({
    queryKey: ['m_admin', 'users'],
    queryFn: UserService.getAll,
  });

