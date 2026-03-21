import EncryptedStorage from 'react-native-encrypted-storage';
import paxi_api from './paxi_api';

const MUTED_ROOMS_KEY = 'muted_rooms';

export async function updateMuteStatus(
  roomUuid: string,
  isMuted: boolean,
): Promise<void> {
  await paxi_api.patch(`/room/${roomUuid}/mute`, {isMuted});
  updateLocalMuteCache(roomUuid, isMuted).catch(error =>
    console.error('Failed to update local mute cache:', error),
  );
}

async function updateLocalMuteCache(
  roomUuid: string,
  isMuted: boolean,
): Promise<void> {
  const mutedRooms = await getLocalMutedRooms();
  const updatedSet = new Set(mutedRooms);

  if (isMuted) {
    updatedSet.add(roomUuid);
  } else {
    updatedSet.delete(roomUuid);
  }

  await EncryptedStorage.setItem(
    MUTED_ROOMS_KEY,
    JSON.stringify([...updatedSet]),
  );
}

export async function isRoomMuted(roomUuid: string): Promise<boolean> {
  const mutedRooms = await getLocalMutedRooms();
  return mutedRooms.includes(roomUuid);
}

async function getLocalMutedRooms(): Promise<string[]> {
  const data = await EncryptedStorage.getItem(MUTED_ROOMS_KEY);
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data);
  } catch {
    await EncryptedStorage.removeItem(MUTED_ROOMS_KEY);
    return [];
  }
}
