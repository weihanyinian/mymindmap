export type NodeShape = 'rectangle' | 'rounded' | 'pill' | 'underline' | 'circle';
export type LineType = 'curve' | 'straight' | 'angled' | 'step';
export type MapStructure = 'mindmap' | 'logic' | 'orgchart' | 'fishbone' | 'timeline-h' | 'timeline-v';

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

export interface INodeIcon {
  type: 'priority' | 'progress' | 'task' | 'arrow' | 'flag' | 'star' | 'number';
  value: string; // e.g. '1', '5', 'done', 'flag-red'
}

export interface IRelationship {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
  lineType?: LineType;
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
  hyperlink?: string;
  structure?: MapStructure; // Per-branch structure override
}

export interface IThemeColors {
  rootFill: string;
  rootStroke: string;
  rootFont: string;
  branchFills: string[];
  branchStrokes: string[];
  branchFonts: string[];
  lineColor: string;
  canvasBg: string;
  canvasDot: string;
}

export interface ITheme {
  id: string;
  name: string;
  nameZh: string;
  colors: IThemeColors;
  lineType: LineType;
  nodeShape: NodeShape;
  fontSize: number;
}

export interface IMindMap {
  _id: string;
  userId: string;
  title: string;
  rootNode: IMindMapNode;
  theme: string;
  structure: MapStructure;
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

// ── Defaults ──────────────────────────────────────────────

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

// ── Icon Library ──────────────────────────────────────────

export interface IconDef {
  id: string;
  name: string;
  nameZh: string;
  emoji: string;
  category: 'priority' | 'progress' | 'task' | 'flag' | 'arrow' | 'star' | 'misc';
}

export const ICON_LIBRARY: IconDef[] = [
  // Priority
  { id: 'pri-1', name: 'Priority 1', nameZh: '优先级 1', emoji: '🔴', category: 'priority' },
  { id: 'pri-2', name: 'Priority 2', nameZh: '优先级 2', emoji: '🟠', category: 'priority' },
  { id: 'pri-3', name: 'Priority 3', nameZh: '优先级 3', emoji: '🟡', category: 'priority' },
  { id: 'pri-4', name: 'Priority 4', nameZh: '优先级 4', emoji: '🟢', category: 'priority' },
  { id: 'pri-5', name: 'Priority 5', nameZh: '优先级 5', emoji: '🔵', category: 'priority' },
  // Progress
  { id: 'prog-0', name: '0%', nameZh: '0%', emoji: '⬜', category: 'progress' },
  { id: 'prog-25', name: '25%', nameZh: '25%', emoji: '◐', category: 'progress' },
  { id: 'prog-50', name: '50%', nameZh: '50%', emoji: '🔘', category: 'progress' },
  { id: 'prog-75', name: '75%', nameZh: '75%', emoji: '🟡', category: 'progress' },
  { id: 'prog-100', name: '100%', nameZh: '100%', emoji: '✅', category: 'progress' },
  // Task
  { id: 'task-todo', name: 'To Do', nameZh: '待办', emoji: '⬜', category: 'task' },
  { id: 'task-wip', name: 'In Progress', nameZh: '进行中', emoji: '🔄', category: 'task' },
  { id: 'task-done', name: 'Done', nameZh: '完成', emoji: '✅', category: 'task' },
  { id: 'task-blocked', name: 'Blocked', nameZh: '阻塞', emoji: '🚫', category: 'task' },
  // Flags
  { id: 'flag-red', name: 'Red Flag', nameZh: '红旗', emoji: '🚩', category: 'flag' },
  { id: 'flag-green', name: 'Green Flag', nameZh: '绿旗', emoji: '🏁', category: 'flag' },
  // Stars
  { id: 'star', name: 'Star', nameZh: '星标', emoji: '⭐', category: 'star' },
  { id: 'bookmark', name: 'Bookmark', nameZh: '书签', emoji: '🔖', category: 'star' },
  { id: 'pin', name: 'Pin', nameZh: '图钉', emoji: '📌', category: 'star' },
  // Arrows
  { id: 'arrow-up', name: 'Arrow Up', nameZh: '向上', emoji: '⬆️', category: 'arrow' },
  { id: 'arrow-down', name: 'Arrow Down', nameZh: '向下', emoji: '⬇️', category: 'arrow' },
  { id: 'arrow-right', name: 'Arrow Right', nameZh: '向右', emoji: '➡️', category: 'arrow' },
  // Misc
  { id: 'idea', name: 'Idea', nameZh: '灵感', emoji: '💡', category: 'misc' },
  { id: 'warning', name: 'Warning', nameZh: '警告', emoji: '⚠️', category: 'misc' },
  { id: 'question', name: 'Question', nameZh: '疑问', emoji: '❓', category: 'misc' },
  { id: 'info', name: 'Info', nameZh: '信息', emoji: 'ℹ️', category: 'misc' },
  { id: 'fire', name: 'Hot', nameZh: '热门', emoji: '🔥', category: 'misc' },
  { id: 'cool', name: 'Cool', nameZh: '酷', emoji: '💎', category: 'misc' },
];

// ── Preset Themes ─────────────────────────────────────────

export const PRESET_THEMES: ITheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    nameZh: '经典蓝',
    colors: {
      rootFill: '#1E3A5F', rootStroke: '#1E3A5F', rootFont: '#FFFFFF',
      branchFills: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5'],
      branchStrokes: ['#1E88E5', '#1976D2', '#1565C0', '#0D47A1'],
      branchFonts: ['#0D47A1', '#0D47A1', '#0D47A1', '#0D47A1'],
      lineColor: '#90CAF9', canvasBg: '#F8FAFE', canvasDot: 'rgba(30,58,95,0.06)',
    },
    lineType: 'curve', nodeShape: 'rounded', fontSize: 14,
  },
  {
    id: 'business',
    name: 'Business',
    nameZh: '商务灰',
    colors: {
      rootFill: '#2C3E50', rootStroke: '#2C3E50', rootFont: '#FFFFFF',
      branchFills: ['#ECEFF1', '#CFD8DC', '#B0BEC5', '#90A4AE', '#78909C'],
      branchStrokes: ['#546E7A', '#455A64', '#37474F'],
      branchFonts: ['#263238', '#263238', '#263238', '#263238'],
      lineColor: '#90A4AE', canvasBg: '#FAFAFA', canvasDot: 'rgba(44,62,80,0.05)',
    },
    lineType: 'straight', nodeShape: 'rectangle', fontSize: 14,
  },
  {
    id: 'fresh',
    name: 'Fresh',
    nameZh: '清新绿',
    colors: {
      rootFill: '#2E7D32', rootStroke: '#2E7D32', rootFont: '#FFFFFF',
      branchFills: ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A'],
      branchStrokes: ['#43A047', '#388E3C', '#2E7D32'],
      branchFonts: ['#1B5E20', '#1B5E20', '#1B5E20', '#1B5E20'],
      lineColor: '#A5D6A7', canvasBg: '#F6FBF7', canvasDot: 'rgba(46,125,50,0.06)',
    },
    lineType: 'curve', nodeShape: 'rounded', fontSize: 14,
  },
  {
    id: 'warm',
    name: 'Warm',
    nameZh: '暖阳橙',
    colors: {
      rootFill: '#E65100', rootStroke: '#E65100', rootFont: '#FFFFFF',
      branchFills: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726'],
      branchStrokes: ['#FB8C00', '#F57C00', '#EF6C00'],
      branchFonts: ['#BF360C', '#BF360C', '#BF360C', '#BF360C'],
      lineColor: '#FFCC80', canvasBg: '#FFFBF6', canvasDot: 'rgba(230,81,0,0.06)',
    },
    lineType: 'curve', nodeShape: 'rounded', fontSize: 14,
  },
  {
    id: 'purple',
    name: 'Royal',
    nameZh: '皇家紫',
    colors: {
      rootFill: '#4A148C', rootStroke: '#4A148C', rootFont: '#FFFFFF',
      branchFills: ['#EDE7F6', '#D1C4E9', '#B39DDB', '#9575CD', '#7E57C2'],
      branchStrokes: ['#5E35B1', '#512DA8', '#4527A0'],
      branchFonts: ['#311B92', '#311B92', '#311B92', '#311B92'],
      lineColor: '#B39DDB', canvasBg: '#F9F7FC', canvasDot: 'rgba(74,20,140,0.05)',
    },
    lineType: 'curve', nodeShape: 'pill', fontSize: 14,
  },
  {
    id: 'dark',
    name: 'Dark',
    nameZh: '暗夜黑',
    colors: {
      rootFill: '#6366F1', rootStroke: '#6366F1', rootFont: '#FFFFFF',
      branchFills: ['#1E293B', '#334155', '#475569', '#64748B', '#94A3B8'],
      branchStrokes: ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'],
      branchFonts: ['#E2E8F0', '#F1F5F9', '#F8FAFC', '#FFFFFF'],
      lineColor: '#475569', canvasBg: '#0F172A', canvasDot: 'rgba(255,255,255,0.04)',
    },
    lineType: 'curve', nodeShape: 'rounded', fontSize: 14,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    nameZh: '极简白',
    colors: {
      rootFill: '#111827', rootStroke: '#111827', rootFont: '#FFFFFF',
      branchFills: ['#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB'],
      branchStrokes: ['#D1D5DB', '#9CA3AF', '#6B7280'],
      branchFonts: ['#111827', '#374151', '#4B5563', '#6B7280'],
      lineColor: '#D1D5DB', canvasBg: '#FFFFFF', canvasDot: 'rgba(0,0,0,0.04)',
    },
    lineType: 'straight', nodeShape: 'underline', fontSize: 14,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    nameZh: '海洋蓝',
    colors: {
      rootFill: '#00695C', rootStroke: '#00695C', rootFont: '#FFFFFF',
      branchFills: ['#E0F2F1', '#B2DFDB', '#80CBC4', '#4DB6AC', '#26A69A'],
      branchStrokes: ['#00897B', '#00796B', '#00695C'],
      branchFonts: ['#004D40', '#004D40', '#004D40', '#004D40'],
      lineColor: '#80CBC4', canvasBg: '#F5FBFA', canvasDot: 'rgba(0,105,92,0.05)',
    },
    lineType: 'curve', nodeShape: 'rounded', fontSize: 14,
  },
];

export function getTheme(id: string): ITheme {
  return PRESET_THEMES.find((t) => t.id === id) || PRESET_THEMES[0];
}
