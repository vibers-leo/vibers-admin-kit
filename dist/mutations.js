/**
 * 변경 요청 — 중앙 어드민이 프로젝트에 쓰기를 지시하는 형태.
 *
 * 자유형 patch를 받지 않는다. op 유니온으로 고정해야 서버가 무엇을 허용할지 명확해지고,
 * 지원하지 않는 동작에 'unsupported_mutation'을 정직하게 돌려줄 수 있다.
 */
export const ADMIN_MUTATION_OPS = [
    'brand_settings.update',
    'inquiry.update_status',
    'site.set_active',
];
export function isAdminMutationOp(v) {
    return ADMIN_MUTATION_OPS.includes(v);
}
