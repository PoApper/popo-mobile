export const CLUB_CATEGORIES = [
  'performance1',
  'performance2',
  'sports',
  'hobbyAndExhibition',
  'study',
  'societyAndReligion',
] as const;

export type ClubCategoryKey = (typeof CLUB_CATEGORIES)[number];
