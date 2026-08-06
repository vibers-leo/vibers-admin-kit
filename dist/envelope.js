/**
 * 응답 봉투 — 모든 프로젝트의 /api/vibers-admin 이 돌려주는 형태.
 *
 * 하위호환 원칙: 1.x 동안 기존 최상위 키(projectId·projectName·stats·recentActivity·health)는
 * 절대 제거하지 않는다. 신규 필드는 optional로만 추가한다.
 * 중앙 어드민은 신규 필드가 없으면 legacy 응답으로 간주하고 폴백한다.
 */
/** 신규 필드를 갖춘 응답인지 판별 */
export function isProtocolResponse(r) {
    return typeof r.protocol === 'number' && r.project != null;
}
