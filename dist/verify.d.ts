/**
 * 응답 검증 — 프로젝트가 계약을 지키는지 런타임에 확인한다.
 *
 * 중앙 어드민이 각 프로젝트 응답을 받을 때 쓰거나,
 * 함대 점검 스크립트에서 25개 엔드포인트를 훑을 때 쓴다.
 * 타입은 컴파일 타임에만 존재하므로, 남의 서버가 보낸 JSON은 이걸로 걸러야 한다.
 */
export interface VerifyResult {
    ok: boolean;
    /** 계약 위반 항목 */
    problems: string[];
    /** 신규 필드를 갖춘 응답인지 */
    isProtocolAware: boolean;
}
export declare function verifyAdminResponse(raw: unknown): VerifyResult;
//# sourceMappingURL=verify.d.ts.map