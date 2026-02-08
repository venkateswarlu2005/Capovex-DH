import { useQuery } from '@tanstack/react-query';
import { ChatService } from '@/services/m_admin/chat.service';

export const useChatChannels = () =>
	useQuery({
		queryKey: ['m_admin', 'chat-channels'],
		queryFn: ChatService.getChannels,
	});

export const useChatMessages = (params?: URLSearchParams) =>
	useQuery({
		queryKey: ['m_admin', 'chat-messages', params?.toString()],
		queryFn: () => ChatService.getMessages(params!),
		enabled: !!params,
	});
