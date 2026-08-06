/**
 * 능력(capability) 선언 — 프로젝트가 "내가 뭘 할 수 있는지"를 알린다.
 *
 * 중앙 어드민은 이 목록을 보고 버튼을 그린다.
 * 지금 vibers-home의 content·members·orders 페이지에는 핸들러가 없는 버튼이 남아 있는데,
 * capability 기반으로 렌더하면 그런 상태가 구조적으로 불가능해진다.
 */
export declare const ADMIN_CAPABILITIES: readonly ["read:stats", "read:sites", "read:inquiries", "read:activity", "read:instagram", "read:ga", "read:brand", "write:brand_settings", "write:inquiry_status", "write:site_active"];
export type AdminCapability = (typeof ADMIN_CAPABILITIES)[number];
export declare function hasCapability(list: readonly AdminCapability[] | undefined, c: AdminCapability): boolean;
//# sourceMappingURL=capabilities.d.ts.map