import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import NotificationButtonController, {type NotificationButtonControllerRef} from "./NotificationButton.tsx";
import type {IFriendRequestAcceptedListener} from "../services/IFriendRequestAcceptedListener.ts";

export interface LeftNavbarControllerRef {
    getNotificationController: () => NotificationButtonControllerRef | null;
}

interface LeftNavbarControllerProps {
    onFriendRequestAccepted?: () => void;
}

const LeftNavbarController = forwardRef<LeftNavbarControllerRef, LeftNavbarControllerProps>((props, ref) => {
    const notificationControllerRef = useRef<NotificationButtonControllerRef>(null);

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        if (props.onFriendRequestAccepted && notificationControllerRef.current) {
            const listener: IFriendRequestAcceptedListener = {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onFriendRequestAccepted: (_username: string) => {
                    props.onFriendRequestAccepted!();
                }
            };
            notificationControllerRef.current.setFriendRequestAcceptedListener(listener);
        }
    }, [props.onFriendRequestAccepted]);

    const initialize = () => {
        loadCss();
    };

    const loadCss = () => {
        try {
            const cssExists = document.querySelector('link[href*="left-navbar-component.css"]');
            if (!cssExists) {
                console.log('CSS loading handled by import');
            }
        } catch (e) {
            console.error('Failed to load CSS:', e);
        }
    };

    const getNotificationController = (): NotificationButtonControllerRef | null => {
        return notificationControllerRef.current;
    };

    useImperativeHandle(ref, () => ({
        getNotificationController
    }));

    return (
        <div className="navbar" id="navbarContainer">
            <NotificationButtonController ref={notificationControllerRef} />
        </div>
    );
});

LeftNavbarController.displayName = 'LeftNavbarController';

export default LeftNavbarController;