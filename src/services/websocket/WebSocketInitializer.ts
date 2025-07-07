import { WebSocketService } from './WebSocketService';

export class WebSocketInitializer {
    private webSocketService: WebSocketService;
    private connectionAttempted: boolean = false;

    constructor() {
        this.webSocketService = new WebSocketService();
    }

    async initializeAndSendMessage(): Promise<boolean> {
        this.connectionAttempted = true;

        try {
            const connected = await this.webSocketService.connectToWebSocket();

            if (connected) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error during WebSocket initialization: " + error);
            return false;
        }
    }

    async retryConnection(): Promise<boolean> {
        if (this.webSocketService.isConnected()) {
            return true;
        }

        try {
            return await this.webSocketService.connectToWebSocket();
        } catch (error) {
            console.error("Error during WebSocket reconnection: " + error);
            return false;
        }
    }

    getWebSocketService(): WebSocketService {
        return this.webSocketService;
    }

    wasConnectionAttempted(): boolean {
        return this.connectionAttempted;
    }

    shutdown(): void {
        if (this.webSocketService !== null) {
            try {
                this.webSocketService.disconnect();
            } catch (error) {
                console.log("Error during WebSocket shutdown: " + error);
            }
        }
    }
}