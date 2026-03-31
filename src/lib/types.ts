export interface FlowNode {
  id: string;
  name: string;
  color?: string;
}

export interface FlowLink {
  id: string;
  source: string;
  target: string;
  value: number;
}

export interface FlowData {
  title: string;
  unit: string;
  nodes: FlowNode[];
  links: FlowLink[];
}

// legacy — kept for backward compat if needed
export interface Category {
  id: string;
  name: string;
  amount: number;
}
