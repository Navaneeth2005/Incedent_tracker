import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Determine production URLs
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production' || FRONTEND_URL.includes('vercel.app');

// Socket.IO CORS - allow Vercel + localhost
const socketIOConfig = isProduction
  ? {
      cors: {
        origin: FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
      }
    }
  : {
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    };

const io = new Server(httpServer, socketIOConfig);

// CORS for Express
const allowedOrigins = isProduction
  ? [FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// ================= DATABASE =================

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not set in environment variables');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Atlas Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', (error as Error).message);
    process.exit(1);
  }
};

// ================= MODELS =================

import { Incident } from './models/Incident.js';
import { IncidentUpdate } from './models/IncidentUpdate.js';
import { AIResult } from './models/AIResult.js';
import { generateAISummary, generateAIActions, generatePriorityReview } from './services/aiService.js';

// Helper to convert MongoDB _id to id
const toIncident = (doc: any) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  return { ...obj, id: obj._id?.toString() };
};

// ================= HEALTH CHECK =================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ================= GET ALL INCIDENTS =================

app.get('/api/incidents', async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    let query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reporter_name: { $regex: search, $options: 'i' } }
      ];
    }

    const incidents = await Incident.find(query).sort({ created_at: -1 });
    res.json(incidents.map(toIncident));
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// ================= CREATE INCIDENT =================

app.post('/api/incidents', async (req, res) => {
  try {
    const { title, description, priority, reporter_name } = req.body;

    if (!title || !reporter_name) {
      return res.status(400).json({ error: 'Title and reporter name are required' });
    }

    const incident = new Incident({
      title,
      description: description || '',
      priority: priority || 'Medium',
      status: 'Open',
      reporter_name,
      latest_update: null,
      created_at: new Date(),
      updated_at: new Date()
    });

    await incident.save();
    const savedIncident = await Incident.findById(incident._id);

    io.emit('incident_created', toIncident(savedIncident));
    res.status(201).json(toIncident(savedIncident));
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// ================= GET SINGLE INCIDENT =================

app.get('/api/incidents/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(toIncident(incident));
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// ================= GET INCIDENT DETAILS =================

app.get('/api/incidents/:id/details', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const updates = await IncidentUpdate.find({ incident_id: incident._id }).sort({ created_at: 1 });
    const ai_results = await AIResult.find({ incident_id: incident._id }).sort({ created_at: -1 });

    res.json({
      ...toIncident(incident),
      updates: updates.map((u: any) => ({ ...u.toObject(), id: u._id.toString() })),
      ai_results: ai_results.map((a: any) => ({ ...a.toObject(), id: a._id.toString() }))
    });
  } catch (error) {
    console.error('Error fetching incident details:', error);
    res.status(500).json({ error: 'Failed to fetch incident details' });
  }
});

// ================= UPDATE STATUS =================

app.patch('/api/incidents/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Open', 'Investigating', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status, updated_at: new Date() },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    io.emit('incident_updated', toIncident(incident));
    io.emit('status_changed', { incident_id: incident._id.toString(), status });

    res.json(toIncident(incident));
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ================= POST UPDATE =================

app.post('/api/incidents/:id/update', async (req, res) => {
  try {
    const { message, author_name } = req.body;

    if (!message || !author_name) {
      return res.status(400).json({ error: 'Message and author name are required' });
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const update = new IncidentUpdate({
      incident_id: incident._id,
      message,
      author_name,
      created_at: new Date()
    });

    await update.save();

    await Incident.findByIdAndUpdate(req.params.id, {
      latest_update: message,
      updated_at: new Date()
    });

    const updatedIncident = await Incident.findById(req.params.id);

    io.emit('incident_updated', toIncident(updatedIncident));
    io.emit('new_update', {
      incident_id: incident._id.toString(),
      update: { ...update.toObject(), id: update._id.toString() }
    });

    res.status(201).json({ ...update.toObject(), id: update._id.toString() });
  } catch (error) {
    console.error('Error posting update:', error);
    res.status(500).json({ error: 'Failed to post update' });
  }
});

// ================= AI ENDPOINTS =================

app.post('/api/incidents/:id/ai-summary', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const summaryText = await generateAISummary({
      title: incident.title,
      description: incident.description,
      priority: incident.priority
    });

    const aiResult = new AIResult({
      incident_id: incident._id,
      type: 'summary',
      result_text: summaryText,
      created_at: new Date()
    });

    await aiResult.save();
    res.json({ ...aiResult.toObject(), id: aiResult._id.toString() });
  } catch (error) {
    console.error('Error generating AI summary:', error);
    res.status(500).json({ error: 'Failed to generate AI summary' });
  }
});

app.post('/api/incidents/:id/ai-actions', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const actionsText = await generateAIActions({
      title: incident.title,
      description: incident.description,
      priority: incident.priority
    });

    const aiResult = new AIResult({
      incident_id: incident._id,
      type: 'actions',
      result_text: actionsText,
      created_at: new Date()
    });

    await aiResult.save();
    res.json({ ...aiResult.toObject(), id: aiResult._id.toString() });
  } catch (error) {
    console.error('Error generating AI actions:', error);
    res.status(500).json({ error: 'Failed to generate AI actions' });
  }
});

app.post('/api/incidents/:id/ai-priority', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const priorityText = await generatePriorityReview({
      title: incident.title,
      description: incident.description,
      priority: incident.priority
    });

    const aiResult = new AIResult({
      incident_id: incident._id,
      type: 'priority_review',
      result_text: priorityText,
      created_at: new Date()
    });

    await aiResult.save();
    res.json({ ...aiResult.toObject(), id: aiResult._id.toString() });
  } catch (error) {
    console.error('Error generating AI priority review:', error);
    res.status(500).json({ error: 'Failed to generate AI priority review' });
  }
});

// ================= SOCKET.IO =================

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ================= START SERVER =================

const PORT = parseInt(process.env.PORT || '3001', 10);

const startServer = async () => {
  await connectDB();

  // Bind to 0.0.0.0 for production (Render)
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║  🚀 Server running on port ${PORT}                      ║
║  📡 Socket.IO enabled                               ║
║  🌐 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}                         ║
║  🔗 CORS allowed: ${allowedOrigins.join(', ')}  ║
╚═══════════════════════════════════════════════════╝
    `);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});