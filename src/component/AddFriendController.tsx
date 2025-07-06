import { useState, forwardRef, useImperativeHandle } from 'react';
import type { IFriendService } from '../services/friend/IFriendService';
import type { AddFriendResult } from '../services/friend/FriendService';
import type { WebSocketService } from '../services/websocket/WebSocketService';

interface AddFriendControllerProps {
    friendService?: IFriendService;
    webSocketService?: WebSocketService;
    onSuccessCallback?: () => void;
}

export interface AddFriendControllerRef {
    resetForm: () => void;
}

const AddFriendController = forwardRef<AddFriendControllerRef, AddFriendControllerProps>(({
                                                                                              friendService,
                                                                                              webSocketService,
                                                                                              onSuccessCallback
                                                                                          }, ref) => {
    const [username, setUsername] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [statusVisible, setStatusVisible] = useState(false);
    const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    useImperativeHandle(ref, () => ({
        resetForm
    }));

    const resetForm = () => {
        setUsername('');
        setStatusVisible(false);
        setStatusType('');
        setIsButtonDisabled(false);
    };

    const handleAddFriend = () => {
        const trimmedUsername = username.trim();
        if (trimmedUsername && friendService) {
            setIsButtonDisabled(true);
            setStatusMessage('Envoi en cours...');
            setStatusVisible(true);
            setStatusType('');

            friendService.addFriend(trimmedUsername).then((result: AddFriendResult) => {
                if (result.isSuccess()) {
                    setStatusMessage(result.getMessage());
                    setStatusType('success');

                    if (webSocketService && webSocketService.isConnected()) {
                        const sent = webSocketService.sendFriendNotificationString(trimmedUsername);
                        console.log("=== FRIEND ACCEPTED NOTIFICATION ===");
                        console.log("Username: " + trimmedUsername);
                        console.log("Sent: " + sent);
                        console.log("====================================");
                    }

                    setUsername('');

                    setTimeout(() => {
                        setIsButtonDisabled(false);

                        setTimeout(() => {
                            resetForm();

                            if (onSuccessCallback) {
                                onSuccessCallback();
                            }
                        }, 500);
                    }, 1000);
                } else {
                    setStatusMessage(result.getMessage());
                    setStatusType('error');
                    setIsButtonDisabled(false);
                }
            }).catch(error => {
                setStatusMessage('Erreur de connexion');
                setStatusType('error');
                setIsButtonDisabled(false);
                console.error('Erreur lors de l\'ajout d\'ami', error);
            });
        }
    };

    return (
        <div className="add-friend-container">
        <div className="form-group">
        <input
            type="text"
    className="username-field"
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
        className="add-button"
    onClick={handleAddFriend}
    disabled={isButtonDisabled}
        >
        Ajouter ami
    </button>
    </div>
);
});

AddFriendController.displayName = 'AddFriendController';

export default AddFriendController;