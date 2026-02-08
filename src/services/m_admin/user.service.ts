export type UpdateUserRolePayload = {
	userId: string;
	role: string;
	departmentId?: string;
};

export const UserService = {
	getAll: async () => {
		const res = await fetch('/api/admin/users', {
			cache: 'no-store',
		});
		if (!res.ok) throw new Error('Failed to fetch users');
		return res.json();
	},

	updateRole: async (payload: UpdateUserRolePayload) => {
		const res = await fetch('/api/admin/users', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		if (!res.ok) throw new Error(await res.text());
	},
};
