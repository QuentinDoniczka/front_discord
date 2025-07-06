import React, { useState, useEffect, useRef } from 'react';
import { SessionManager } from '../managers/SessionManager';
import type { FriendDTO } from '../models/FriendDTO';
import type { IFriendService } from '../services/friend/IFriendService';
import type { WebSocketService } from '../services/websocket/WebSocketService';
import '../styles/component/friend-list-component.css';
import AddFriendController from "./AddFriendController.tsx";
import type {FriendSelectionListener} from "./listeners/FriendSelectionListener.tsx";

interface FriendListControllerProps {
    friendService?: IFriendService;
    webSocketService?: WebSocketService;
    friendSelectionListener?: FriendSelectionListener;
    onLogout?: () => void;
}

const FriendList: React.FC<FriendListControllerProps> = ({
                                                             friendService: initialFriendService,
                                                             webSocketService: initialWebSocketService,
                                                             friendSelectionListener: initialFriendSelectionListener,
                                                             onLogout
                                                         }) => {
    const [allFriends, setAllFriends] = useState<FriendDTO[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<FriendDTO[]>([]);
    const [friendSelectionListener] = useState<FriendSelectionListener | undefined>(initialFriendSelectionListener);
    const [friendService] = useState<IFriendService | undefined>(initialFriendService);
    const [webSocketService] = useState<WebSocketService | undefined>(initialWebSocketService);
    const [selectedView, setSelectedView] = useState<'friends' | 'addFriend'>('friends');
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<string>('');

    const addFriendControllerRef = useRef<{ resetForm: () => void } | null>(null);

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        if (webSocketService) {
            setupWebSocketSubscription();
        }
    }, [webSocketService]);

    useEffect(() => {
        filterFriends(searchText);
    }, [searchText, allFriends]);

    const initialize = () => {
        displayCurrentUser();
        showLoadingMessage();
        refreshFriendsList();
    };

    const setupWebSocketSubscription = () => {
        if (webSocketService && webSocketService.isConnected()) {
            webSocketService.setFriendNotificationReceivedCallback((username: string) => {
                const currentUser = SessionManager.getInstance().getUsername();
                console.log("=== FRIEND NOTIFICATION RECEIVED ===");
                console.log("Received username: " + username);
                console.log("Current user: " + currentUser);

                if (username === currentUser) {
                    console.log("Refreshing friends list...");
                    refreshFriendsList();
                }

                console.log("====================================");
            });

            webSocketService.subscribeToFriendNotifications();
        }
    };

    const displayCurrentUser = () => {
        const username = SessionManager.getInstance().getUsername();
        if (username) {
            setCurrentUser(username);
        }
    };

    const handleLogout = () => {
        SessionManager.getInstance().clearSession();

        if (onLogout) {
            onLogout();
        }
    };

    const showLoadingMessage = () => {
        setIsLoading(true);
    };

    const showFriendsList = () => {
        setSelectedView('friends');
        setFilteredFriends(allFriends);
    };

    const showAddFriendView = () => {
        setSelectedView('addFriend');
        if (addFriendControllerRef.current) {
            addFriendControllerRef.current.resetForm();
        }
    };

    const updateFriendsList = (friends: FriendDTO[]) => {
        setAllFriends([...friends]);
        if (selectedView === 'friends') {
            setFilteredFriends([...friends]);
        }
        setIsLoading(false);
    };

    const refreshFriendsList = () => {
        if (friendService) {
            showLoadingMessage();

            friendService.getFriendsList().then(friends => {
                updateFriendsList(friends);
                if (selectedView === 'friends') {
                    setFilteredFriends(friends);
                }
                console.log("Friends list refreshed: " + friends.length + " friends");
            }).catch(error => {
                setIsLoading(false);
                console.error("Failed to refresh friends list", error);
            });
        }
    };

    const filterFriends = (searchText: string) => {
        if (!searchText || searchText.trim() === '') {
            setFilteredFriends(allFriends);
        } else {
            const lowerCaseFilter = searchText.toLowerCase();
            const filtered = allFriends.filter(friend => {
                const username = friend.getUsername();
                return username && username.toLowerCase().includes(lowerCaseFilter);
            });
            setFilteredFriends(filtered);
        }
    };

    const handleFriendClick = (friend: FriendDTO) => {
        const username = friend.getUsername();
        const conversationId = friend.getConversationId();

        if (friendSelectionListener && username && conversationId !== undefined) {
            friendSelectionListener.onFriendSelected(username, conversationId);
        }

        if (username) {
            setSelectedFriendId(username);
        }
    };

    const navigateToFriendsList = () => {
        setSelectedView('friends');
        showFriendsList();
    };

    const handleAddFriendSuccess = () => {
        navigateToFriendsList();
        refreshFriendsList();
    };

    const renderFriendItem = (friend: FriendDTO) => {
        const username = friend.getUsername();
        const isSelected = selectedFriendId === username;

        if (!username) {
            return null;
        }

        return (
            <div
                key={username}
                className={`friend-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleFriendClick(friend)}
            >
                <div className="friend-avatar">
                    {username.substring(0, 1).toUpperCase()}
                </div>
                <div className="friend-name">
                    {username}
                </div>
            </div>
        );
    };

    const renderFriendsList = () => {
        if (isLoading) {
            return (
                <div className="loading-label">
                    Chargement des amis...
                </div>
            );
        }

        if (filteredFriends.length === 0) {
            return (
                <div className="empty-label">
                    Aucun ami trouvé
                </div>
            );
        }

        return (
            <div className="friends-list">
                {filteredFriends
                    .filter(friend => friend.getUsername())
                    .map(friend => renderFriendItem(friend))}
            </div>
        );
    };

    const renderAddFriendView = () => {
        return (
            <AddFriendController
                ref={addFriendControllerRef}
                friendService={friendService}
                webSocketService={webSocketService}
                onSuccessCallback={handleAddFriendSuccess}
            />
        );
    };

    return (
        <div className="root-container">
            <div className="navigation-header">
                <button
                    className={`toggle-button ${selectedView === 'friends' ? 'selected' : ''}`}
                    onClick={showFriendsList}
                >
                    Friends
                </button>
                <button
                    className={`toggle-button ${selectedView === 'addFriend' ? 'selected' : ''}`}
                    onClick={showAddFriendView}
                >
                    Add Friend
                </button>
            </div>

            {selectedView === 'friends' && (
                <>
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-field"
                            placeholder="Search friends..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <button
                            className="refresh-button"
                            onClick={refreshFriendsList}
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="friends-scroll-pane">
                        {renderFriendsList()}
                    </div>
                </>
            )}

            {selectedView === 'addFriend' && renderAddFriendView()}

            <div className="user-info">
                <span className="current-user-label">{currentUser}</span>
                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default FriendList;