export class WsConstants {
    public static readonly WEBSOCKET_URL = "wss://discord2-back-17feecd5a4fc.herokuapp.com/api/ws";
    //public static readonly WEBSOCKET_URL = "ws://localhost:8080/api/ws";

    public static readonly TOPIC_MESSAGES = "/topic/messages";
    public static readonly TOPIC_FRIEND_NOTIFICATION = "/topic/notification";
    public static readonly TOPIC_NOTIFICATION_FRIEND = "/topic/notification/friend";
    public static readonly APP_FRIEND_NOTIFICATION_ENDPOINT = "/app/notification";
    public static readonly APP_NOTIFICATION_FRIEND_ENDPOINT = "/app/notification/friend";
    public static readonly APP_CHAT_ENDPOINT = "/app/chat/";
    public static readonly AUTHORIZATION_HEADER = "Authorization";
    public static readonly BEARER_PREFIX = "Bearer ";
    public static readonly TIMESTAMP_FORMAT = "HH:mm:ss";

    private constructor() {
    }
}