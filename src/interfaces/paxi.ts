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
  room_users: UserData[];
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
