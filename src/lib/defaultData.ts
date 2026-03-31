import type { FlowData } from "./types";

// 이미지처럼 기업 손익 구조 예시
export const corporateData: FlowData = {
  title: "손익 구조",
  unit: "억",
  nodes: [
    // 열 0 — 수입원
    { id: "domestic", name: "국내", color: "#3b82f6" },
    { id: "sea", name: "동남아시아", color: "#93c5fd" },

    // 열 1 — 총매출
    { id: "revenue", name: "매출액", color: "#3b82f6" },

    // 열 2 — 1차 분기
    { id: "op_profit", name: "영업이익", color: "#22c55e" },
    { id: "cogs", name: "매출원가", color: "#dc2626" },
    { id: "sga", name: "판매비와관리비", color: "#b91c1c" },

    // 열 3 — 2차 분기
    { id: "ebt", name: "법인세차감\n전순이익", color: "#16a34a" },
    { id: "non_op_loss", name: "영업외손실", color: "#f97316" },
    { id: "salary", name: "급여", color: "#991b1b" },
    { id: "depreciation", name: "사용권자산\n상각비", color: "#b45309" },
    { id: "outsource", name: "외주용역비", color: "#ca8a04" },
    { id: "fee", name: "지급수수료", color: "#a16207" },
    { id: "other_sga", name: "그 외\n판매관리비", color: "#78350f" },

    // 열 4 — 최종
    { id: "net_income", name: "당기순이익", color: "#15803d" },
    { id: "tax", name: "법인세수익", color: "#4ade80" },
  ],
  links: [
    // 수입원 → 매출액
    { id: "l1", source: "domestic", target: "revenue", value: 297.83 },
    { id: "l2", source: "sea", target: "revenue", value: 8.99 },

    // 매출액 → 1차 분기
    { id: "l3", source: "revenue", target: "op_profit", value: 32.91 },
    { id: "l4", source: "revenue", target: "cogs", value: 109.01 },
    { id: "l5", source: "revenue", target: "sga", value: 164.9 },

    // 영업이익 → 2차
    { id: "l6", source: "op_profit", target: "ebt", value: 7.22 },
    { id: "l7", source: "op_profit", target: "non_op_loss", value: 25.69 },

    // 판관비 → 세부
    { id: "l8", source: "sga", target: "salary", value: 59.7 },
    { id: "l9", source: "sga", target: "depreciation", value: 29.99 },
    { id: "l10", source: "sga", target: "outsource", value: 15.72 },
    { id: "l11", source: "sga", target: "fee", value: 11.98 },
    { id: "l12", source: "sga", target: "other_sga", value: 47.51 },

    // 법차전순이익 → 최종
    { id: "l13", source: "ebt", target: "net_income", value: 3.37 },
    { id: "l14", source: "ebt", target: "tax", value: 3.85 },
  ],
};

// 가계부 예시
export const householdData: FlowData = {
  title: "월간 가계부",
  unit: "만원",
  nodes: [
    // 수입
    { id: "salary", name: "급여", color: "#22c55e" },
    { id: "side", name: "부업", color: "#16a34a" },
    { id: "invest_in", name: "투자수익", color: "#15803d" },

    // 총계
    { id: "total", name: "총수입", color: "#1e293b" },

    // 지출 대분류
    { id: "fixed", name: "고정지출", color: "#dc2626" },
    { id: "living", name: "생활비", color: "#b91c1c" },
    { id: "saving", name: "저축/투자", color: "#3b82f6" },

    // 고정지출 세부
    { id: "housing", name: "주거비", color: "#ef4444" },
    { id: "insurance", name: "보험", color: "#f87171" },
    { id: "telecom", name: "통신비", color: "#fca5a5" },

    // 생활비 세부
    { id: "food", name: "식비", color: "#f97316" },
    { id: "transport", name: "교통비", color: "#fb923c" },
    { id: "shopping", name: "쇼핑", color: "#fdba74" },
    { id: "leisure", name: "여가", color: "#fcd34d" },
    { id: "other", name: "기타", color: "#d1d5db" },
  ],
  links: [
    // 수입 → 총계
    { id: "l1", source: "salary", target: "total", value: 350 },
    { id: "l2", source: "side", target: "total", value: 80 },
    { id: "l3", source: "invest_in", target: "total", value: 30 },

    // 총계 → 대분류
    { id: "l4", source: "total", target: "fixed", value: 140 },
    { id: "l5", source: "total", target: "living", value: 160 },
    { id: "l6", source: "total", target: "saving", value: 160 },

    // 고정지출 → 세부
    { id: "l7", source: "fixed", target: "housing", value: 100 },
    { id: "l8", source: "fixed", target: "insurance", value: 30 },
    { id: "l9", source: "fixed", target: "telecom", value: 10 },

    // 생활비 → 세부
    { id: "l10", source: "living", target: "food", value: 60 },
    { id: "l11", source: "living", target: "transport", value: 20 },
    { id: "l12", source: "living", target: "shopping", value: 40 },
    { id: "l13", source: "living", target: "leisure", value: 30 },
    { id: "l14", source: "living", target: "other", value: 10 },
  ],
};

export const defaultData = householdData;
