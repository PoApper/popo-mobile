export const PLACE_NAMES = {
  ATLAS_HALL: '아틀라스홀',
  BURGER_KING_SMALL_STAGE: '버거킹 소무대',
  CAREER_LOUNGE_COUNSELING_ROOM_A: '커리어라운지 상담실 A',
  CAREER_LOUNGE_COUNSELING_ROOM_B: '커리어라운지 상담실 B',
  CAREER_LOUNGE_SEMINAR_ROOM: '커리어라운지 세미나실',
  CINEMA_ROOM: '시네마 룸(Cinema Room)',
  CINEMA_ROOM_A: '시네마실A',
  CINEMA_ROOM_B: '시네마실B',
  COMMUNITY_ROOM_1: '커뮤니티 룸1(Community Room 1)',
  COMMUNITY_ROOM_2: '커뮤니티 룸 2(Community Room 2)',
  FIRST_FLOOR_HALL: '1층 홀',
  FOURTH_FLOOR_HALL: '4층 홀',
  GROUP_STUDY_ROOM_A: '그룹스터디룸A(Group Study Room A)',
  GROUP_STUDY_ROOM_B: '그룹스터디룸B(Group Study Room B)',
  GROUP_STUDY_ROOM_C: '그룹스터디룸C(Group Study Room C)',
  GROUP_STUDY_ROOM_D: '그룹스터디룸D(Group Study Room D)',
  JIGOK_HALL_MEETING_ROOM_3: '지곡회관 회의실3',
  KARAOKE_ROOM: '노래방',
  MAIN_CONFERENCE_ROOM: '대회의실',
  MUSIC_LISTENING_ROOM: '음악감상실',
  OASIS_MEETING_ROOM_1: '오아시스 회의실1',
  OASIS_MEETING_ROOM_2: '오아시스 회의실2',
  SECOND_FLOOR_HALL: '2층 홀',
  SOCIAL_KITCHEN_ROOM: '소셜 키친 룸 (Social Kitchen Room)',
  SOUNDPROOF_ROOM: '방음실',
  STAIRS_78: '78 계단',
  THIRD_FLOOR_HALL: '3층 홀',
} as const;

export type PlaceNameKey = keyof typeof PLACE_NAMES;
export type PlaceNameValue = (typeof PLACE_NAMES)[PlaceNameKey];

export const GROUP_STUDY_ROOM_NAMES = [
  PLACE_NAMES.GROUP_STUDY_ROOM_A,
  PLACE_NAMES.GROUP_STUDY_ROOM_B,
  PLACE_NAMES.GROUP_STUDY_ROOM_C,
  PLACE_NAMES.GROUP_STUDY_ROOM_D,
] as const;

export const isGroupStudyRoom = (placeName?: string): boolean =>
  !!placeName &&
  (GROUP_STUDY_ROOM_NAMES as readonly string[]).includes(placeName);

