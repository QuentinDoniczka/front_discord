import type { IMessageService } from './IMessageService';
import type { MessageDTO } from '../../models/MessageDTO';
import { SessionManager } from '../../managers/SessionManager';
import { ApiConstants } from '../../utils/ApiConstants';

export class MessageService implements IMessageService {

    async getConversationMessages(conversationId: number): Promise<MessageDTO[]> {
        try {
            const token = SessionManager.getInstance().getToken();
            const url = `${ApiConstants.MESSAGE_ENDPOINT}/${conversationId}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            console.log('Response: ' + await response.text());

            if (response.status === 200) {
                const messages: MessageDTO[] = await response.json();
                return messages;
            } else {
                console.error(`Failed to fetch messages. Status code: ${response.status}`);
                return [];
            }
        } catch (error) {
            console.error('Error fetching conversation messages:', error);
            return [];
        }
    }
}