export const DashboardService = {
	getStats: async () => {
		const res = await fetch('/api/dashboard/stats');
		return res.json();
	},

	getActivity: async () => {
		const res = await fetch('/api/dashboard/activity');
		return res.json();
	},
};
