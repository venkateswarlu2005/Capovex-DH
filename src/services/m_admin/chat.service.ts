export const ChatService = {
	getChannels: async () => {
		const res = await fetch('/api/chat/channels');
		return res.json();
	},

	getMessages: async (params: URLSearchParams) => {
		const res = await fetch(`/api/chat?${params.toString()}`);
		return res.json();
	},

	sendMessage: async (payload: any) => {
		await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	},
};
