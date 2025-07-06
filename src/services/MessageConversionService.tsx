import { MessageDTO } from '../models/MessageDTO';
import { MessageWSDTO } from '../models/MessageWSDTO';

export class MessageConversionService {

    public convertWebSocketToDTO(wsMessage: MessageWSDTO | null): MessageDTO | null {
        if (wsMessage === null) {
            return null;
        }

        const sender = wsMessage.getSender();
        const content = wsMessage.getContent();
        const timestamp = wsMessage.getTimestamp();

        if (!sender || !content || !timestamp) {
            return null;
        }

        const dto = new MessageDTO();
        dto.setUsername(sender);
        dto.setMessageContent(content);
        dto.setMessageDateTime(timestamp);

        return dto;
    }
}