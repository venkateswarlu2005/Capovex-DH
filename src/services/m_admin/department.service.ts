export type CreateDepartmentPayload = {
	name: string;
	description?: string;
};

export const DepartmentService = {
	getAll: async () => {
		const res = await fetch('/api/departments', { cache: 'no-store' });
		if (!res.ok) throw new Error('Failed to fetch departments');
		return res.json();
	},

	create: async (payload: CreateDepartmentPayload) => {
		const res = await fetch('/api/departments', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		if (!res.ok) throw new Error(await res.text());
	},

	getBySlug: async (slug: string) => {
		const res = await fetch('/api/departments', { cache: 'no-store' });
		if (!res.ok) throw new Error('Failed to fetch departments');

		const depts = await res.json();
		return depts.find(
			(d: any) =>
				d.id === slug ||
				d.name.toLowerCase() === slug.toLowerCase()
		);
	},
};
