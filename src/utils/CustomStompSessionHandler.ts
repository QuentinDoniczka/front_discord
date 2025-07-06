import { Client, StompHeaders } from '@stomp/stompjs';
import type { IFrame } from '@stomp/stompjs';
import { MessageDTO } from '../models/MessageDTO';

export class CustomStompSessionHandler {

    afterConnected(_client: Client, _frame: IFrame): void {
        console.log("Connection established");
    }

    handleException(_client: Client, error: Error): void {
        console.log("Exception: " + error.message);
    }

    handleTransportError(_client: Client, error: Error): void {
        console.log("Transport error: " + error.message);
    }

    getPayloadType(): typeof MessageDTO {
        return MessageDTO;
    }

    handleFrame(_headers: StompHeaders, _payload: unknown): void {
        // Not used as we subscribe manually
    }
}