/**
 * 리소스 정의 — `?resource=` 로 조회할 수 있는 것들.
 *
 * 현재 faneasy가 실제로 제공하는 8종을 그대로 승계하고, brand_settings를 신규로 더한다.
 * 새 리소스를 추가할 때는 여기에 이름과 형태를 먼저 정의한다.
 */
/** 런타임 검증용 — 알 수 없는 리소스 이름을 거를 때 쓴다 */
export const ADMIN_RESOURCE_NAMES = [
    'sites',
    'approvals',
    'inquiries',
    'stats',
    'site_stats',
    'instagram',
    'activity_logs',
    'ga_stats',
    'brand_settings',
];
export function isAdminResourceName(v) {
    return ADMIN_RESOURCE_NAMES.includes(v);
}
