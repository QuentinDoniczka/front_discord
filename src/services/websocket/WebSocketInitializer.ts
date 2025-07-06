import { WebSocketService } from './WebSocketService.ts';

export class WebSocketInitializer {
    private webSocketService: WebSocketService;
    private connectionAttempted: boolean = false;

    constructor() {
        this.webSocketService = new WebSocketService();
    }

    initializeAndSendMessage(): boolean {
        this.connectionAttempted = true;

        try {
            console.log("Initializing WebSocket connection...");

            const connected = this.webSocketService.connectToWebSocket();

            if (connected) {
                console.log("Static message sent successfully: ");
                return true;
            } else {
                console.log("Failed to connect to WebSocket server - continue with application startup");
                return false;
            }
        } catch (error) {
            console.log("Error initializing WebSocket: " + error);
            console.error(error);
            console.log("Continuing application startup despite WebSocket error");
            return false;
        }
    }

    retryConnection(): boolean {
        if (this.webSocketService.isConnected()) {
            return true;
        }

        try {
            console.log("Retrying WebSocket connection...");
            return this.webSocketService.connectToWebSocket();
        } catch (error) {
            console.log("Error retrying WebSocket connection: " + error);
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