import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Bell } from 'lucide-react';
import '../styles/component/notification-button-component.css';
import type {IFriendRequestService} from "../services/friend/IFriendRequestService.ts";
import {FriendRequestService} from "../services/friend/FriendRequestService.ts";
import {SessionManager} from "../managers/SessionManager.tsx";
import type {FriendNotificationDTO} from "../models/FriendNotificationDTO.ts";
import type {IFriendRequestAcceptedListener} from "../services/IFriendRequestAcceptedListener.ts";
import {WebSocketService} from "../services/websocket/WebSocketService.ts";

export interface NotificationButtonControllerRef {
    setHasNotifications: (hasNotifications: boolean) => void;
    cleanup: () => void;
    setFriendRequestAcceptedListener: (listener: IFriendRequestAcceptedListener) => void;
}

const NotificationButtonController = forwardRef<NotificationButtonControllerRef>((_, ref) => {
    const [hasNotifications, setHasNotificationsState] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [pendingRequests, setPendingRequests] = useState<string[]>([]);
    const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

    const friendRequestServiceRef = useRef<IFriendRequestService | null>(null);
    const webSocketServiceRef = useRef<WebSocketService | null>(null);
    const friendRequestAcceptedListenerRef = useRef<IFriendRequestAcceptedListener | null>(null);

    useEffect(() => {
        initialize();
        return () => cleanup();
    }, []);

    const initialize = async () => {
        loadStyles();
        friendRequestServiceRef.current = new FriendRequestService();
        webSocketServiceRef.current = new WebSocketService();

        if (webSocketServiceRef.current) {
            webSocketServiceRef.current.setFriendNotificationReceivedCallback(handleFriendNotification);
        }

        await initializeWebSocketConnection();
        checkForPendingRequests();
    };

    const handleFriendNotification = (acceptedUsername: string) => {
        console.log("DEBUG [Friend Accepted] " + acceptedUsername);
    };

    const initializeWebSocketConnection = async () => {
        try {
            if (webSocketServiceRef.current) {
                const connected = await webSocketServiceRef.current.connectToWebSocket();
                if (connected) {
                    webSocketServiceRef.current.subscribeToNotifications();
                    webSocketServiceRef.current.subscribeToFriendNotifications();
                    webSocketServiceRef.current.setNotificationReceivedCallback(onNotificationReceived);
                }
            }
        } catch (e) {
            console.error('Failed to initialize WebSocket connection:', e);
        }
    };

    const onNotificationReceived = (notification: FriendNotificationDTO) => {
        const currentUsername = SessionManager.getInstance().getUsername();
        const isForCurrentUser = currentUsername != null &&
            currentUsername === notification.getUsername_receiver();

        if (isForCurrentUser) {
            setHasNotifications(true);
            if (isPopupOpen) {
                refreshRequestsList();
            }
        }
    };

    const setFriendRequestAcceptedListener = (listener: IFriendRequestAcceptedListener) => {
        friendRequestAcceptedListenerRef.current = listener;
    };

    const loadStyles = () => {
        try {
            const cssExists = document.querySelector('link[href*="notification-button-component.css"]');
            if (!cssExists) {
                console.log('CSS loading handled by import');
            }
        } catch (e) {
            console.error('Failed to load CSS:', e);
        }
    };

    const checkForPendingRequests = () => {
        if (friendRequestServiceRef.current) {
            friendRequestServiceRef.current.getPendingFriendRequests().then(requests => {
                setHasNotifications(requests.length > 0);
                setPendingRequests(requests);
            });
        }
    };

    const onNotificationClick = () => {
        setIsPopupOpen(!isPopupOpen);
        if (!isPopupOpen) {
            refreshRequestsList();
        }
    };

    const refreshRequestsList = () => {
        if (friendRequestServiceRef.current) {
            friendRequestServiceRef.current.getPendingFriendRequests().then(requests => {
                setPendingRequests(requests);
                setHasNotifications(requests.length > 0);
            });
        }
    };

    const handleAcceptRequest = (username: string) => {
        setProcessingRequests(prev => new Set(prev).add(username));

        if (friendRequestServiceRef.current) {
            friendRequestServiceRef.current.acceptFriendRequest(username).then(success => {
                if (success) {
                    if (webSocketServiceRef.current) {
                        webSocketServiceRef.current.sendFriendAccepted(username);
                    }

                    refreshRequestsList();
                    checkForPendingRequests();

                    if (friendRequestAcceptedListenerRef.current) {
                        friendRequestAcceptedListenerRef.current.onFriendRequestAccepted(username);
                    }
                }
                setProcessingRequests(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(username);
                    return newSet;
                });
            }).catch(ex => {
                console.error('Error accepting friend request:', ex);
                setProcessingRequests(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(username);
                    return newSet;
                });
            });
        }
    };

    const handleDeclineRequest = (username: string) => {
        setProcessingRequests(prev => new Set(prev).add(username));

        if (friendRequestServiceRef.current) {
            friendRequestServiceRef.current.declineFriendRequest(username).then(success => {
                if (success) {
                    refreshRequestsList();
                    checkForPendingRequests();
                }
                setProcessingRequests(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(username);
                    return newSet;
                });
            }).catch(ex => {
                console.error('Error declining friend request:', ex);
                setProcessingRequests(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(username);
                    return newSet;
                });
            });
        }
    };

    const setHasNotifications = (notifications: boolean) => {
        setHasNotificationsState(notifications);
    };

    const cleanup = () => {
        if (webSocketServiceRef.current) {
            webSocketServiceRef.current.disconnect();
        }
    };

    useImperativeHandle(ref, () => ({
        setHasNotifications,
        cleanup,
        setFriendRequestAcceptedListener
    }));

    return (
        <div className="notification-container">
            <button
                className="notification-button"
                onClick={onNotificationClick}
            >
                <Bell size={24} />
                {hasNotifications && (
                    <div className="notification-dot"></div>
                )}
            </button>

            {isPopupOpen && (
                <div className="notification-popup-overlay" onClick={() => setIsPopupOpen(false)}>
                    <div className="notification-popup" onClick={e => e.stopPropagation()}>
                        <div className="notification-popup-header">
                            <h3 className="notification-popup-title">Demandes d'amis en attente</h3>
                            <button
                                className="notification-popup-close"
                                onClick={() => setIsPopupOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="notification-popup-scrollpane">
                            <div className="notification-popup-requests-container">
                                {pendingRequests.length === 0 ? (
                                    <div className="notification-popup-no-requests">
                                        Aucune demande d'ami en attente
                                    </div>
                                ) : (
                                    pendingRequests.map(username => (
                                        <div
                                            key={username}
                                            className={`friend-request-item ${processingRequests.has(username) ? 'processing' : ''}`}
                                        >
                                            <div className="friend-request-username">
                                                {username}
                                            </div>
                                            <div className="friend-request-buttons">
                                                <button
                                                    className="friend-request-accept-button"
                                                    onClick={() => handleAcceptRequest(username)}
                                                    disabled={processingRequests.has(username)}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    className="friend-request-decline-button"
                                                    onClick={() => handleDeclineRequest(username)}
                                                    disabled={processingRequests.has(username)}
                                                >
                                                    ✗
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

NotificationButtonController.displayName = 'NotificationButtonController';

export default NotificationButtonController;