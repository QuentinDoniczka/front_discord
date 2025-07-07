import React, { useState, useEffect, useRef } from 'react';

import '../styles/component/conversation-component.css';
import {SessionManager} from "../managers/SessionManager.tsx";
import type {MessageDTO} from "../models/MessageDTO.ts";
import {WebSocketService} from "../services/websocket/WebSocketService.ts";
import {MessageService} from "../services/message/MessageService.ts";
import {MessageDisplayService} from "../services/MessageDisplayService.tsx";
import {MessageConversionService} from "../services/MessageConversionService.tsx";

interface ConversationControllerProps {
    selectedFriend: { username: string; conversationId: number } | null;
}

export const Conversation: React.FC<ConversationControllerProps> = ({selectedFriend}) => {
    const CURRENT_USER_DISPLAY = "Moi";

    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [loggedInUsername] = useState<string | null>(SessionManager.getInstance().getUsername());
    const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
    const [hasActiveConversation, setHasActiveConversation] = useState<boolean>(false);
    const [inputFieldValue, setInputFieldValue] = useState<string>('');
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const [recipientName, setRecipientName] = useState<string>('Bienvenue');

    const messageScrollRef = useRef<HTMLDivElement>(null);
    const inputFieldRef = useRef<HTMLInputElement>(null);

    const webSocketService = useRef(new WebSocketService());
    const messageDisplayService = useRef(new MessageDisplayService());
    const messageService = useRef(new MessageService());
    const messageConversionService = useRef(new MessageConversionService());

    useEffect(() => {
        initialize();
        return cleanup;
    }, []);

    useEffect(() => {
        if (selectedFriend && selectedFriend.conversationId !== currentConversationId) {
            changeConversation(selectedFriend.username, selectedFriend.conversationId);
        }
    }, [selectedFriend]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initialize = () => {
        setupMessageInput();
        showWelcomeMessage();
        setupAutoScroll();

        if (!webSocketService.current.isConnected()) {
            webSocketService.current.connectToWebSocket();
        }
    };

    const setupAutoScroll = () => {

    };

    const setupMessageReceivedCallback = () => {
        webSocketService.current.setMessageReceivedCallback((receivedWsMessage) => {
            const convertedMessage = messageConversionService.current.convertWebSocketToDTO(receivedWsMessage);

            if (convertedMessage && convertedMessage.getUsername()) {
                setMessages(prevMessages => [...prevMessages, convertedMessage]);
                scrollToBottom();
            } else {
                console.warn("Received message with null username");
            }
        });
    };

    const setupMessageInput = () => {

    };

    const showWelcomeMessage = () => {
        setMessages([]);
        setRecipientName("Bienvenue");
    };

    const sendMessage = () => {
        if (!hasActiveConversation || !currentUser || !currentConversationId) {
            console.warn("Cannot send message: no active conversation or conversation ID is null");
            return;
        }

        const messageText = inputFieldValue.trim();
        if (!messageText) return;

        const displayName = loggedInUsername || CURRENT_USER_DISPLAY;

        const sent = webSocketService.current.sendMessageToConversation(currentConversationId, displayName, messageText);

        if (sent) {
            setInputFieldValue('');
        } else {
            console.error("Échec de l'envoi du message");
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (messageScrollRef.current) {
                messageScrollRef.current.scrollTop = messageScrollRef.current.scrollHeight;
            }
        }, 100);
    };

    const changeConversation = (username: string, conversationId: number) => {
        console.log("Changement de conversation - ID: " + conversationId);
        console.info("Changement de conversation - ID: " + conversationId);

        setCurrentConversationId(conversationId);

        if (conversationId && webSocketService.current.isConnected()) {
            webSocketService.current.subscribeToConversation(conversationId);
        }

        initializeConversation(username);
        loadConversationMessages(conversationId);
    };

    const initializeConversation = (username: string) => {
        setCurrentUser(username);
        setHasActiveConversation(true);
        setRecipientName(username);
        setMessages([]);

        setTimeout(() => {
            inputFieldRef.current?.focus();
        }, 100);
    };

    const loadConversationMessages = async (id: number | null) => {
        if (!id) {
            return;
        }

        try {
            const messagesList = await messageService.current.getConversationMessages(id);
            setMessages(messagesList);
            scrollToBottom();
            console.log("Messages loaded for conversation ID:", id);
            console.log(messagesList);
        } catch (error) {
            console.error("Failed to load conversation messages", error);
        }
    };


    const cleanup = () => {
        if (webSocketService.current) {
            webSocketService.current.unsubscribeFromAllConversations();
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && inputFieldValue.trim() && hasActiveConversation) {
            sendMessage();
        }
    };

    const renderWelcomeMessage = () => (
        <div className="welcome-container">
            <div className="welcome-label">Bienvenue dans votre messagerie</div>
            <div className="instruction-label">
                Sélectionnez un ami dans la liste de gauche pour commencer une conversation
            </div>
        </div>
    );

    const renderMessages = () => {
        if (messages.length === 0 && !hasActiveConversation) {
            return renderWelcomeMessage();
        }

        return messages.map((message, index) => {
            const isCurrentUser = message.getUsername() === loggedInUsername;
            return messageDisplayService.current.displayMessage(
                message,
                isCurrentUser,
                index
            );
        });
    };

    useEffect(() => {
        setupMessageReceivedCallback();
    }, []);

    return (
        <div className="root-container">
            <div className="header-container">
                <span className="header-username">{recipientName}</span>
            </div>

            <div className="message-scroll-pane" ref={messageScrollRef}>
                <div className="message-list">{renderMessages()}</div>
            </div>

            <div className="input-container">
                <input
                    ref={inputFieldRef}
                    type="text"
                    className="input-field-conversation"
                    value={inputFieldValue}
                    onChange={(e) => setInputFieldValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!hasActiveConversation}
                    placeholder="Tapez votre message..."
                />
            </div>
        </div>
    );

};