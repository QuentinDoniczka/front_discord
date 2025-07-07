import React, { useState, useEffect, useRef } from 'react';
import { SessionManager } from '../managers/SessionManager';
import type { FriendDTO } from '../models/FriendDTO';
import type { IFriendService } from '../services/friend/IFriendService';
import type { WebSocketService } from '../services/websocket/WebSocketService';
import '../styles/component/friend-list-component.css';
import AddFriendController from './AddFriendController.tsx';
import type { FriendSelectionListener } from './listeners/FriendSelectionListener.tsx';

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
                                                             onLogout,
                                                         }) => {
    /**
     * -------------------------------------------------------------------------------------------
     * STATE
     * -------------------------------------------------------------------------------------------
     */
    const [allFriends, setAllFriends] = useState<FriendDTO[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<FriendDTO[]>([]);
    const [friendSelectionListener] = useState<FriendSelectionListener | undefined>(
        initialFriendSelectionListener,
    );
    const [friendService] = useState<IFriendService | undefined>(initialFriendService);
    const [webSocketService] = useState<WebSocketService | undefined>(initialWebSocketService);
    const [selectedView, setSelectedView] = useState<'friends' | 'addFriend'>('friends');
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<string>('');

    const addFriendControllerRef = useRef<{ resetForm: () => void } | null>(null);

    /**
     * -------------------------------------------------------------------------------------------
     * EFFECTS
     * -------------------------------------------------------------------------------------------
     */
    useEffect(() => {
        initialize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (webSocketService) {
            setupWebSocketSubscription();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [webSocketService]);

    useEffect(() => {
        filterFriends(searchText);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, allFriends]);

    /**
     * -------------------------------------------------------------------------------------------
     * INITIALISATION & WS
     * -------------------------------------------------------------------------------------------
     */
    const initialize = () => {
        displayCurrentUser();
        showLoadingMessage();
        refreshFriendsList();
    };

    const setupWebSocketSubscription = () => {
        if (webSocketService && webSocketService.isConnected()) {
            webSocketService.setFriendNotificationReceivedCallback((username: string) => {
                const currentUser = SessionManager.getInstance().getUsername();
                console.log('=== FRIEND NOTIFICATION RECEIVED ===');
                console.log('Received username: ' + username);
                console.log('Current user: ' + currentUser);

                if (username === currentUser) {
                    console.log('Refreshing friends list...');
                    refreshFriendsList();
                }

                console.log('====================================');
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

    /**
     * -------------------------------------------------------------------------------------------
     * AUTH / LOGOUT
     * -------------------------------------------------------------------------------------------
     */
    const handleLogout = () => {
        SessionManager.getInstance().clearSession();

        onLogout?.();
    };

    /**
     * -------------------------------------------------------------------------------------------
     * VIEW MANAGEMENT
     * -------------------------------------------------------------------------------------------
     */
    const showLoadingMessage = () => setIsLoading(true);

    const showFriendsList = () => {
        setSelectedView('friends');
        setFilteredFriends(allFriends);
    };

    const showAddFriendView = () => {
        setSelectedView('addFriend');
        addFriendControllerRef.current?.resetForm();
    };

    /**
     * -------------------------------------------------------------------------------------------
     * DATA FETCHING & UPDATE
     * -------------------------------------------------------------------------------------------
     */
    const updateFriendsList = (friends: FriendDTO[]) => {
        setAllFriends([...friends]);
        if (selectedView === 'friends') {
            setFilteredFriends([...friends]);
        }
        setIsLoading(false);
    };

    const refreshFriendsList = () => {
        if (!friendService) return;

        showLoadingMessage();

        friendService
            .getFriendsList()
            .then((friends) => {
                updateFriendsList(friends);
                if (selectedView === 'friends') {
                    setFilteredFriends(friends);
                }
                console.log('Friends list refreshed: ' + friends.length + ' friends');
            })
            .catch((error) => {
                setIsLoading(false);
                console.error('Failed to refresh friends list', error);
            });
    };

    /**
     * -------------------------------------------------------------------------------------------
     * FILTER & SEARCH
     * -------------------------------------------------------------------------------------------
     */
    const filterFriends = (text: string) => {
        if (!text.trim()) {
            setFilteredFriends(allFriends);
            return;
        }

        const lowerCaseFilter = text.toLowerCase();
        const filtered = allFriends.filter((friend) =>
            friend.username?.toLowerCase().includes(lowerCaseFilter),
        );
        setFilteredFriends(filtered);
    };

    const handleFriendClick = (friend: FriendDTO) => {
        const { username, conversationId } = friend;

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
        const { username } = friend;
        if (!username) return null;

        const isSelected = selectedFriendId === username;

        return (
            <div
                key={username}
                className={`friend-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleFriendClick(friend)}
            >
                <div className="friend-avatar">{username.substring(0, 1).toUpperCase()}</div>
                <div className="friend-name">{username}</div>
            </div>
        );
    };

    const renderFriendsList = () => {
        if (isLoading) {
            return <div className="loading-label">Chargement des amis...</div>;
        }

        if (filteredFriends.length === 0) {
            return <div className="empty-label">Aucun ami trouvé</div>;
        }

        return (
            <div className="friends-list">
                {filteredFriends.filter((f) => f.username).map(renderFriendItem)}
            </div>
        );
    };

    const renderAddFriendView = () => (
        <AddFriendController
            ref={addFriendControllerRef}
            friendService={friendService}
            webSocketService={webSocketService}
            onSuccessCallback={handleAddFriendSuccess}
        />
    );

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
                        <button className="refresh-button" onClick={refreshFriendsList}>
                            Refresh
                        </button>
                    </div>

                    <div className="friends-scroll-pane">{renderFriendsList()}</div>
                </>
            )}

            {selectedView === 'addFriend' && renderAddFriendView()}

            <div className="user-info">
                <span className="current-user-label">{currentUser}</span>
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default FriendList;
