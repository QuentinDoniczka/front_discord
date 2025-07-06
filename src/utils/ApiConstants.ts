export class ApiConstants {
    public static readonly BASE_URL = "https://discord2-back-17feecd5a4fc.herokuapp.com/api/";
    // public static readonly BASE_URL = "http://localhost:8080/api/";
    public static readonly USERS_ENDPOINT = ApiConstants.BASE_URL + "user/register";
    public static readonly AUTHENTICATE_ENDPOINT = ApiConstants.BASE_URL + "authenticate";
    public static readonly FRIEND_LIST_ENDPOINT = ApiConstants.BASE_URL + "friendlist";
    public static readonly PENDING_FRIEND_REQUESTS_ENDPOINT = ApiConstants.BASE_URL + "friendlist/pending-friend-requests";
    public static readonly ADD_FRIEND_ENDPOINT = ApiConstants.BASE_URL + "friendlist/add-friend/by-username";
    public static readonly ACCEPT_FRIEND_REQUEST_ENDPOINT = ApiConstants.BASE_URL + "friendlist/accept";
    public static readonly REFUSE_FRIEND_REQUEST_ENDPOINT = ApiConstants.BASE_URL + "friendlist/refuse";
    public static readonly MESSAGE_ENDPOINT = ApiConstants.BASE_URL + "message";

    private constructor() {
    }
}