import { User } from '../models/User';
import { MindMap } from '../models/MindMap';
import { nanoid } from 'nanoid';

export async function seedAdminUser() {
  const existing = await User.findOne({ username: 'admin' });
  if (existing) return existing;

  const admin = await User.create({
    username: 'admin',
    password: '123456',
  });

  // Create a demo mind map for admin
  await createDemoMap(admin._id.toString());

  console.log('Admin account created: admin / 123456');
  return admin;
}

async function createDemoMap(userId: string) {
  const rootNode = {
    id: nanoid(8),
    title: '🌳 MindFlow 入门指南',
    children: [
      {
        id: nanoid(8),
        title: '🚀 快速上手',
        children: [
          { id: nanoid(8), title: '双击节点编辑文字', children: [], position: { x: 0, y: 0 }, style: defaultStyle(), collapsed: false, notes: '', labels: [], icons: [] },
          { id: nanoid(8), title: '按 Tab 键添加子节点', children: [], position: { x: 0, y: 0 }, style: defaultStyle(), collapsed: false, notes: '', labels: [], icons: [] },
          { id: nanoid(8), title: '按 Enter 键添加同级节点', children: [], position: { x: 0, y: 0 }, style: defaultStyle(), collapsed: false, notes: '', labels: [], icons: [] },
        ],
        position: { x: 0, y: 0 },
        style: { ...defaultStyle(), fillColor: '#E3F2FD', strokeColor: '#1E88E5' },
        collapsed: false,
        notes: '',
        labels: [],
        icons: [],
      },
      {
        id: nanoid(8),
        title: '🎨 样式定制',
        children: [
          { id: nanoid(8), title: '选中节点后在右侧面板修改颜色', children: [], position: { x: 0, y: 0 }, style: defaultStyle(), collapsed: false, notes: '', labels: [], icons: [] },
          { id: nanoid(8), title: '支持矩形、圆角、胶囊、下划线四种形状', children: [], position: { x: 0, y: 0 }, style: defaultStyle(), collapsed: false, notes: '', labels: [], icons: [] },
          { id: nanoid(8), title: '可切换曲线、直线、折线连接方式', children: [], position: { x: 0, y: 0 }, style: defaultStyle(), collapsed: false, notes: '', labels: [], icons: [] },
        ],
        position: { x: 0, y: 0 },
        style: { ...defaultStyle(), fillColor: '#FCE4EC', strokeColor: '#E91E63' },
        collapsed: false,
        notes: '',
        labels: [],
        icons: [],
      },
      {
        id: nanoid(8),
        title: '💡 实用技巧',
        children: [
          { id: nanoid(8), title: '拖拽节点可以调整层级结构', children: [], position: { x: 0, y: 0 }, style: defaultStyle(), collapsed: false, notes: '', labels: [], icons: [] },
          { id: nanoid(8), title: '点击节点的 +/- 按钮折叠/展开分支', children: [], position: { x: 0, y: 0 }, style: defaultStyle(), collapsed: false, notes: '', labels: [], icons: [] },
          { id: nanoid(8), title: 'Ctrl+Z 撤销，Ctrl+Y 重做', children: [], position: { x: 0, y: 0 }, style: defaultStyle(), collapsed: false, notes: '', labels: [], icons: [] },
          { id: nanoid(8), title: 'Ctrl+S 手动保存', children: [], position: { x: 0, y: 0 }, style: defaultStyle(), collapsed: false, notes: '', labels: [], icons: [] },
        ],
        position: { x: 0, y: 0 },
        style: { ...defaultStyle(), fillColor: '#E8F5E9', strokeColor: '#43A047' },
        collapsed: false,
        notes: '',
        labels: [],
        icons: [],
      },
      {
        id: nanoid(8),
        title: '📤 导出功能',
        children: [
          { id: nanoid(8), title: '导出为 JSON 用于备份和分享', children: [], position: { x: 0, y: 0 }, style: defaultStyle(), collapsed: false, notes: '', labels: [], icons: [] },
          { id: nanoid(8), title: '导出为 PNG 图片用于演示', children: [], position: { x: 0, y: 0 }, style: defaultStyle(), collapsed: false, notes: '', labels: [], icons: [] },
          { id: nanoid(8), title: '导出为 Markdown 用于文档', children: [], position: { x: 0, y: 0 }, style: defaultStyle(), collapsed: false, notes: '', labels: [], icons: [] },
        ],
        position: { x: 0, y: 0 },
        style: { ...defaultStyle(), fillColor: '#FFF3E0', strokeColor: '#FB8C00' },
        collapsed: false,
        notes: '',
        labels: [],
        icons: [],
      },
    ],
    position: { x: 0, y: 0 },
    style: { ...defaultStyle(), fillColor: '#EDE7F6', strokeColor: '#5E35B1', fontSize: 18 },
    collapsed: false,
    notes: '欢迎使用 MindFlow！这是一个功能强大的思维导图工具。',
    labels: [],
    icons: [],
  };

  await MindMap.create({
    userId,
    title: '入门指南',
    rootNode,
    theme: 'classic',
    structure: 'logic',
  });
}

function defaultStyle() {
  return {
    fillColor: '#FFFFFF',
    strokeColor: '#4A90D9',
    fontColor: '#333333',
    fontSize: 14,
    shape: 'rounded' as const,
    lineType: 'curve' as const,
    lineColor: '#B0BEC5',
    lineWidth: 2,
  };
}
