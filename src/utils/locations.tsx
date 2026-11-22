import i18next, {getCurrentLocale} from '@utils/i18n';

/** 키는 서버에 저장되는 값이라 한글을 유지하고, 표시명만 번역한다. */
const PAXI_LOCATION_KEYS = {
  지곡회관: 'jigok',
  학생회관: 'studentHall',
  '체인지업 그라운드': 'changeUp',
  'KTX 포항역': 'ktx',
  '포항 터미널': 'terminal',
} as const;

type PaxiLocationId = keyof typeof PAXI_LOCATION_KEYS;

const isPaxiLocationId = (location: string): location is PaxiLocationId =>
  Object.prototype.hasOwnProperty.call(PAXI_LOCATION_KEYS, location);

/** 프리셋 장소면 번역된 이름을, 직접 입력한 장소면 그대로 돌려준다. */
export const getPaxiLocationLabel = (location: string): string =>
  isPaxiLocationId(location)
    ? i18next.t(`paxi.locations.${PAXI_LOCATION_KEYS[location]}`)
    : location;

export const getPaxiLocations = () =>
  (Object.keys(PAXI_LOCATION_KEYS) as PaxiLocationId[]).map(id => ({
    id,
    name: getPaxiLocationLabel(id),
  }));

/** 출발 시각 문구. 기존 표기를 따라 24시간제로 보여준다. */
export const formatPaxiDeparture = (time: string, withYear = true) =>
  i18next.t('paxi.departsAt', {
    time: new Date(time).toLocaleString(getCurrentLocale(), {
      year: withYear ? 'numeric' : undefined,
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  });

// 기존 객체 형태의 PAXI_DISTANCE_INFO, PAXI_DURATION_INFO를 함수로 변경

export function getPaxiDistanceInfo(
  departure: string,
  arrival: string,
): string {
  const table: Record<string, Record<string, string>> = {
    지곡회관: {
      학생회관: '1.2km',
      '체인지업 그라운드': '650m',
      'KTX 포항역': '14km',
      '포항 터미널': '4km',
    },
    학생회관: {
      지곡회관: '1.2km',
      '체인지업 그라운드': '800m',
      'KTX 포항역': '14km',
      '포항 터미널': '4km',
    },
    '체인지업 그라운드': {
      지곡회관: '650m',
      학생회관: '800m',
      'KTX 포항역': '14km',
      '포항 터미널': '4km',
    },
    'KTX 포항역': {
      지곡회관: '14km',
      학생회관: '14km',
      '체인지업 그라운드': '14km',
      '포항 터미널': '9.5km',
    },
    '포항 터미널': {
      지곡회관: '4km',
      학생회관: '4km',
      '체인지업 그라운드': '4km',
      'KTX 포항역': '9.5km',
    },
  };
  return table[departure]?.[arrival] ?? '-';
}

export function getPaxiDurationInfo(
  departure: string,
  arrival: string,
): string {
  const table: Record<string, Record<string, [number, number]>> = {
    지곡회관: {
      학생회관: [3, 4],
      '체인지업 그라운드': [1, 2],
      'KTX 포항역': [16, 20],
      '포항 터미널': [9, 12],
    },
    학생회관: {
      지곡회관: [3, 4],
      '체인지업 그라운드': [1, 2],
      'KTX 포항역': [16, 20],
      '포항 터미널': [9, 12],
    },
    '체인지업 그라운드': {
      지곡회관: [1, 2],
      학생회관: [1, 2],
      'KTX 포항역': [16, 20],
      '포항 터미널': [9, 12],
    },
    'KTX 포항역': {
      지곡회관: [16, 20],
      학생회관: [16, 20],
      '체인지업 그라운드': [16, 20],
      '포항 터미널': [17, 22],
    },
    '포항 터미널': {
      지곡회관: [9, 12],
      학생회관: [9, 12],
      '체인지업 그라운드': [9, 12],
      'KTX 포항역': [17, 22],
    },
  };
  const range = table[departure]?.[arrival];
  return range
    ? i18next.t('paxi.durationRange', {min: range[0], max: range[1]})
    : '-';
}
