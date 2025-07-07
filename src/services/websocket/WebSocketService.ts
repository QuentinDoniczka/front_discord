import { Client, type StompSubscription } from '@stomp/stompjs';
import { SessionManager } from '../../managers/SessionManager';
import { MessageWSDTO } from '../../models/MessageWSDTO';
import { FriendNotificationDTO } from '../../models/FriendNotificationDTO';
import { CustomStompSessionHandler } from '../../utils/CustomStompSessionHandler';
import { WsConstants } from '../../utils/WsConstants';

export class WebSocketService {
    private stompSession: Client | null = null;
    private isConnectedState = false;
    private static readonly CONNECTION_TIMEOUT_SECONDS = 3;

    private conversationSubscriptions: Map<number, StompSubscription> = new Map();
    private messageReceivedCallback?: (message: MessageWSDTO) => void;
    private notificationReceivedCallback?: (notification: FriendNotificationDTO) => void;
    private friendNotificationReceivedCallback?: (username: string) => void;

    constructor() {}

    async connectToWebSocket(): Promise<boolean> {
        try {
            const jwt = SessionManager.getInstance().getToken();
            if (!jwt) {
                console.error('No JWT token found. Cannot connect to WebSocket.');
                this.isConnectedState = false;
                return false;
            }
            const brokerURLWithToken = `${WsConstants.WEBSOCKET_URL}?token=${encodeURIComponent(jwt)}`;

            const client = new Client({
                brokerURL: brokerURLWithToken,
                connectHeaders: {
                    [WsConstants.AUTHORIZATION_HEADER]: WsConstants.BEARER_PREFIX + jwt
                },
                //debug: (str) => console.log(str),
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            });

            const sessionHandler = new CustomStompSessionHandler();

            return new Promise<boolean>((resolve) => {
                const timeout = setTimeout(() => {
                    this.isConnectedState = false;
                    resolve(false);
                }, WebSocketService.CONNECTION_TIMEOUT_SECONDS * 1000);

                client.onConnect = (frame) => {
                    clearTimeout(timeout);
                    sessionHandler.afterConnected(client, frame);
                    this.isConnectedState = true;
                    this.stompSession = client;
                    resolve(true);
                };

                client.onStompError = (frame) => {
                    clearTimeout(timeout);
                    sessionHandler.handleException(client, new Error(frame.body));
                    this.isConnectedState = false;
                    resolve(false);
                };

                client.onWebSocketError = (_error) => {
                    clearTimeout(timeout);
                    sessionHandler.handleTransportError(client, _error);
                    this.isConnectedState = false;
                    resolve(false);
                };

                client.activate();
            });
        } catch (_error) {
            console.error('Error connecting to WebSocket: ' + _error);
            this.isConnectedState = false;
            return false;
        }
    }

    subscribeToConversation(conversationId: number): void {
        if (this.stompSession && this.stompSession.connected) {
            this.unsubscribeFromAllConversations();

            const destination = `${WsConstants.TOPIC_MESSAGES}/${conversationId}`;

            const subscription = this.stompSession.subscribe(destination, (message) => {
                const raw = JSON.parse(message.body);
                const receivedMsg = new MessageWSDTO(
                    raw.sender,
                    raw.content,
                    raw.timestamp,
                    raw.conversationId);
                this.messageReceivedCallback?.(receivedMsg);
            });

            this.conversationSubscriptions.set(conversationId, subscription);
        }
    }

    unsubscribeFromAllConversations(): void {
        for (const [, subscription] of this.conversationSubscriptions) {
            subscription.unsubscribe();
        }
        this.conversationSubscriptions.clear();
    }

