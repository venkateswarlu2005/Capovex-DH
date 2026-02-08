export type CreateCategoryPayload = {
	departmentId: string;
	name: string;
};

export const CategoryService = {
	getByDepartment: async (departmentId: string) => {
		const res = await fetch(
			`/api/categories?departmentId=${departmentId}`,
			{ cache: 'no-store' }
		);
		if (!res.ok) throw new Error('Failed to fetch categories');
		return res.json();
	},

	create: async (payload: CreateCategoryPayload) => {
		const res = await fetch('/api/categories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		if (!res.ok) throw new Error(await res.text());
	},
};
