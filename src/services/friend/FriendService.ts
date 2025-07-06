import type { IFriendService } from './IFriendService';
import type { FriendDTO } from '../../models/FriendDTO';
import { SessionManager } from '../../managers/SessionManager';
import { WebSocketService } from '../websocket/WebSocketService.ts';
import { ApiConstants } from '../../utils/ApiConstants';

export class AddFriendResult {
    private readonly success: boolean;
    private readonly message: string;
    private readonly username: string;

    constructor(success: boolean, message: string, username: string) {
        this.success = success;
        this.message = message;
        this.username = username;
    }

    isSuccess(): boolean {
        return this.success;
    }

    getMessage(): string {
        return this.message;
    }

    getUsername(): string {
        return this.username;
    }
}

export class FriendService implements IFriendService {
    private readonly webSocketService: WebSocketService;

    constructor(webSocketService?: WebSocketService) {
        this.webSocketService = webSocketService || new WebSocketService();
    }

    async getFriendsList(): Promise<FriendDTO[]> {
        try {
            const token = SessionManager.getInstance().getToken();
            if (!token) {
                return [];
            }

            const response = await fetch(ApiConstants.FRIEND_LIST_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (response.status === 200) {
                const friends: FriendDTO[] = await response.json();
                console.log('Response: ' + JSON.stringify(friends));
                return friends;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching friends list:', error);
            return [];
        }
    }

    async addFriend(friendUsername: string): Promise<AddFriendResult> {
        try {
            const token = SessionManager.getInstance().getToken();
            const currentUsername = SessionManager.getInstance().getUsername();

            if (!token || !currentUsername) {
                return new AddFriendResult(false, "Session non valide", friendUsername);
            }

            const url = `${ApiConstants.ADD_FRIEND_ENDPOINT}/${friendUsername}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*',
                },
            });

            if (response.status >= 200 && response.status < 300) {
                this.publishFriendNotification(currentUsername, friendUsername);

                return new AddFriendResult(true, "Demande d'ami envoyée avec succès!", friendUsername);
            } else if (response.status === 404) {
                return new AddFriendResult(false, `L'utilisateur '${friendUsername}' n'existe pas`, friendUsername);
            } else if (response.status === 409) {
                return new AddFriendResult(false, `'${friendUsername}' est déjà dans votre liste d'amis`, friendUsername);
            } else {
                return new AddFriendResult(false, "Erreur lors de l'envoi de la demande", friendUsername);
            }

        } catch (error) {
            console.error('Error adding friend:', error);
            return new AddFriendResult(false, "Erreur de connexion", friendUsername);
        }
    }

    private publishFriendNotification(requester: string, receiver: string): void {
        try {
            if (!this.webSocketService.isConnected()) {
                const connected = this.webSocketService.connectToWebSocket();
                if (!connected) {
                    console.error("Impossible de se connecter au WebSocket pour envoyer la notification");
                    return;
                }
            }

            const sent = this.webSocketService.sendFriendNotification(requester, receiver);
            if (sent) {
                console.log(`Notification d'ami envoyée avec succès de ${requester} vers ${receiver}`);
            } else {
                console.error("Échec de l'envoi de la notification d'ami");
            }
        } catch (error) {
            console.error(`Erreur lors de l'envoi de la notification WebSocket: ${error}`);
        }
    }
}