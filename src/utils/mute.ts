import paxi_api from './paxi_api';

export async function updateMuteStatus(
  roomUuid: string,
  isMuted: boolean,
): Promise<void> {
  await paxi_api.patch(`/room/${roomUuid}/mute`, {isMuted});
}
