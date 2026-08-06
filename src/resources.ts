/**
 * 리소스 정의 — `?resource=` 로 조회할 수 있는 것들.
 *
 * 현재 faneasy가 실제로 제공하는 8종을 그대로 승계하고, brand_settings를 신규로 더한다.
 * 새 리소스를 추가할 때는 여기에 이름과 형태를 먼저 정의한다.
 */

/** 사이트 한 건 (멀티테넌트 프로젝트에서 관리하는 개별 사이트) */
export interface SiteSummary {
  id: string;
  name: string;
  subdomain?: string | null;
  domain?: string | null;
  ownerEmail?: string | null;
  status: 'active' | 'inactive' | 'pending';
  isActive: boolean;
  category?: string;
  plan?: string;
  /** ISO 8601. 코드 배포로 생성되는 사이트는 null */
  createdAt?: string | null;
}

/** 어드민 접근 승인 대기 */
export interface ApprovalRecord {
  id: string;
  name: string;
  subdomain?: string | null;
  ownerEmail?: string | null;
  status: string;
  createdAt?: string | null;
}

/** 문의 한 건 */
export interface InquiryRecord {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  siteDomain?: string | null;
  site?: string | null;
  /** 'apply' | 'partner' | 'contact' 등 사이트별 문의 종류 */
  kind?: string | null;
  workflowStatus?: string | null;
  message?: string | null;
  createdAt?: string | null;
}

/** 플랫폼 전체 집계 */
export interface PlatformStats {
  totalSites: number;
  activeSites: number;
  totalUsers: number;
  totalInquiries: number;
  pendingInquiries: number;
}

/** 사이트별 방문·전환 지표 */
export interface SiteStats {
  id: string;
  site: string;
  todayVisits: number;
  totalVisits: number;
  totalInquiries: number;
  conversionRate: number | null;
}

/** 인스타그램 연동 토큰 상태 */
export interface InstagramToken {
  siteId: string;
  username?: string | null;
  hasToken: boolean;
  expiresAt?: string | null;
  isExpired?: boolean;
  isExpiringSoon?: boolean;
}

/** 활동 로그 */
export interface ActivityLog {
  id: string;
  site?: string | null;
  actor?: string | null;
  action: string;
  detail?: string | null;
  createdAt?: string | null;
}

/** GA4 일별 지표 */
export interface GaStats {
  date: string;
  users: number;
  views: number;
  sessions: number;
}

/** 브랜드 설정 — 어드민에서 배포 없이 바꾸는 항목 (신규) */
export type BrandFont =
  | 'pretendard'
  | 'noto-sans-kr'
  | 'gmarket-sans'
  | 'suit'
  | 'system';

export interface BrandSettings {
  siteId: string;
  /** '#RRGGBB' */
  primaryColor: string;
  accentColor?: string;
  /** 자유 입력 금지 — 화이트리스트만 허용 */
  fontFamily: BrandFont;
  logoUrl?: string;
  faviconUrl?: string;
  bannerUrl?: string;
  hero?: {
    title?: string;
    subtitle?: string;
    ctaLabel?: string;
    ctaHref?: string;
  };
  /** 낙관적 동시성 — 테넌트와 컨트롤이 동시에 고칠 때 충돌 감지 */
  revision: number;
  updatedAt?: string;
  updatedBy?: string;
}

/** 리소스 이름 → 응답 형태 매핑 */
export interface AdminResourceMap {
  sites: SiteSummary[];
  approvals: ApprovalRecord[];
  inquiries: InquiryRecord[];
  stats: PlatformStats;
  site_stats: SiteStats[];
  instagram: InstagramToken[];
  activity_logs: ActivityLog[];
  ga_stats: GaStats[];
  brand_settings: BrandSettings;
}

export type AdminResourceName = keyof AdminResourceMap;

/** 런타임 검증용 — 알 수 없는 리소스 이름을 거를 때 쓴다 */
export const ADMIN_RESOURCE_NAMES = [
  'sites',
  'approvals',
  'inquiries',
  'stats',
  'site_stats',
  'instagram',
  'activity_logs',
  'ga_stats',
  'brand_settings',
] as const satisfies readonly AdminResourceName[];

export function isAdminResourceName(v: string): v is AdminResourceName {
  return (ADMIN_RESOURCE_NAMES as readonly string[]).includes(v);
}
