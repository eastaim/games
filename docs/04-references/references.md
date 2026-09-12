# 참고 자료

## 배포

- [GitHub Pages 프로젝트 사이트의 base 경로](https://vitejs.dev/guide/static-deploy.html#github-pages)
  — 서브경로 배포에서 에셋이 404 나는 가장 흔한 원인

## iframe

- [MDN: `<iframe>`](https://developer.mozilla.org/ko/docs/Web/HTML/Element/iframe)
- [MDN: `Window.postMessage()`](https://developer.mozilla.org/ko/docs/Web/API/Window/postMessage)
  — 받는 쪽에서 `origin`을 반드시 확인해야 하는 이유
- [MDN: 동일 출처 정책](https://developer.mozilla.org/ko/docs/Web/Security/Same-origin_policy)
  — 포털이 게임의 localStorage를 읽을 수 있는 근거

## CSS

- [MDN: 큰/작은/동적 뷰포트 단위 (`dvh`)](https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths)
  — 모바일 주소창 때문에 `100vh`를 쓰면 안 되는 이유
- [MDN: `prefers-color-scheme`](https://developer.mozilla.org/ko/docs/Web/CSS/@media/prefers-color-scheme)

## 관련 저장소

- [y3games/phaser-starter](https://github.com/y3games/phaser-starter) — 게임 템플릿. 빌드·배포 설정의 출처
- [y3games/MergeDrop](https://github.com/y3games/MergeDrop) — 포털에 등록된 첫 게임
