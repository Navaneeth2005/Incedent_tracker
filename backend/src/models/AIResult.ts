import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAIResult extends Document {
  incident_id: Types.ObjectId;
  type: 'summary' | 'actions' | 'priority_review';
  result_text: string;
  created_at: Date;
}

const AIResultSchema = new Schema<IAIResult>({
  incident_id: { type: Schema.Types.ObjectId, ref: 'Incident', required: true },
  type: { 
    type: String, 
    enum: ['summary', 'actions', 'priority_review'],
    required: true 
  },
  result_text: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export const AIResult = mongoose.model<IAIResult>('AIResult', AIResultSchema);