export const RequestService = {
	getAll: async () => {
		const res = await fetch('/api/requests', { cache: 'no-store' });
		if (!res.ok) return [];
		return res.json();
	},

	updateStatus: async (
		id: string,
		status: 'APPROVED' | 'REJECTED'
	) => {
		const res = await fetch(`/api/requests/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status }),
		});
		if (!res.ok) throw new Error(await res.text());
	},
};
