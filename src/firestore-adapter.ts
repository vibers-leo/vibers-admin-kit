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

import type {
  AdminActivityItem,
  AdminCapability,
  AdminProjectInfo,
  AdminResourceMap,
  AdminResourceName,
  AdminSummaryStats,
} from './index';
import type { AdminDataAdapter, AdminQuery } from './handler';

/** firebase-admin Firestore의 필요한 부분만 (타입 의존을 피하기 위한 최소 정의) */
interface FirestoreLike {
  collection(path: string): {
    get(): Promise<{ size: number; docs: { id: string; data(): Record<string, unknown> }[] }>;
    limit(n: number): any;
    orderBy(field: string, dir?: 'asc' | 'desc'): any;
    where(field: string, op: string, value: unknown): any;
    count(): { get(): Promise<{ data(): { count: number } }> };
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
  readOverride?: <K extends AdminResourceName>(
    resource: K,
    query: AdminQuery
  ) => Promise<AdminResourceMap[K] | undefined>;
}

/** createdAt이 ISO 문자열일 수도 Timestamp일 수도 있다 */
function toIso(v: unknown): string | null {
  if (typeof v === 'string') return v;
  const d = (v as { toDate?: () => Date })?.toDate?.();
  return d ? d.toISOString() : null;
}

export function createFirestoreAdapter(cfg: FirestoreAdapterConfig): AdminDataAdapter {
  const col = {
    inquiries: cfg.collections?.inquiries ?? 'inquiries',
    users: cfg.collections?.users ?? 'users',
    activityLogs: cfg.collections?.activityLogs ?? 'activity_logs',
  };

  async function count(name: string): Promise<number> {
    try {
      return (await cfg.db.collection(name).count().get()).data().count ?? 0;
    } catch {
      return 0;
    }
  }

  return {
    projectInfo: () => cfg.project,

    capabilities: () =>
      cfg.capabilities ?? ['read:stats', 'read:inquiries', 'read:activity', ...(cfg.sites ? (['read:sites'] as const) : [])],

    async summary(): Promise<AdminSummaryStats> {
      const [users, inquiries] = await Promise.all([count(col.users), count(col.inquiries)]);
      return {
        mau: 0,
        totalUsers: users,
        contentCount: cfg.sites ? cfg.sites().length : 0,
        recentSignups: inquiries,
      };
    },

    async recentActivity(): Promise<AdminActivityItem[]> {
      try {
        const snap = await cfg.db
          .collection(col.inquiries)
          .orderBy('createdAt', 'desc')
          .limit(5)
          .get();
        return snap.docs.map((d: { id: string; data(): Record<string, unknown> }) => {
          const r = d.data();
          return {
            id: `inq-${d.id}`,
            type: 'inquiry' as const,
            label: `문의 접수: ${(r.name as string) ?? '익명'} — ${(r.site as string) ?? ''}`,
            timestamp: toIso(r.createdAt) ?? new Date().toISOString(),
          };
        });
      } catch {
        return [];
      }
    },

    async read(resource, query) {
      if (cfg.readOverride) {
        const custom = await cfg.readOverride(resource, query);
        if (custom !== undefined) return custom;
      }

      if (resource === 'sites') {
        return cfg.sites ? (cfg.sites() as AdminResourceMap[typeof resource]) : undefined;
      }

      if (resource === 'inquiries') {
        const snap = await cfg.db
          .collection(col.inquiries)
          .orderBy('createdAt', 'desc')
          .limit(query.limit ?? 100)
          .get();
        const rows = snap.docs.map((d: { id: string; data(): Record<string, unknown> }) => {
          const r = d.data();
          return {
            id: d.id,
            name: (r.name as string) ?? '-',
            phone: (r.phone as string) ?? null,
            email: (r.email as string) ?? null,
            site: (r.site as string) ?? null,
            siteDomain: (r.siteDomain as string) ?? null,
            kind: (r.kind as string) ?? null,
            workflowStatus: (r.workflowStatus as string) ?? (r.status as string) ?? null,
            message: (r.message as string) ?? null,
            createdAt: toIso(r.createdAt),
          };
        });
        return rows as AdminResourceMap[typeof resource];
      }

      if (resource === 'activity_logs') {
        const snap = await cfg.db.collection(col.activityLogs).limit(query.limit ?? 50).get();
        const rows = snap.docs.map((d: { id: string; data(): Record<string, unknown> }) => {
          const r = d.data();
          return {
            id: d.id,
            site: (r.site as string) ?? null,
            actor: (r.actor as string) ?? (r.email as string) ?? null,
            action: (r.action as string) ?? '-',
            detail: (r.detail as string) ?? null,
            createdAt: toIso(r.createdAt),
          };
        });
        return rows as AdminResourceMap[typeof resource];
      }

      // 그 외는 프로젝트가 readOverride로 채운다
      return undefined;
    },
  };
}
