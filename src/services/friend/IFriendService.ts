import type { FriendDTO } from "../../models/FriendDTO";
import type { AddFriendResult } from "./FriendService";

export interface IFriendService {
    getFriendsList(): Promise<FriendDTO[]>;
    addFriend(friendUsername: string): Promise<AddFriendResult>;
}