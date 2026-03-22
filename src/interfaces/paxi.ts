export interface UserData {
  userUuid: string;
  nickname: string;
  isPaid: boolean;
  isOwner: boolean;
  status: string;
}

export interface PaxiUserMy {
  uuid: string;
  nickname: string;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
}

export interface ChatRoomInfo {
  uuid: string;
  title: string;
  ownerUuid: string;
  departureLocation: string;
  destinationLocation: string;
  maxParticipant: number;
  currentParticipant: number;
  departureTime: string;
  status: string;
  description: string;
  payerUuid: string;
  payAmount: number;
  roomUsers: UserData[];
  myRoomUser?: MyRoomUser;
  /** @deprecated use myRoomUser.isMuted */
  isMuted: boolean;
}

export interface MessageData {
  uuid: string;
  senderUuid: string;
  senderNickname: string;
  message: string;
  messageType: string;
  createdAt: any;
  updatedAt: any;
  avatar: any;
  isDeleted: boolean;
  isEdited: boolean;
}

export interface SettlementData {
  payerUuid: string;
  payerNickname: string;
  payAmount: number;
  currentParticipant: number;
  payerBankName: string;
  payerAccountNumber: string;
  payerAccountHolderName: string;
  updateAccount: boolean;
  roomUuid: string;
}

export interface SettlementCreateData {
  payAmount: number;
  currentParticipant: number;
  payerBankName: string;
  payerAccountNumber: string;
  payerAccountHolderName: string;
  updateAccount: boolean;
  roomUuid: string;
}

export interface SettlementInfoData {
  roomUuid: string;
  payerUuid: string;
  payerNickname: string;
  payerAccountNumber: string;
  payerAccountHolderName: string;
  payerBankName: string;
  payAmount: number;
  currentParticipant: number;
  payAmountPerPerson: number;
}

export interface PaxiUser {
  uuid: string;
  name: string;
  userType: string;
  email: string;
  nickname?: string;
  avatar?: string;
}

export interface MyRoomUser {
  status: string;
  isPaid: boolean;
  isMuted: boolean;
  lastReadChatUuid: string | null;
  kickedReason: string | null;
  hasNewMessage: boolean;
}

export interface MyRoomData {
  /** @deprecated use myRoomUser.hasNewMessage */
  hasNewMessage: boolean;
  /** @deprecated use myRoomUser.isMuted */
  isMuted: boolean;
  /** @deprecated use myRoomUser.kickedReason */
  kickedReason: string;
  /** @deprecated use myRoomUser.status */
  userStatus: string;
  myRoomUser?: MyRoomUser;
  uuid: string;
  title: string;
  ownerUuid: string;
  departureLocation: string;
  destinationLocation: string;
  maxParticipant: number;
  currentParticipant: number;
  departureTime: string;
  status: string;
  description: string;
  payerUuid: string;
  payAmount: number;
}

export interface RoomDataType {
  uuid: string;
  title: string;
  ownerUuid: string;
  departureLocation: string;
  destinationLocation: string;
  maxParticipant: number;
  currentParticipant: number;
  departureTime: string; // Date
  status: string;
  description: string;
  payerUuid: string;
  payAmount: number;
  createdAt: string;
  updatedAt: string;
}
