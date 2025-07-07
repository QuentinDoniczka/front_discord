import React from 'react';
import { MessageDTO } from '../models/MessageDTO';
import { parse, parseISO, isValid, format } from 'date-fns';

export class MessageDisplayService {
    /** Format d’affichage final */
    private static readonly DISPLAY_FORMATTER = 'yyyy-MM-dd HH:mm:ss';

    /** Rend un message dans la conversation */
    public displayMessage(
        message: MessageDTO,
        isCurrentUser: boolean,
        key: number
    ): React.ReactElement {
        return (
            <div key={key} className="message-group">
                {this.createUserMessage(message, isCurrentUser)}
            </div>
        );
    }

    /** Construit le bloc visuel d’un message */
    private createUserMessage(
        message: MessageDTO,
        isCurrentUser: boolean
    ): React.ReactElement {
        const containerClass = isCurrentUser
            ? 'user-message-container'
            : 'other-message-container';
        const contentClass = isCurrentUser ? 'user-content' : 'other-content';
        const usernameClass = isCurrentUser ? 'user-username' : 'other-username';
        const messageClass = isCurrentUser ? 'user-message' : 'other-message';

        return (
            <div className={containerClass}>
                <div
                    className={contentClass}
                    style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
                >
                    <label className={usernameClass}>{message.getUsername()}</label>
                    <div className={messageClass}>
                        <label className="message-label">
                            {message.getMessageContent()}
                        </label>
                    </div>
                    <label
                        className="message-time"
                        style={{ fontSize: '10px', color: '#888' }}
                    >
                        {this.formatDateTime(message.getMessageDateTime())}
                    </label>
                </div>
            </div>
        );
    }

    /** Tente de parser différents formats de date puis les reformate pour l’affichage */
    private formatDateTime(raw: string | null | undefined): string {
        if (!raw) return '';

        let date: Date | undefined;

        // 1. ISO-8601 avec « T »
        if (raw.includes('T')) {
            date = parseISO(raw);
        }

        // 2. Heure seule HH:mm:ss
        if (!date || !isValid(date)) {
            date = parse(raw, 'HH:mm:ss', new Date());
        }

        // 3. Ancien format yyyy-MM-dd HH:mm:ss
        if (!date || !isValid(date)) {
            date = parse(raw, 'yyyy-MM-dd HH:mm:ss', new Date());
        }

        // 4. Dernier recours : constructeur natif
        if (!isValid(date)) {
            date = new Date(raw);
        }

        // Toujours vérifier la validité
        if (!isValid(date)) {
            console.warn('Unparseable date:', raw);
            return raw;
        }

        return format(date, MessageDisplayService.DISPLAY_FORMATTER);
    }
}
