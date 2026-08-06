/**
 * 변경 요청 — 중앙 어드민이 프로젝트에 쓰기를 지시하는 형태.
 *
 * 자유형 patch를 받지 않는다. op 유니온으로 고정해야 서버가 무엇을 허용할지 명확해지고,
 * 지원하지 않는 동작에 'unsupported_mutation'을 정직하게 돌려줄 수 있다.
 */

import type { AdminErrorCode } from './envelope';
import type { BrandSettings } from './resources';

/** 브랜드 설정에서 클라이언트가 바꿀 수 있는 필드만 */
export type BrandSettingsPatch = Partial<
  Omit<BrandSettings, 'siteId' | 'revision' | 'updatedAt' | 'updatedBy'>
>;

export type AdminMutation =
  | {
      op: 'brand_settings.update';
      siteId: string;
      patch: BrandSettingsPatch;
      /** 읽어온 시점의 revision. 서버 값과 다르면 conflict */
      baseRevision: number;
    }
  | {
      op: 'inquiry.update_status';
      id: string;
      workflowStatus: string;
      note?: string;
    }
  | {
      op: 'site.set_active';
      siteId: string;
      isActive: boolean;
    };

export type AdminMutationOp = AdminMutation['op'];

/** 누가 요청했는지 — 감사 로그용 */
export interface AdminActor {
  /** 'control' = 중앙 어드민, 'tenant' = 사이트 소유자 */
  scope: 'control' | 'tenant';
  email?: string;
  name?: string;
}

export interface AdminMutationResult {
  ok: boolean;
  op: AdminMutationOp;
  /** 성공 시 갱신된 revision */
  revision?: number;
  error?: { code: AdminErrorCode; message: string };
}

export const ADMIN_MUTATION_OPS = [
  'brand_settings.update',
  'inquiry.update_status',
  'site.set_active',
] as const satisfies readonly AdminMutationOp[];

export function isAdminMutationOp(v: string): v is AdminMutationOp {
  return (ADMIN_MUTATION_OPS as readonly string[]).includes(v);
}
