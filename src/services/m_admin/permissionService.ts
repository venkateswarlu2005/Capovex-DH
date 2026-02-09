export interface PermissionPayload {
  targetUserId: string;
  categoryId: string;
  canUpload?: boolean;
  canDelete?: boolean;
}

export const permissionService = {
  // POST: Grants or Updates access
  grantPermission: async (payload: PermissionPayload) => {
    const response = await fetch('/api/admin/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to grant permission');
    }
    return response.json();
  },

  // DELETE: Revokes access
  revokePermission: async (userId: string, categoryId: string) => {
    const response = await fetch(`/api/admin/permissions?userId=${userId}&categoryId=${categoryId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to revoke permission');
    }
    return response.json();
  }
};