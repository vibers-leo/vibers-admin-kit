/**
 * 프로토콜 상수 — 중앙 어드민(vibers.co.kr) ↔ 각 프로젝트 연동의 계약.
 *
 * 이 파일은 의존성이 없다. Next.js·React·Firebase 어디에도 묶이지 않으므로
 * Rails를 포함한 어떤 스택에서도 이 정의를 기준으로 삼을 수 있다.
 */
/**
 * 와이어 프로토콜 버전.
 *
 * 패키지 semver와 분리한다 — 패키지 1.5.0이 protocol 1을 말할 수 있어야 한다.
 * 응답 형태를 깨는 변경에만 올린다. 필드 추가는 올리지 않는다.
 */
export const PROTOCOL_VERSION = 1;
/** 클라이언트가 원하는 프로토콜 버전을 알리는 헤더 */
export const PROTOCOL_HEADER = 'x-vibers-protocol';
/**
 * 정규 인증 헤더.
 *
 * 지금은 아래 LEGACY_AUTH_HEADERS가 현장에서 세 갈래로 쓰이고 있다.
 * 서버는 당분간 전부 수용하고, 모든 프로젝트가 정규 이름으로 옮겨간 뒤 레거시를 제거한다.
 */
export const AUTH_HEADER = 'x-vibers-key';
/**
 * 현장에서 실제로 쓰이는 헤더들 — 호출하는 쪽마다 다르다.
 *
 *   x-vibers-admin-secret  중앙 어드민의 읽기 (lib/admin/aggregator.ts)
 *   x-vibers-secret        admin-kit 패키지 핸들러
 *   x-vibers-apikey        중앙 어드민의 쓰기 (RemoteProjectAdapter)
 *
 * 서버 구현체는 AUTH_HEADER와 이 목록을 모두 수용해야 한다.
 */
export const LEGACY_AUTH_HEADERS = [
    'x-vibers-admin-secret',
    'x-vibers-secret',
    'x-vibers-apikey',
];
/** 인증에 쓸 수 있는 모든 헤더 이름 (정규 + 레거시) */
export const ACCEPTED_AUTH_HEADERS = [AUTH_HEADER, ...LEGACY_AUTH_HEADERS];
