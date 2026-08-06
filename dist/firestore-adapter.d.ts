/**
 * Firestore 기반 프로젝트용 어댑터 골격.
 *
 * 컬렉션 이름을 프로젝트마다 지정할 수 있다.
 * 기존 admin-kit이 `inquiries`·`users` 같은 이름을 코드에 박아두어
 * 다른 스키마를 쓰는 프로젝트는 아예 쓸 수 없었던 문제를 없앤다.
 *
 * firebase-admin에 직접 의존하지 않는다 — 이미 초기화된 Firestore 인스턴스를 받는다.
 * (프로젝트마다 초기화 방식이 달라서 여기서 initializeApp을 하면 충돌한다)
 */
import type { AdminCapability, AdminProjectInfo, AdminResourceMap, AdminResourceName } from './index';
import type { AdminDataAdapter, AdminQuery } from './handler';
/** firebase-admin Firestore의 필요한 부분만 (타입 의존을 피하기 위한 최소 정의) */
interface FirestoreLike {
    collection(path: string): {
        get(): Promise<{
            size: number;
            docs: {
                id: string;
                data(): Record<string, unknown>;
            }[];
        }>;
        limit(n: number): any;
        orderBy(field: string, dir?: 'asc' | 'desc'): any;
        where(field: string, op: string, value: unknown): any;
        count(): {
            get(): Promise<{
                data(): {
                    count: number;
                };
            }>;
        };
    };
}
export interface FirestoreAdapterConfig {
    project: AdminProjectInfo;
    db: FirestoreLike;
    /** 컬렉션 이름 — 프로젝트마다 다를 수 있다 */
    collections?: {
        inquiries?: string;
        users?: string;
        activityLogs?: string;
    };
    /** 사이트 목록. 코드 레지스트리를 쓰는 프로젝트는 여기에 넘긴다 */
    sites?: () => AdminResourceMap['sites'];
    capabilities?: AdminCapability[];
    /** 기본 구현으로 부족한 리소스는 여기서 직접 처리한다 */
    readOverride?: <K extends AdminResourceName>(resource: K, query: AdminQuery) => Promise<AdminResourceMap[K] | undefined>;
}
export declare function createFirestoreAdapter(cfg: FirestoreAdapterConfig): AdminDataAdapter;
export {};
//# sourceMappingURL=firestore-adapter.d.ts.map