import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionService } from '@/services/m_admin/permissionService';
import { toast } from 'react-hot-toast';

interface SyncPayload {
  userId: string;
  newCategoryIds: string[];
  existingCategoryIds: string[];
}

export const useSyncPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newCategoryIds, existingCategoryIds }: SyncPayload) => {
      // 1. Identify which to add (in new but not in existing)
      const toAdd = newCategoryIds.filter(id => !existingCategoryIds.includes(id));

      // 2. Identify which to remove (in existing but not in new)
      const toRemove = existingCategoryIds.filter(id => !newCategoryIds.includes(id));

      // 3. Execute all API calls in parallel
      const addPromises = toAdd.map(catId =>
        permissionService.grantPermission({ targetUserId: userId, categoryId: catId, canUpload: true })
      );

      const removePromises = toRemove.map(catId =>
        permissionService.revokePermission(userId, catId)
      );

      return Promise.all([...addPromises, ...removePromises]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Permissions updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to sync permissions');
    }
  });
};