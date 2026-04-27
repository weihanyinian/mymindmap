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
