import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Investigating' | 'Resolved';
  reporter_name: string;
  latest_update: string | null;
  created_at: Date;
  updated_at: Date;
}

const IncidentSchema = new Schema<IIncident>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: { 
    type: String, 
    enum: ['Open', 'Investigating', 'Resolved'],
    default: 'Open'
  },
  reporter_name: { type: String, required: true },
  latest_update: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Incident = mongoose.model<IIncident>('Incident', IncidentSchema);