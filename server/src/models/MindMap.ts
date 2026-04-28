import { Schema, model, type Document, Types } from 'mongoose';

export interface IMindMapDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  rootNode: IMindMapNodeDoc;
  theme: string;
  structure: string;
  isPublic: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMindMapNodeDoc {
  id: string;
  title: string;
  children: IMindMapNodeDoc[];
  position: { x: number; y: number };
  style: {
    fillColor: string;
    strokeColor: string;
    fontColor: string;
    fontSize: number;
    shape: string;
    lineType: string;
    lineColor: string;
    lineWidth: number;
  };
  collapsed: boolean;
  notes: string;
  labels: string[];
  icons: string[];
  image?: string;
  hyperlink?: string;
  structure?: string;
}

const nodeStyleSchema = new Schema(
  {
    fillColor: { type: String, default: '#FFFFFF' },
    strokeColor: { type: String, default: '#4A90D9' },
    fontColor: { type: String, default: '#333333' },
    fontSize: { type: Number, default: 14, min: 8, max: 72 },
    shape: { type: String, enum: ['rectangle', 'rounded', 'pill', 'underline', 'circle'], default: 'rounded' },
    lineType: { type: String, enum: ['curve', 'straight', 'angled', 'step'], default: 'curve' },
    lineColor: { type: String, default: '#B0BEC5' },
    lineWidth: { type: Number, default: 2, min: 1, max: 10 },
  },
  { _id: false }
);

const mindMapNodeSchema = new Schema<IMindMapNodeDoc>(
  {
    id: { type: String, required: true },
    title: { type: String, default: 'New Topic', maxlength: 500 },
    children: { type: [], default: [] },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    style: { type: nodeStyleSchema, default: () => ({}) },
    collapsed: { type: Boolean, default: false },
    notes: { type: String, default: '', maxlength: 10000 },
    labels: [{ type: String }],
    icons: [{ type: String }],
    image: { type: String },
    hyperlink: { type: String },
    structure: { type: String },
  },
  { _id: false, timestamps: true }
);

// Recursive: children are also MindMapNodeDocs
mindMapNodeSchema.add({ children: [mindMapNodeSchema] });

const mindMapSchema = new Schema<IMindMapDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    rootNode: { type: mindMapNodeSchema, required: true },
    theme: { type: String, default: 'classic' },
    structure: { type: String, default: 'logic' },
    isPublic: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

mindMapSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(_doc: any, ret: any) {
    ret._id = String(ret._id);
    ret.userId = String(ret.userId);
    delete ret.__v;
    return ret;
  },
});

export const MindMap = model<IMindMapDocument>('MindMap', mindMapSchema);
