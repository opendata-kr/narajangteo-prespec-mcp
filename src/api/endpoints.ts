export type Kind = "cnstwk" | "servc" | "thng" | "frgcpt";

export const ALL_KINDS: readonly Kind[] = ["cnstwk", "servc", "thng", "frgcpt"];

export const KIND_LABEL: Record<Kind, string> = {
  cnstwk: "공사",
  servc: "용역",
  thng: "물품",
  frgcpt: "외자",
};

const SUFFIX: Record<Kind, string> = {
  cnstwk: "Cnstwk",
  servc: "Servc",
  thng: "Thng",
  frgcpt: "Frgcpt",
};

// 사전규격 오퍼레이션은 접두 getPublicPrcureThngInfo/getInsttAcctoThngListInfo/
// getThngDetailMetaInfo/getPublicPrcureThngOpinionInfo가 고정이고 업무구분 접미가 뒤에 붙는다.
// (여기서 Thng은 "물품"이 아니라 접두어의 일부다: ...ThngInfoFrgcpt = 외자)
export function listOp(kind: Kind): string {
  return `getPublicPrcureThngInfo${SUFFIX[kind]}`;
}
export function byInstitutionOp(kind: Kind): string {
  return `getInsttAcctoThngListInfo${SUFFIX[kind]}`;
}
export function byProductOp(kind: Kind): string {
  return `getThngDetailMetaInfo${SUFFIX[kind]}`;
}
export function advancedOp(kind: Kind): string {
  return `getPublicPrcureThngInfo${SUFFIX[kind]}PPSSrch`;
}
export function opinionOp(kind: Kind): string {
  return `getPublicPrcureThngOpinionInfo${SUFFIX[kind]}`;
}
