# @vibers/admin-kit

중앙 어드민(vibers.co.kr) ↔ 각 프로젝트 연동의 **계약 + 서버 핸들러**.
런타임 의존성이 없다. 화면도 없다.

## 설치

```json
{ "dependencies": { "@vibers/admin-kit": "github:vibers-leo/vibers-admin-kit#v1.0.0" } }
```

npm 토큰이 필요 없다. Vercel·Docker 모두 git 의존성을 그대로 받는다.
**버전은 태그로 고정**한다 — `#main`으로 두면 원본이 바뀔 때 예고 없이 따라간다.

## 붙이는 법

```ts
// app/api/vibers-admin/route.ts
import { createAdminHandler, createFirestoreAdapter } from '@vibers/admin-kit';
import { adminDb } from '@/lib/firebaseAdmin';

export const { GET, POST } = createAdminHandler(
  createFirestoreAdapter({
    project: { id: 'boineun', name: '보이는마케팅', stack: 'nextjs', adminVersion: '1.0.0' },
    db: adminDb,
  })
);
```

`VIBERS_ADMIN_SECRET` 환경변수만 있으면 끝난다.

## 기능 토글

`capabilities`로 이 프로젝트가 무엇을 지원하는지 신고한다.
중앙 어드민은 이 목록을 보고 화면을 그린다 — 없는 기능은 아예 안 그린다.

```ts
capabilities: () => ['read:stats', 'read:activity'],  // 문의 없는 사이트
```

빈 값을 돌려주면 "데이터 0건"과 "기능 없음"이 구분되지 않으므로, 기능 자체를 목록에서 뺀다.

## 컬렉션 이름이 다를 때

```ts
createFirestoreAdapter({
  project: {...}, db: adminDb,
  collections: { inquiries: 'contact_requests', users: 'members' },
})
```

## Firestore가 아닐 때

`AdminDataAdapter`를 직접 구현한다. Postgres든 Rails든 상관없다.

## 인증

`VIBERS_ADMIN_SECRET`과 대조한다. 헤더 이름이 현장에서 세 갈래로 쓰이고 있어
(`x-vibers-admin-secret` / `x-vibers-secret` / `x-vibers-apikey`) **전부 수용**한다.

## 원본

`vibers-home/packages/admin-{protocol,server}` 가 원본이다.
이 저장소는 다른 레포가 설치할 수 있게 묶어 배포하는 사본이다.
