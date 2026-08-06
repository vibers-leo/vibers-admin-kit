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

import {
  ACCEPTED_AUTH_HEADERS,
  PROTOCOL_VERSION,
  isAdminResourceName,
  type AdminCapability,
  type AdminMutation,
  type AdminMutationResult,
  type AdminProjectInfo,
  type AdminResourceMap,
  type AdminResourceName,
  type VibersAdminResponse,
} from './index';

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
  read<K extends AdminResourceName>(
    resource: K,
    query: AdminQuery
  ): Promise<AdminResourceMap[K] | undefined>;
  /** 대시보드 상단 요약 */
  summary(): Promise<VibersAdminResponse['stats']>;
  recentActivity(): Promise<VibersAdminResponse['recentActivity']>;
  /** 쓰기를 지원하지 않으면 구현하지 않아도 된다 */
  mutate?(mutation: AdminMutation, actor: AdminActor): Promise<AdminMutationResult>;
}

function authorized(req: Request): boolean {
  const secret = process.env.VIBERS_ADMIN_SECRET;
  if (!secret) return false;
  // 헤더 이름이 현장에서 세 갈래로 쓰이고 있어 전부 수용한다
  return ACCEPTED_AUTH_HEADERS.some((h) => req.headers.get(h) === secret);
}

function unauthorized() {
  return Response.json({ error: 'Unauthorized', code: 'unauthorized' }, { status: 401 });
}

export function createAdminHandler(adapter: AdminDataAdapter) {
  async function GET(req: Request): Promise<Response> {
    if (!authorized(req)) return unauthorized();

    const url = new URL(req.url);
    const resource = url.searchParams.get('resource');
    const project = adapter.projectInfo();

    // ?resource= 단건 조회
    if (resource) {
      if (!isAdminResourceName(resource)) {
        return Response.json(
          { resource, data: null, error: { code: 'unsupported_resource', message: `알 수 없는 리소스: ${resource}` } },
          { status: 400 }
        );
      }
      try {
        const query: AdminQuery = {
          limit: Number(url.searchParams.get('limit')) || undefined,
          site: url.searchParams.get('site') ?? undefined,
          from: url.searchParams.get('from') ?? undefined,
          to: url.searchParams.get('to') ?? undefined,
        };
        const data = await adapter.read(resource, query);
        if (data === undefined) {
          return Response.json(
            { resource, data: null, error: { code: 'unsupported_resource', message: `${project.name}은 ${resource}를 제공하지 않습니다.` } },
            { status: 501 }
          );
        }
        return Response.json({ resource, data, protocol: PROTOCOL_VERSION });
      } catch (err) {
        console.error(`[vibers-admin:${project.id}:${resource}]`, err);
        return Response.json(
          { resource, data: null, error: { code: 'upstream_error', message: '조회 실패' } },
          { status: 500 }
        );
      }
    }

    // 기본 조회 — 대시보드 요약
    try {
      const [stats, recentActivity] = await Promise.all([
        adapter.summary(),
        adapter.recentActivity(),
      ]);
      const body: VibersAdminResponse = {
        projectId: project.id,
        projectName: project.name,
        stats,
        recentActivity,
        health: 'healthy',
        protocol: PROTOCOL_VERSION,
        project,
        capabilities: adapter.capabilities(),
        resource: null,
        data: null,
        generatedAt: new Date().toISOString(),
      };
      return Response.json(body);
    } catch (err) {
      console.error(`[vibers-admin:${project.id}]`, err);
      // 실패해도 계약 형태는 지킨다 — 중앙 어드민이 파싱에 실패하지 않도록
      const body: VibersAdminResponse = {
        projectId: project.id,
        projectName: project.name,
        stats: { mau: 0, totalUsers: 0, contentCount: 0, recentSignups: 0 },
        recentActivity: [],
        health: 'error',
        protocol: PROTOCOL_VERSION,
        project,
        capabilities: adapter.capabilities(),
        resource: null,
        data: null,
        error: { code: 'upstream_error', message: '집계 실패' },
        generatedAt: new Date().toISOString(),
      };
      return Response.json(body);
    }
  }

  async function POST(req: Request): Promise<Response> {
    if (!authorized(req)) return unauthorized();

    const project = adapter.projectInfo();
    if (!adapter.mutate) {
      return Response.json(
        { ok: false, error: { code: 'unsupported_mutation', message: `${project.name}은 쓰기를 지원하지 않습니다.` } },
        { status: 501 }
      );
    }

    let mutation: AdminMutation;
    try {
      mutation = (await req.json()) as AdminMutation;
    } catch {
      return Response.json(
        { ok: false, error: { code: 'upstream_error', message: '본문이 올바른 JSON이 아닙니다.' } },
        { status: 400 }
      );
    }

    if (!mutation?.op) {
      return Response.json(
        { ok: false, error: { code: 'unsupported_mutation', message: 'op가 없습니다.' } },
        { status: 400 }
      );
    }

    try {
      // 지금은 중앙 어드민만 쓰기를 호출한다. 테넌트 경로가 생기면 여기서 구분한다.
      const result = await adapter.mutate(mutation, { scope: 'control' });
      return Response.json(result, { status: result.ok ? 200 : 409 });
    } catch (err) {
      console.error(`[vibers-admin:${project.id}:mutate:${mutation.op}]`, err);
      return Response.json(
        { ok: false, op: mutation.op, error: { code: 'upstream_error', message: '저장 실패' } },
        { status: 500 }
      );
    }
  }

  return { GET, POST };
}
