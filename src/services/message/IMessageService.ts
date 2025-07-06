import type { MessageDTO } from "../../models/MessageDTO";

export interface IMessageService {
    getConversationMessages(conversationId: number): Promise<MessageDTO[]>;
}