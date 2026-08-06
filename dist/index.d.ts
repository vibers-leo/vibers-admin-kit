/**
 * @vibers/admin-kit
 *
 * 중앙 어드민(vibers.co.kr) ↔ 각 프로젝트 연동의 계약과 서버 핸들러.
 * 런타임 의존성이 없어 Next.js·Rails 어디서나 참조할 수 있다.
 */
export * from './protocol';
export * from './envelope';
export * from './resources';
export * from './capabilities';
export * from './mutations';
export * from './verify';
export * from './firestore-adapter';
export { createAdminHandler } from './handler';
export type { AdminDataAdapter, AdminQuery } from './handler';
//# sourceMappingURL=index.d.ts.map