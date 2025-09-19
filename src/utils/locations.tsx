export const PAXI_LOCATIONS = [
  {id: '지곡회관', name: '지곡회관'},
  {id: '학생회관', name: '학생회관'},
  {id: '체인지업 그라운드', name: '체인지업 그라운드'},
  {id: 'KTX 포항역', name: 'KTX 포항역'},
  {id: '포항 터미널', name: '포항 터미널'},
];

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
  const table: Record<string, Record<string, string>> = {
    지곡회관: {
      학생회관: '3분-4분',
      '체인지업 그라운드': '1분-2분',
      'KTX 포항역': '16분-20분',
      '포항 터미널': '9분-12분',
    },
    학생회관: {
      지곡회관: '3분-4분',
      '체인지업 그라운드': '1분-2분',
      'KTX 포항역': '16분-20분',
      '포항 터미널': '9분-12분',
    },
    '체인지업 그라운드': {
      지곡회관: '1분-2분',
      학생회관: '1분-2분',
      'KTX 포항역': '16분-20분',
      '포항 터미널': '9분-12분',
    },
    'KTX 포항역': {
      지곡회관: '16분-20분',
      학생회관: '16분-20분',
      '체인지업 그라운드': '16분-20분',
      '포항 터미널': '17분-22분',
    },
    '포항 터미널': {
      지곡회관: '9분-12분',
      학생회관: '9분-12분',
      '체인지업 그라운드': '9분-12분',
      'KTX 포항역': '17분-22분',
    },
  };
  return table[departure]?.[arrival] ?? '-';
}
