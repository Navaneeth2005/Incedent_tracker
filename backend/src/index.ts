import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import { Incident } from './models/Incident.js';
import { IncidentUpdate } from './models/IncidentUpdate.js';
import { AIResult } from './models/AIResult.js';

import {
  generateAISummary,
  generateAIActions,
  generatePriorityReview
} from './services/aiService.js';

const app = express();
const httpServer = createServer(app);

// ================= SOCKET.IO =================

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// ================= MIDDLEWARE =================

app.use(cors());
app.use(express.json());

// ================= ENV =================

const PORT = process.env.PORT || 3001;

// ================= DATABASE =================

const connectDB = async () => {
  try {
    console.log('Mongo URI:', process.env.MONGODB_URI);

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Helper to convert MongoDB _id to id
const toIncident = (doc: any) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  return { ...obj, id: obj._id?.toString() };
};

// ================= HEALTH CHECK =================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
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
        {
          title: {
            $regex: search,
            $options: 'i'
          }
        },
        {
          description: {
            $regex: search,
            $options: 'i'
          }
        },
        {
          reporter_name: {
            $regex: search,
            $options: 'i'
          }
        }
      ];
    }

    const incidents = await Incident.find(query).sort({
      created_at: -1
    });

    res.json(incidents.map(toIncident));
  } catch (error) {
    console.error('Error fetching incidents:', error);

    res.status(500).json({
      error: 'Failed to fetch incidents'
    });
  }
});

// ================= CREATE INCIDENT =================

app.post('/api/incidents', async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      reporter_name
    } = req.body;

    if (!title || !reporter_name) {
      return res.status(400).json({
        error: 'Title and reporter name are required'
      });
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

    io.emit('incident_created', savedIncident);

    res.status(201).json(savedIncident);
  } catch (error) {
    console.error('Error creating incident:', error);

    res.status(500).json({
      error: 'Failed to create incident'
    });
  }
});

// ================= GET SINGLE INCIDENT =================

app.get('/api/incidents/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found'
      });
    }

    res.json(toIncident(incident));
  } catch (error) {
    console.error('Error fetching incident:', error);

    res.status(500).json({
      error: 'Failed to fetch incident'
    });
  }
});

// ================= GET INCIDENT DETAILS =================

app.get('/api/incidents/:id/details', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found'
      });
    }

    const updates = await IncidentUpdate.find({
      incident_id: incident._id
    }).sort({
      created_at: 1
    });

    const ai_results = await AIResult.find({
      incident_id: incident._id
    }).sort({
      created_at: -1
    });

    res.json({
      ...incident.toObject(),
      updates,
      ai_results
    });
  } catch (error) {
    console.error('Error fetching incident details:', error);

    res.status(500).json({
      error: 'Failed to fetch incident details'
    });
  }
});

// ================= UPDATE INCIDENT STATUS =================

app.patch('/api/incidents/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !['Open', 'Investigating', 'Resolved'].includes(status)
    ) {
      return res.status(400).json({
        error: 'Invalid status value'
      });
    }

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        status,
        updated_at: new Date()
      },
      {
        new: true
      }
    );

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found'
      });
    }

    io.emit('incident_updated', incident);

    io.emit('status_changed', {
      incident_id: incident._id,
      status
    });

    res.json(toIncident(incident));
  } catch (error) {
    console.error('Error updating status:', error);

    res.status(500).json({
      error: 'Failed to update status'
    });
  }
});

// ================= POST INCIDENT UPDATE =================

app.post('/api/incidents/:id/update', async (req, res) => {
  try {
    const { message, author_name } = req.body;

    if (!message || !author_name) {
      return res.status(400).json({
        error: 'Message and author name are required'
      });
    }

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found'
      });
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

    io.emit('incident_updated', updatedIncident);

    io.emit('new_update', {
      incident_id: incident._id,
      update: {
        ...update.toObject(),
        _id: update._id
      }
    });

    res.status(201).json(update);
  } catch (error) {
    console.error('Error posting update:', error);

    res.status(500).json({
      error: 'Failed to post update'
    });
  }
});

// ================= AI SUMMARY =================

app.post('/api/incidents/:id/ai-summary', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found'
      });
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

    res.json(aiResult);
  } catch (error) {
    console.error('Error generating AI summary:', error);

    res.status(500).json({
      error: 'Failed to generate AI summary'
    });
  }
});

// ================= AI ACTIONS =================

app.post('/api/incidents/:id/ai-actions', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found'
      });
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

    res.json(aiResult);
  } catch (error) {
    console.error('Error generating AI actions:', error);

    res.status(500).json({
      error: 'Failed to generate AI actions'
    });
  }
});

// ================= AI PRIORITY REVIEW =================

app.post('/api/incidents/:id/ai-priority', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found'
      });
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

    res.json(aiResult);
  } catch (error) {
    console.error('Error generating AI priority review:', error);

    res.status(500).json({
      error: 'Failed to generate AI priority review'
    });
  }
});

// ================= SOCKET EVENTS =================

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ================= START SERVER =================

const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📡 Socket.IO enabled');

    console.log(
      `🧠 AI Mode: ${
        process.env.OPENAI_API_KEY
          ? 'OpenAI Connected'
          : 'Fallback Mode'
      }`
    );
  });
};

startServer();