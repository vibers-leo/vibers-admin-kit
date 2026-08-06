# CHANGELOG

프로토콜 버전(`PROTOCOL_VERSION`)은 패키지 semver와 분리한다.
응답 형태를 깨는 변경에만 프로토콜 버전을 올린다.

## v1.0.0 — 2026-08-07

protocol 1

최초 배포. 11개 레포가 각자 손복사하던 연동 라우트를 하나로 모았다.

- `protocol` 인증 헤더 3종 수용 목록, 프로토콜 버전
- `envelope` VibersAdminResponse
- `resources` 9종 (sites·approvals·inquiries·stats·site_stats·instagram·activity_logs·ga_stats·brand_settings)
- `capabilities` 기능 토글 — 중앙 어드민이 이걸 보고 화면을 그린다
- `mutations` 쓰기 op 유니온
- `verify` 런타임 계약 검증기
- `createAdminHandler` 서버 핸들러
- `createFirestoreAdapter` Firestore 골격 (컬렉션 이름 지정 가능)

검증: 더굿·작당페스타에서 실동작 확인. 두 사이트가 같은 코드로 서로 다른
capabilities를 신고하고, 중앙 어드민이 그에 맞춰 화면을 다르게 그린다.

## v1.0.1 — 2026-08-07

빌드 산출물(dist) 포함.

v1.0.0은 `src/*.ts` 원본을 직접 노출했는데, Turbopack이 node_modules 안의
TypeScript를 컴파일하지 않아 소비 프로젝트 빌드가 실패했다.
  `Unknown module type ./node_modules/@vibers/admin-kit/src/index.ts`

이제 컴파일된 `dist/*.js` + `*.d.ts`를 가리킨다. API 변경 없음.
