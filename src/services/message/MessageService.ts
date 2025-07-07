import type { IMessageService } from './IMessageService';
import { MessageDTO } from '../../models/MessageDTO.ts';
import { SessionManager } from '../../managers/SessionManager.tsx';
import { ApiConstants } from '../../utils/ApiConstants.ts';

// Shape of a message as it comes from the backend (plain JSON)
interface MessageJSON {
    username: string;
    messageContent: string;
    messageDateTime: string;
}

export class MessageService implements IMessageService {
    async getConversationMessages(conversationId: number): Promise<MessageDTO[]> {
        const token = SessionManager.getInstance().getToken();
        const url = `${ApiConstants.MESSAGE_ENDPOINT}/${conversationId}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const errorBody = await response.clone().text();
                console.error(
                    `Failed to fetch messages. Status: ${response.status}. Body: ${errorBody}`,
                );
                return [];
            }
            const rawMessages = (await response.json()) as MessageJSON[];

            const messages: MessageDTO[] = rawMessages.map(
                (m) => new MessageDTO(m.username, m.messageContent, m.messageDateTime),
            );

            console.log('Fetched messages:', messages);
            return messages;
        } catch (error) {
            console.error('Error fetching conversation messages:', error);
            return [];
        }
    }
}
