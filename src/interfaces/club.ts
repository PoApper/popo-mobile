export const CLUB_CATEGORIES = {
  performance1: '공연1',
  performance2: '공연2',
  sports: '체육',
  hobbyAndExhibition: '취미전시',
  study: '학술',
  societyAndReligion: '사회종교',
} as const;

export type ClubCategoryKey = keyof typeof CLUB_CATEGORIES;
export type ClubCategoryValue = (typeof CLUB_CATEGORIES)[ClubCategoryKey];
