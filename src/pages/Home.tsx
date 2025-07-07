import React, { useEffect, useState, useCallback, useRef } from 'react';
import LeftNavbarController from '../component/LeftNavBarController.tsx';
import { Conversation } from '../component/Conversation.tsx';
import type { IFriendService } from '../services/friend/IFriendService.ts';
import { FriendService } from '../services/friend/FriendService.ts';
import '../styles/Home.css';
import type { FriendSelectionListener } from '../component/listeners/FriendSelectionListener.tsx';
import FriendList, {type FriendListControllerRef} from "../component/FriendList.tsx";

interface HomeViewControllerProps {
    onLogout?: () => void;
}

const HomeViewController: React.FC<HomeViewControllerProps> = ({ onLogout }) => {
    const [friendService] = useState<IFriendService>(new FriendService());
    const [selectedFriend, setSelectedFriend] = useState<{ username: string; conversationId: number } | null>(null);
    const friendListRef = useRef<FriendListControllerRef>(null);

    useEffect(() => {
        initialize();
    }, []);

    const initialize = () => {
        setupEventHandlers();
        setupFriendRequestListener();
    };

    const setupEventHandlers = () => {
        setupLogoutHandler();
    };

    const setupLogoutHandler = () => {};

    const setupFriendRequestListener = () => {};

    const handleFriendSelection = useCallback((username: string, conversationId: number) => {
        setSelectedFriend({ username, conversationId });
    }, []);

    const friendSelectionListener: FriendSelectionListener = {
        onFriendSelected: handleFriendSelection,
    };

    return (
        <div className="root">
            <div className="main-container">
                <LeftNavbarController onFriendRequestAccepted={() => friendListRef.current?.refreshFriendsList()} />
                <FriendList
                    ref={friendListRef}
                    friendService={friendService}
                    friendSelectionListener={friendSelectionListener}
                    onLogout={onLogout}
                />
                <Conversation selectedFriend={selectedFriend} />
            </div>
        </div>
    );
};

export default HomeViewController;
