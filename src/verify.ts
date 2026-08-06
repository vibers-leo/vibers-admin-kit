/**
 * 응답 검증 — 프로젝트가 계약을 지키는지 런타임에 확인한다.
 *
 * 중앙 어드민이 각 프로젝트 응답을 받을 때 쓰거나,
 * 함대 점검 스크립트에서 25개 엔드포인트를 훑을 때 쓴다.
 * 타입은 컴파일 타임에만 존재하므로, 남의 서버가 보낸 JSON은 이걸로 걸러야 한다.
 */

import type { VibersAdminResponse, ProjectHealth } from './envelope';

const HEALTH_VALUES: readonly ProjectHealth[] = ['healthy', 'warning', 'error', 'pending'];

export interface VerifyResult {
  ok: boolean;
  /** 계약 위반 항목 */
  problems: string[];
  /** 신규 필드를 갖춘 응답인지 */
  isProtocolAware: boolean;
}

export function verifyAdminResponse(raw: unknown): VerifyResult {
  const problems: string[] = [];

  if (raw === null || typeof raw !== 'object') {
    return { ok: false, problems: ['응답이 객체가 아님'], isProtocolAware: false };
  }
  const r = raw as Partial<VibersAdminResponse>;

  if (typeof r.projectId !== 'string' || !r.projectId) problems.push('projectId 누락');
  if (typeof r.projectName !== 'string' || !r.projectName) problems.push('projectName 누락');

  if (r.stats === null || typeof r.stats !== 'object') {
    problems.push('stats 누락');
  } else {
    for (const k of ['mau', 'totalUsers', 'contentCount', 'recentSignups'] as const) {
      if (typeof r.stats[k] !== 'number') problems.push(`stats.${k} 가 숫자가 아님`);
    }
  }

  if (!Array.isArray(r.recentActivity)) {
    problems.push('recentActivity 가 배열이 아님');
  } else {
    r.recentActivity.forEach((a, i) => {
      if (typeof a?.id !== 'string') problems.push(`recentActivity[${i}].id 누락`);
      if (typeof a?.label !== 'string') problems.push(`recentActivity[${i}].label 누락`);
      if (typeof a?.timestamp !== 'string' || Number.isNaN(Date.parse(a.timestamp))) {
        problems.push(`recentActivity[${i}].timestamp 가 유효한 ISO 문자열이 아님`);
      }
    });
  }

  if (!HEALTH_VALUES.includes(r.health as ProjectHealth)) {
    problems.push(`health 값이 계약 밖: ${String(r.health)}`);
  }

  const isProtocolAware = typeof r.protocol === 'number' && r.project != null;

  return { ok: problems.length === 0, problems, isProtocolAware };
}
