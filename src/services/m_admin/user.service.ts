export type UpdateUserRolePayload = {
	userId: string;
	role: string;
	departmentId?: string;
};

// src/services/m_admin/user.service.ts

export const UserService = {
  getAll: async () => {
    const res = await fetch('/api/admin/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  create: async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    role?: string;
    departmentId?: string;
  }) => {
    const res = await fetch('/api/admin/users', { // ✅ FIXED
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updateRole: async (payload: {
    userId: string;
    role: string;
    departmentId?: string;
  }) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(await res.text());
  },
};