    sendMessageToConversation(conversationId: number, sender: string, content: string): boolean {
        if (this.stompSession && this.stompSession.connected) {
            try {
                const now = new Date();
                const timestamp = now.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                const message = new MessageWSDTO(sender, content, timestamp, conversationId);
                const destination = `${WsConstants.APP_CHAT_ENDPOINT}${conversationId}`;

                this.stompSession.publish({
                    destination,
                    body: JSON.stringify(message)
                });

                console.log('=== SENDING MESSAGE ===');
                console.log(`Destination: ${destination}`);
                console.log(`Conversation ID: ${conversationId}`);
                console.log(`Sender: ${sender}`);
                console.log(`Content: ${content}`);
                console.log(`Timestamp: ${timestamp}`);
                console.log('=====================');

                return true;
            } catch (_error) {
                console.error('Error sending message: ' + _error);
                return false;
            }
        }
        return false;
    }


    setMessageReceivedCallback(callback: (message: MessageWSDTO) => void): void {
        this.messageReceivedCallback = callback;
    }

    setNotificationReceivedCallback(callback: (notification: FriendNotificationDTO) => void): void {
        this.notificationReceivedCallback = callback;
    }

    setFriendNotificationReceivedCallback(callback: (username: string) => void): void {
        this.friendNotificationReceivedCallback = callback;
    }

    subscribeToNotifications(): void {
        if (this.stompSession && this.stompSession.connected) {
            const destination = WsConstants.TOPIC_FRIEND_NOTIFICATION;

            this.stompSession.subscribe(destination, (message) => {

                const raw = JSON.parse(message.body) as {
                            username_requester: string;
                            username_receiver: string;
                        };
                       const receivedNotification = new FriendNotificationDTO(
                            raw.username_requester,
                            raw.username_receiver
                        );
                console.log('=== NOTIFICATION RECEIVED ===');
                console.log(`From: ${receivedNotification.getUsername_requester()}`);
                console.log(`To: ${receivedNotification.getUsername_receiver()}`);
                console.log('==============================');
                this.notificationReceivedCallback?.(receivedNotification);
            });

            console.log('Subscribed to notifications at: ' + destination);
        }
    }

    subscribeToFriendNotifications(): void {
        if (this.stompSession && this.stompSession.connected) {
            this.stompSession.subscribe(WsConstants.TOPIC_NOTIFICATION_FRIEND, (message) => {
                const receivedUsername: string = message.body;
                console.log('=== FRIEND NOTIFICATION RECEIVED ===');
                console.log('Username: ' + receivedUsername);
                console.log('=====================================');
                this.friendNotificationReceivedCallback?.(receivedUsername);
            });

            console.log('Subscribed to friend notifications at: ' + WsConstants.APP_NOTIFICATION_FRIEND_ENDPOINT);
        }
    }

    sendFriendNotification(usernameRequester: string, usernameReceiver: string): boolean {
        if (this.stompSession && this.stompSession.connected) {
            try {
                const notification = new FriendNotificationDTO(usernameRequester, usernameReceiver);
                const destination = WsConstants.APP_FRIEND_NOTIFICATION_ENDPOINT;

                this.stompSession.publish({
                    destination,
                    body: JSON.stringify(notification)
                });

                console.log('=== SENDING NOTIFICATION ===');
                console.log('Destination: ' + destination);
                console.log('Requester: ' + usernameRequester);
                console.log('Receiver: ' + usernameReceiver);
                console.log('=============================');

                return true;
            } catch (_error) {
                console.error('Error sending notification: ' + _error);
                return false;
            }
        }
        return false;
    }

    sendFriendNotificationString(username: string): boolean {
        if (this.stompSession && this.stompSession.connected) {
            try {
                this.stompSession.publish({
                    destination: WsConstants.APP_NOTIFICATION_FRIEND_ENDPOINT,
                    body: username
                });
                console.log('=== FRIEND ACCEPTED NOTIFICATION SENT ===');
                console.log('Accepted friend: ' + username);
                console.log('========================================');
                return true;
            } catch (_error) {
                console.error('Error sending friend acceptance: ' + _error);
                return false;
            }
        }
        return false;
    }


    isConnected(): boolean {
        return this.isConnectedState && this.stompSession?.connected === true;
    }

    disconnect(): void {
        if (this.stompSession && this.stompSession.connected) {
            this.unsubscribeFromAllConversations();
            this.stompSession.deactivate();
            this.isConnectedState = false;
        }
    }
}
