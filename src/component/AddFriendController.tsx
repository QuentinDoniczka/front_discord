import { useState, forwardRef, useImperativeHandle } from 'react';
import type { IFriendService } from '../services/friend/IFriendService';
import type { AddFriendResult } from '../services/friend/FriendService';
import type { WebSocketService } from '../services/websocket/WebSocketService';

import '../styles/component/add-friend.css';

interface AddFriendControllerProps {
    friendService?: IFriendService;
    webSocketService?: WebSocketService;
    onSuccessCallback?: () => void;
}

export interface AddFriendControllerRef {
    resetForm: () => void;
}

const AddFriendController = forwardRef<AddFriendControllerRef, AddFriendControllerProps>(
    ({ friendService, webSocketService, onSuccessCallback }, ref) => {
        const [username, setUsername] = useState('');
        const [statusMessage, setStatusMessage] = useState('');
        const [statusVisible, setStatusVisible] = useState(false);
        const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
        const [isButtonDisabled, setIsButtonDisabled] = useState(false);

        useImperativeHandle(ref, () => ({ resetForm }));

        const resetForm = () => {
            setUsername('');
            setStatusVisible(false);
            setStatusType('');
            setIsButtonDisabled(false);
        };

        const handleAddFriend = () => {
            const trimmedUsername = username.trim();
            if (!trimmedUsername || !friendService) return;

            setIsButtonDisabled(true);
            setStatusMessage('Envoi en cours...');
            setStatusVisible(true);
            setStatusType('');

            friendService.addFriend(trimmedUsername).then((result: AddFriendResult) => {
                if (result.isSuccess()) {
                    setStatusMessage(result.getMessage());
                    setStatusType('success');

                    if (webSocketService?.isConnected()) {
                        webSocketService.sendFriendNotificationString(trimmedUsername);
                    }

                    setUsername('');

                    setTimeout(() => {
                        setIsButtonDisabled(false);
                        setTimeout(() => {
                            resetForm();
                            onSuccessCallback?.();
                        }, 500);
                    }, 1000);
                } else {
                    setStatusMessage(result.getMessage());
                    setStatusType('error');
                    setIsButtonDisabled(false);
                }
            }).catch(error => {
                console.error('Erreur lors de l\'ajout d\'ami', error);
                setStatusMessage('Erreur de connexion');
                setStatusType('error');
                setIsButtonDisabled(false);
            });
        };

        return (
            <div className="add-friend-view">
                <h2 className="add-friend-title">Ajouter un ami</h2>

                <div className="form-group">
                    <input
                        type="text"
                        className="add-friend-field"
                        placeholder="Nom d'utilisateur"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isButtonDisabled}
                    />
                </div>

                {statusVisible && (
                    <div className={`status-label ${statusType}`}>
                        {statusMessage}
                    </div>
                )}

                <button
                    className="add-friend-button"
                    onClick={handleAddFriend}
                    disabled={isButtonDisabled}
                >
                    Ajouter
                </button>
            </div>
        );
    }
);

AddFriendController.displayName = 'AddFriendController';

export default AddFriendController;
