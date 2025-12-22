# How to setup React Native

https://velog.io/@developer-sora/React-Native-Mac%EC%97%90%EC%84%9C-%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0

위의 포스트를 참고합니다.

단, JDK 설치 때는

```bash
brew install openjdk@17
```

로 설치합니다.

제대로 설치 되었는지 확인하려면,

```bash
npx react-native doctor
```

로 확인합니다.


## room.html
POPO EC2 머신에 있는(`/var/www/popo/room.html`) 파일로, `/room/*`경로로 딥링크 요청이 들어왔을 때 아래와 같은 역할을 수행합니다.
- 카카오톡과 같은 In-App 브라우저에서 카풀 방 공유 링크를 눌렀을 때 앱으로 이어줌 
- 디바이스에 앱이 깔려있지 않으면, 플레이/앱스토어로 리다이렉트 시켜줌

