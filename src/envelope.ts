/**
 * 응답 봉투 — 모든 프로젝트의 /api/vibers-admin 이 돌려주는 형태.
 *
 * 하위호환 원칙: 1.x 동안 기존 최상위 키(projectId·projectName·stats·recentActivity·health)는
 * 절대 제거하지 않는다. 신규 필드는 optional로만 추가한다.
 * 중앙 어드민은 신규 필드가 없으면 legacy 응답으로 간주하고 폴백한다.
 */

import type { AdminCapability } from './capabilities';
import type { AdminResourceName } from './resources';

/**
 * 프로젝트 건강 상태.
 *
 * 현장에서 실제로 쓰이는 값에 맞춘다 (components/admin/ProjectDashboard.tsx 기준).
 *   healthy  정상 연결
 *   warning  경고 — 응답은 오지만 일부 지표가 비정상
 *   error    연결 오류
 *   pending  아직 응답을 못 받음
 */
export type ProjectHealth = 'healthy' | 'warning' | 'error' | 'pending';

/** 오류 코드 — 중앙 어드민이 분기 처리할 수 있도록 문자열을 고정한다 */
export type AdminErrorCode =
  | 'unauthorized'
  | 'unsupported_protocol'
  | 'unsupported_resource'
  | 'unsupported_mutation'
  | 'conflict'
  | 'upstream_error';

/** 대시보드 상단 요약 지표 */
export interface AdminSummaryStats {
  mau: number;
  totalUsers: number;
  contentCount: number;
  recentSignups: number;
}

/** 최근 활동 한 줄 */
export interface AdminActivityItem {
  id: string;
  type: 'inquiry' | 'project_created' | 'order' | 'signup' | 'system';
  label: string;
  /** ISO 8601 */
  timestamp: string;
}

/**
 * 프로젝트가 자기 자신을 소개하는 블록.
 * `adminVersion`이 함대 버전표의 원천이다 — 중앙 어드민이 이 값을 모아
 * 어느 프로젝트가 어떤 버전을 쓰는지 실시간으로 그린다.
 */
export interface AdminProjectInfo {
  id: string;
  name: string;
  stack: 'nextjs' | 'rails' | 'other';
  /** @vibers/admin-server semver. 미구현 프로젝트는 생략 */
  adminVersion?: string;
}

/**
 * 표준 응답.
 *
 * 최상위 5개 키는 현행 구현이 이미 돌려주고 있는 것이라 그대로 둔다.
 * protocol·project·capabilities·resource·data 는 신규이며 optional이다.
 */
export interface VibersAdminResponse<T = unknown> {
  // ── 기존 계약 (1.x 동안 제거 금지) ──
  projectId: string;
  projectName: string;
  stats: AdminSummaryStats;
  recentActivity: AdminActivityItem[];
  health: ProjectHealth;

  // ── 신규 (없으면 legacy 응답으로 간주) ──
  /** 서버가 실제로 응답한 프로토콜 버전 */
  protocol?: number;
  project?: AdminProjectInfo;
  /** 이 프로젝트가 지원하는 동작. 중앙 어드민은 이걸 보고 버튼을 그린다 */
  capabilities?: AdminCapability[];
  /** ?resource= 로 조회했을 때 그 이름 */
  resource?: AdminResourceName | null;
  /** ?resource= 응답 본문 */
  data?: T | null;
  error?: { code: AdminErrorCode; message: string };
  /** ISO 8601 */
  generatedAt?: string;
}

/** ?resource= 단건 조회 응답 (현행 구현이 쓰는 축약형) */
export interface VibersAdminResourceResponse<T = unknown> {
  resource: AdminResourceName;
  data: T;
  protocol?: number;
  error?: { code: AdminErrorCode; message: string };
}

/** 신규 필드를 갖춘 응답인지 판별 */
export function isProtocolResponse(
  r: VibersAdminResponse
): r is VibersAdminResponse & { protocol: number; project: AdminProjectInfo } {
  return typeof r.protocol === 'number' && r.project != null;
}
