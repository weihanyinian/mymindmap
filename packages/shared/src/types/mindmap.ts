export type NodeShape = 'rectangle' | 'rounded' | 'pill' | 'underline';
export type LineType = 'curve' | 'straight' | 'angled';

export interface INodeStyle {
  fillColor: string;
  strokeColor: string;
  fontColor: string;
  fontSize: number;
  shape: NodeShape;
  lineType: LineType;
  lineColor: string;
  lineWidth: number;
}

export interface IMindMapNode {
  id: string;
  title: string;
  children: IMindMapNode[];
  position: { x: number; y: number };
  style: INodeStyle;
  collapsed: boolean;
  notes: string;
  labels: string[];
  icons: string[];
  image?: string;
}

export interface IMindMap {
  _id: string;
  userId: string;
  title: string;
  rootNode: IMindMapNode;
  theme: string;
  isPublic: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface IMindMapSummary {
  _id: string;
  title: string;
  rootNodeTitle: string;
  nodeCount: number;
  updatedAt: string;
  createdAt: string;
}

export const DEFAULT_NODE_STYLE: INodeStyle = {
  fillColor: '#FFFFFF',
  strokeColor: '#4A90D9',
  fontColor: '#333333',
  fontSize: 14,
  shape: 'rounded',
  lineType: 'curve',
  lineColor: '#B0BEC5',
  lineWidth: 2,
};

export const NODE_COLOR_PALETTE = [
  { fillColor: '#E3F2FD', strokeColor: '#1E88E5', fontColor: '#1565C0' },
  { fillColor: '#FCE4EC', strokeColor: '#E91E63', fontColor: '#AD1457' },
  { fillColor: '#E8F5E9', strokeColor: '#43A047', fontColor: '#2E7D32' },
  { fillColor: '#FFF3E0', strokeColor: '#FB8C00', fontColor: '#E65100' },
  { fillColor: '#EDE7F6', strokeColor: '#7B1FA2', fontColor: '#6A1B9A' },
  { fillColor: '#E0F7FA', strokeColor: '#00ACC1', fontColor: '#00838F' },
  { fillColor: '#FFF8E1', strokeColor: '#FFB300', fontColor: '#FF8F00' },
  { fillColor: '#F1F8E9', strokeColor: '#689F38', fontColor: '#33691E' },
  { fillColor: '#FBE9E7', strokeColor: '#E64A19', fontColor: '#BF360C' },
  { fillColor: '#E8EAF6', strokeColor: '#3949AB', fontColor: '#1A237E' },
];
