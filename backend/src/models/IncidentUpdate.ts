import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IIncidentUpdate extends Document {
  incident_id: Types.ObjectId;
  message: string;
  author_name: string;
  created_at: Date;
}

const IncidentUpdateSchema = new Schema<IIncidentUpdate>({
  incident_id: { type: Schema.Types.ObjectId, ref: 'Incident', required: true },
  message: { type: String, required: true },
  author_name: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export const IncidentUpdate = mongoose.model<IIncidentUpdate>('IncidentUpdate', IncidentUpdateSchema);