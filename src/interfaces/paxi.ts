export interface UserData {
  userUuid: string;
  nickname: string;
  isPaid: boolean;
  isOwner: boolean;
  status: string;
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
  roomUser: UserData[];
}

export interface MessageData {
  uuid: string;
  senderUuid: string;
  senderName: string;
  message: string;
  messageType: string;
  createdAt: any;
  updatedAt: any;
  avatar: any;
  isMe: boolean;
}

export interface SettlementData {
  payAmount: number;
  currentParticipant: number;
  payerBankName: string;
  payerAccountNumber: string;
  payerAccountHolderName: string;
  updateAccount: boolean;
  roomUuid: string;
}

export interface PaxiUser {
  uuid: string;
  name: string;
  userType: string;
  email: string;
  nickname?: string;
  avatar?: string;
}

export interface RoomDataType {
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
  createdAt: string;
  updatedAt: string;
}

export interface ParsedRoomDataType {
  uuid: string;
  title: string;
  departureTime: string;
  remain: number;
  total: number;
  departure: string;
  destination: string;
}
