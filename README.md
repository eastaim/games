# 게임 포털

웹 게임을 한 곳에서 골라 바로 플레이하는 미니 포털.

**https://y3games.github.io/games/**

게임은 각자 저장소와 각자 GitHub Pages 배포를 그대로 유지합니다. 이 저장소는 목록 화면과
실행 껍데기만 담당하고, 고른 게임을 iframe으로 띄웁니다.

## 새 게임 추가하기

`src/catalog/games.ts`에 항목 하나를 넣으면 끝입니다. 게임 쪽은 고칠 게 없습니다.

```ts
{
  id: 'mygame',                   // 라우트(#/game/mygame)와 점수 키(mygame.best)가 여기서 나옴
  title: '내 게임',
  tagline: '한 줄 설명',
  path: '/MyGame/',               // 배포된 Pages 경로. 앞뒤 슬래시 필수
  accent: '#f2792c',              // 썸네일 색
  status: 'live',                 // 아직 배포 전이면 'wip'
}
```

썸네일은 `accent` 색에서 코드로 그려지므로 이미지 파일을 준비할 필요가 없습니다.

## 최고 점수

포털과 게임이 같은 오리진(`y3games.github.io`)에 있으므로, 포털이 게임의 localStorage 기록을
그대로 읽어 카드에 표시합니다. 게임은 `<id>.best` 키에 개인 최고 점수를 저장하면 됩니다.
이미 다른 키를 쓰고 있다면 레지스트리에 `scoreKey`로 알려주면 됩니다.

로컬 개발에서는 게임을 배포 호스트에서 불러오므로(교차 오리진) 점수가 보이지 않습니다.
배포된 사이트에서는 정상 표시됩니다.

## 개발

```bash
npm install
npm run dev      # http://localhost:5173/
npm run check    # 타입 검사 + 린트 + 테스트
npm run build
```

`main`에 push하면 GitHub Actions가 `npm run check`를 통과시킨 뒤 Pages로 배포합니다.
