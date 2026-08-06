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
/** createdAt이 ISO 문자열일 수도 Timestamp일 수도 있다 */
function toIso(v) {
    if (typeof v === 'string')
        return v;
    const d = v?.toDate?.();
    return d ? d.toISOString() : null;
}
export function createFirestoreAdapter(cfg) {
    const col = {
        inquiries: cfg.collections?.inquiries ?? 'inquiries',
        users: cfg.collections?.users ?? 'users',
        activityLogs: cfg.collections?.activityLogs ?? 'activity_logs',
    };
    async function count(name) {
        try {
            return (await cfg.db.collection(name).count().get()).data().count ?? 0;
        }
        catch {
            return 0;
        }
    }
    return {
        projectInfo: () => cfg.project,
        capabilities: () => cfg.capabilities ?? ['read:stats', 'read:inquiries', 'read:activity', ...(cfg.sites ? ['read:sites'] : [])],
        async summary() {
            const [users, inquiries] = await Promise.all([count(col.users), count(col.inquiries)]);
            return {
                mau: 0,
                totalUsers: users,
                contentCount: cfg.sites ? cfg.sites().length : 0,
                recentSignups: inquiries,
            };
        },
        async recentActivity() {
            try {
                const snap = await cfg.db
                    .collection(col.inquiries)
                    .orderBy('createdAt', 'desc')
                    .limit(5)
                    .get();
                return snap.docs.map((d) => {
                    const r = d.data();
                    return {
                        id: `inq-${d.id}`,
                        type: 'inquiry',
                        label: `문의 접수: ${r.name ?? '익명'} — ${r.site ?? ''}`,
                        timestamp: toIso(r.createdAt) ?? new Date().toISOString(),
                    };
                });
            }
            catch {
                return [];
            }
        },
        async read(resource, query) {
            if (cfg.readOverride) {
                const custom = await cfg.readOverride(resource, query);
                if (custom !== undefined)
                    return custom;
            }
            if (resource === 'sites') {
                return cfg.sites ? cfg.sites() : undefined;
            }
            if (resource === 'inquiries') {
                const snap = await cfg.db
                    .collection(col.inquiries)
                    .orderBy('createdAt', 'desc')
                    .limit(query.limit ?? 100)
                    .get();
                const rows = snap.docs.map((d) => {
                    const r = d.data();
                    return {
                        id: d.id,
                        name: r.name ?? '-',
                        phone: r.phone ?? null,
                        email: r.email ?? null,
                        site: r.site ?? null,
                        siteDomain: r.siteDomain ?? null,
                        kind: r.kind ?? null,
                        workflowStatus: r.workflowStatus ?? r.status ?? null,
                        message: r.message ?? null,
                        createdAt: toIso(r.createdAt),
                    };
                });
                return rows;
            }
            if (resource === 'activity_logs') {
                const snap = await cfg.db.collection(col.activityLogs).limit(query.limit ?? 50).get();
                const rows = snap.docs.map((d) => {
                    const r = d.data();
                    return {
                        id: d.id,
                        site: r.site ?? null,
                        actor: r.actor ?? r.email ?? null,
                        action: r.action ?? '-',
                        detail: r.detail ?? null,
                        createdAt: toIso(r.createdAt),
                    };
                });
                return rows;
            }
            // 그 외는 프로젝트가 readOverride로 채운다
            return undefined;
        },
    };
}
