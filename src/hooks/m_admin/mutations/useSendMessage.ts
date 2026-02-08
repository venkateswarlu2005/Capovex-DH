import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService } from '@/services/m_admin/chat.service';

export const useSendMessage = () => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ChatService.sendMessage,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['m_admin', 'chat-messages'] });
		},
	});
};
