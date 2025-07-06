import React from 'react';
import { MessageDTO } from '../models/MessageDTO';

export class MessageDisplayService {
    private static readonly DISPLAY_FORMATTER = "yyyy-MM-dd HH:mm:ss";

    public displayMessage(message: MessageDTO, isCurrentUser: boolean, key: number): React.ReactElement {
        return (
            <div key={key} className="message-group">
                {this.createUserMessage(message, isCurrentUser)}
            </div>
        );
    }

    private createUserMessage(message: MessageDTO, isCurrentUser: boolean): React.ReactElement {
        const containerClass = isCurrentUser ? "user-message-container" : "other-message-container";
        const contentClass = isCurrentUser ? "user-content" : "other-content";
        const usernameClass = isCurrentUser ? "user-username" : "other-username";
        const messageClass = isCurrentUser ? "user-message" : "other-message";

        return (
            <div className={containerClass}>
                <div className={contentClass} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label className={usernameClass}>{message.getUsername()}</label>
                    <div className={messageClass}>
                        <label className="message-label">{message.getMessageContent()}</label>
                    </div>
                    <label className="message-time" style={{ fontSize: "10px", color: "#888" }}>
                        {this.formatDateTime(message.getMessageDateTime())}
                    </label>
                </div>
            </div>
        );
    }

    private formatDateTime(dateTimeString: string): string {
        try {
            const dateTime = new Date(dateTimeString);
            return this.formatWithPattern(dateTime, MessageDisplayService.DISPLAY_FORMATTER);
        } catch (e) {
            console.error("Invalid date format:", dateTimeString, e);
            return dateTimeString;
        }
    }

    private formatWithPattern(date: Date, pattern: string): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return pattern
            .replace('yyyy', year.toString())
            .replace('MM', month)
            .replace('dd', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }
}