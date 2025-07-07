import React, { useState, useEffect, useRef } from 'react';
import { SessionManager } from '../managers/SessionManager';
import type { FriendDTO } from '../models/FriendDTO';
import type { IFriendService } from '../services/friend/IFriendService';
import type { WebSocketService } from '../services/websocket/WebSocketService';
import '../styles/component/friend-list-component.css';
import AddFriendController from './AddFriendController.tsx';
import type { FriendSelectionListener } from './listeners/FriendSelectionListener.tsx';
import { RotateCcw } from 'lucide-react';

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
                if (username === currentUser) {
                    refreshFriendsList();
                }
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
        onLogout?.();
    };

    const showLoadingMessage = () => setIsLoading(true);

    const showFriendsList = () => {
        setSelectedView('friends');
        setFilteredFriends(allFriends);
    };

    const showAddFriendView = () => {
        setSelectedView('addFriend');
        addFriendControllerRef.current?.resetForm();
    };

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
            })
            .catch(() => {
                setIsLoading(false);
            });
    };

    const filterFriends = (text: string) => {
        if (!text.trim()) {
            setFilteredFriends(allFriends);
            return;
        }
        const lowerCaseFilter = text.toLowerCase();
        const filtered = allFriends.filter((friend) =>
            friend.username?.toLowerCase().includes(lowerCaseFilter)
        );
        setFilteredFriends(filtered);
    };

    const handleFriendClick = (friend: FriendDTO) => {
        const { username, conversationId } = friend;
        if (friendSelectionListener && username && conversationId !== undefined) {
            friendSelectionListener.onFriendSelected(username, Number(conversationId));
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
        if (isLoading) return <div className="loading-label">Chargement des amis...</div>;
        if (filteredFriends.length === 0) return <div className="empty-label">Aucun ami trouvé</div>;
        return (
            <div className="friends-list-container">
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
        <div className="friend-root-container">
            <div className="header-container">
                <div className="header-title">DIRECT MESSAGES</div>
            </div>

            <div className="buttons-container">
                <button
                    className={`nav-button ${selectedView === 'friends' ? 'selected' : ''}`}
                    onClick={showFriendsList}
                >
                    Amis
                </button>
                <button
                    className={`nav-button ${selectedView === 'addFriend' ? 'selected' : ''}`}
                    onClick={showAddFriendView}
                >
                    Ajouter des amis
                </button>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    className="search-field"
                    placeholder="Rechercher un ami..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button className="refresh-icon-button" onClick={refreshFriendsList}>
                    <RotateCcw size={20} />
                </button>
            </div>

            <div className="friends-scroll-pane">
                {selectedView === 'friends' && renderFriendsList()}
                {selectedView === 'addFriend' && renderAddFriendView()}
            </div>

            <div className="user-info-section">
                <div className="current-user-label">{currentUser}</div>
            </div>

            <div className="logout-section">
                <button className="logout-button" onClick={handleLogout}>
                    Déconnexion
                </button>
            </div>
        </div>
    );
};

export default FriendList;
