/* global http, json, output, POPO_E2E_EMAIL, POPO_E2E_PASSWORD, PUSH_TITLE -- Maestro runScript가 넣어 주는 전역 */
// 이 흐름의 테스트 계정에게만 dev 서버로 푸시를 보낸다(Paxi 서버 → FCM → APNs/기기).
// 알림을 누르면 이동할 방으로 계정이 이미 들어가 있는 방 하나를 고르고, 흐름이 확인할 수 있게 output.push에 남긴다.
// 쿠키와 계정은 로그에 남기지 않는다.
const POPO_API = 'https://api.popo-dev.poapper.club';
const PAXI_API = 'https://api.paxi.popo-dev.poapper.club';

const login = http.post(POPO_API + '/auth/login', {
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: POPO_E2E_EMAIL, password: POPO_E2E_PASSWORD}),
});
const cookie = String(login.headers['set-cookie']).match(
  /Authentication=[^;]+/,
)[0];
const auth = {headers: {Cookie: cookie, 'Content-Type': 'application/json'}};

const me = json(http.get(POPO_API + '/auth/myInfo', auth).body);
const rooms = json(http.get(PAXI_API + '/room/my', auth).body);
const room = rooms.find(r => r.status === 'ACTIVE') || rooms[0];

const sent = json(
  http.post(PAXI_API + '/push/send', {
    headers: auth.headers,
    body: JSON.stringify({
      userUuids: [me.uuid],
      title: PUSH_TITLE,
      body: 'e2e',
      data: {roomUuid: room.uuid},
    }),
  }).body,
);
console.log(
  'push success ' + sent.successCount + ', failure ' + sent.failureCount,
);

// 방 제목을 정규식 선택자로 쓰므로 특수문자를 이스케이프한다.
output.push = {roomTitle: room.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')};
