/**
 * createAdminHandler — 프로젝트가 중앙 어드민에 데이터를 내주는 창구.
 *
 * 지금까지는 각 프로젝트가 이 라우트를 손으로 200줄씩 복사해 썼다.
 * 그 결과 인증 헤더 이름이 프로젝트마다 갈라지고, 응답 형태도 조금씩 달라졌다.
 * 프로젝트가 분리될수록 복사본이 늘어나는 구조라 여기서 끊는다.
 *
 * 사용 (Next.js App Router):
 *   // app/api/vibers-admin/route.ts
 *   import { createAdminHandler } from '@vibers/admin-server';
 *   export const { GET, POST } = createAdminHandler(myAdapter);
 *
 * 화면은 없다. 순수 서버 라우트 핸들러다.
 */
import { type AdminCapability, type AdminMutation, type AdminMutationResult, type AdminProjectInfo, type AdminResourceMap, type AdminResourceName, type VibersAdminResponse } from './index';
/** 조회 옵션 — 프로젝트가 필요한 만큼만 해석하면 된다 */
export interface AdminQuery {
    limit?: number;
    site?: string;
    from?: string;
    to?: string;
}
export interface AdminActor {
    scope: 'control' | 'tenant';
    email?: string;
}
/**
 * 프로젝트가 구현하는 부분.
 * 데이터가 Firestore든 Postgres든 여기서 흡수한다 — 핸들러는 알 필요가 없다.
 */
export interface AdminDataAdapter {
    projectInfo(): AdminProjectInfo;
    capabilities(): AdminCapability[];
    /** 지원하지 않는 리소스는 undefined를 돌려준다 */
    read<K extends AdminResourceName>(resource: K, query: AdminQuery): Promise<AdminResourceMap[K] | undefined>;
    /** 대시보드 상단 요약 */
    summary(): Promise<VibersAdminResponse['stats']>;
    recentActivity(): Promise<VibersAdminResponse['recentActivity']>;
    /** 쓰기를 지원하지 않으면 구현하지 않아도 된다 */
    mutate?(mutation: AdminMutation, actor: AdminActor): Promise<AdminMutationResult>;
}
export declare function createAdminHandler(adapter: AdminDataAdapter): {
    GET: (req: Request) => Promise<Response>;
    POST: (req: Request) => Promise<Response>;
};
//# sourceMappingURL=handler.d.ts.map